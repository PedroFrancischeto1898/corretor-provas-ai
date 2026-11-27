import test,{after} from "node:test";
import assert from "node:assert/strict";
import {mkdtemp,readFile,writeFile,copyFile,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {pathToFileURL} from "node:url";
import ts from "typescript";

// Executa os módulos de produção em um diretório isolado, sem Next.js e sem API.
// O transpile não substitui a checagem de tipos e o build completo.
const dir=await mkdtemp(join(tmpdir(),"grading-022-"));
after(()=>rm(dir,{recursive:true,force:true}));
const source=new URL("../src/lib/grading/",import.meta.url);
for(const name of ["scoring-core.mjs","reference-core.mjs","decision-core.mjs"]) await copyFile(new URL(name,source),join(dir,name));
for(const name of ["errors","scoring","validation"]){
    const code=await readFile(new URL(name+".ts",source),"utf8");
    const compiled=ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,verbatimModuleSyntax:true},reportDiagnostics:true});
    assert.equal(compiled.diagnostics?.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
    const runtime=compiled.outputText.replaceAll('from "./errors"','from "./errors.mjs"');
    await writeFile(join(dir,name+".mjs"),runtime);
}
const {finalizeGradingScores}=await import(pathToFileURL(join(dir,"scoring.mjs")).href);
const {parseGradeRequest}=await import(pathToFileURL(join(dir,"validation.mjs")).href);
const {referenceSourceHash}=await import(pathToFileURL(join(dir,"reference-core.mjs")).href);

import {plan,judge,calibration} from "./fixtures/structured-decision.mjs";
const guidance="Identifique três fatores de mesmo valor e elabore duas análises.";
const rubric=[{id:"c1",description:"Identificação",points:4.5},{id:"c2",description:"Análise",points:2.5},{id:"c3",description:"Proposição",points:3}];
const row=(c,mode,n)=>({criterionId:c.id,demand:c.description,essentials:[c.description],equivalents:[],optional:[],mode,expectedCount:n,ambiguity:null,boundary:"Demonstrar a operação solicitada.",decisionPlan:mode==="qualitative"?plan:null,calibration:mode==="qualitative"?calibration:null});
const reference={sourceHash:referenceSourceHash(guidance,rubric),criteria:[row(rubric[0],"count",3),row(rubric[1],"qualitative",null),row(rubric[2],"qualitative",null)]};
const item=concept=>({concept,evidence:"Evidência "+concept});
const qualitative=(id,percent,upper=null)=>({criterionId:id,evidence:percent===0?[]:["Evidência válida."],gaps:percent===100?[]:["Limitação."],errors:[],validItems:[],judgment:judge(percent,upper),analysis:"Justificativa."});
const response=()=>({studentName:null,registration:null,questionNumber:"1",criteriaAnalysis:[{criterionId:"c1",evidence:[],gaps:["Falta item."],errors:[],validItems:[item("a"),item("b")],judgment:null,analysis:"Dois fatores."},qualitative("c2",75),qualitative("c3",90)],strengths:[],improvements:[],overallAnalysis:"Síntese.",feedback:"Devolutiva.",gradingConfidence:1,needsHumanReview:false,reviewReason:null});
const score=r=>finalizeGradingScores(rubric,r,reference);
const provisional=r=>{const s=score(r);assert.equal(s.needsHumanReview,true);assert.equal(s.score,null);assert.ok(s.reviewReason);return s};
test("integra contagem e decisão em escala de 10",()=>{const s=score(response());assert.deepEqual(s.criteriaAnalysis.map(c=>c.awardedPoints),[3,1.88,2.7]);assert.equal(s.score,7.58);assert.equal(s.maxScore,10)});
test("zero e máximo possíveis",()=>{const r=response();r.criteriaAnalysis[0].validItems=[];r.criteriaAnalysis[1]=qualitative("c2",0);r.criteriaAnalysis[2]=qualitative("c3",0);assert.equal(score(r).score,0);r.criteriaAnalysis[0].validItems=[item("a"),item("b"),item("c")];r.criteriaAnalysis[0].gaps=[];r.criteriaAnalysis[1]=qualitative("c2",100);r.criteriaAnalysis[2]=qualitative("c3",100);assert.equal(score(r).score,10)});
test("repetição de item não soma",()=>{const r=response();r.criteriaAnalysis[0].validItems.push(item(" A "));assert.equal(provisional(r).criteriaAnalysis[0].awardedPoints,3)});
test("crédito sem evidência",()=>{const r=response();r.criteriaAnalysis[1].evidence=[];provisional(r)});
test("zero com evidência",()=>{const r=response();r.criteriaAnalysis[1].judgment=judge(0);provisional(r)});
test("pleno com lacuna",()=>{const r=response();r.criteriaAnalysis[1].judgment=judge(100);provisional(r)});
test("incerteza material",()=>{const r=response();r.criteriaAnalysis[1].judgment=judge(50,100);assert.match(provisional(r).reviewReason,/intervalo possível/)});
test("revisão indicada pelo modelo",()=>{const r=response();r.needsHumanReview=true;r.reviewReason="Trecho ilegível";assert.match(provisional(r).reviewReason,/Trecho ilegível/)});
test("motivo contraditório",()=>{const r=response();r.reviewReason="Dúvida";provisional(r)});
test("critérios duplicados",()=>{const r=response();r.criteriaAnalysis[2]=r.criteriaAnalysis[1];assert.throws(()=>score(r))});
test("julgamento incompleto",()=>{const r=response();r.criteriaAnalysis[1].judgment=null;assert.throws(()=>score(r))});
test("contagem não aceita julgamentos qualitativos",()=>{const r=response();r.criteriaAnalysis[0].judgment=judge(100);assert.throws(()=>score(r))});
test("organização da evidência não muda nota",()=>{const r=response(),s=score(r).score;r.criteriaAnalysis[1].evidence=["A","B"];assert.equal(score(r).score,s)});
test("percentual injetado não decide nota",()=>{const r=response(),s=score(r).score;r.criteriaAnalysis[1].attainmentPercent=100;assert.equal(score(r).score,s)});
function request(ref=reference,criteria=guidance){const form=new FormData();form.append("criteria",criteria);form.append("rubric",JSON.stringify(rubric));form.append("reference",JSON.stringify(ref));form.append("images",new Blob(["fixture"],{type:"image/png"}),"fixture.png");return new Request("http://localhost/api/grade",{method:"POST",body:form})}
test("carrega mesma referência",async()=>{const parsed=await parseGradeRequest(request());assert.deepEqual(parsed.reference,reference);assert.deepEqual(parsed.rubric,rubric)});
test("referência desatualizada rejeitada",async()=>await assert.rejects(parseGradeRequest(request(reference,guidance+" alterada"))));
test("ambiguidade bloqueia correção",async()=>await assert.rejects(parseGradeRequest(request({...reference,criteria:[{...reference.criteria[0],ambiguity:"Dúvida"},...reference.criteria.slice(1)]}))));

test("65 e 90 preservam os pesos e não são arredondados para faixas",()=>{const r=response();r.criteriaAnalysis[1]=qualitative("c2",65);r.criteriaAnalysis[2]=qualitative("c3",90);assert.deepEqual(score(r).criteriaAnalysis.map(c=>c.awardedPoints),[3,1.63,2.7])});
test("crédito parcial sem lacuna material exige revisão",()=>{const r=response();r.criteriaAnalysis[1].gaps=[];provisional(r)});
test("descritor fora da referência é rejeitado",()=>{const r=response();r.criteriaAnalysis[1].judgment=judge(60);assert.throws(()=>score(r))});
test("fundamentação e descritor selecionado são exportáveis no resultado",()=>{const s=score(response());assert.equal(s.criteriaAnalysis[1].decisionDescription,"Descritor sintético 75");assert.equal(s.criteriaAnalysis[1].decisionRationale,"Evidência e lacunas sintéticas.")});

test("incompatibilidade não muda nota provisória nem gera nota final",()=>{const r=response();r.criteriaAnalysis[1].judgment.assessment.limitations[0].impact="minor";const s=provisional(r);assert.equal(s.criteriaAnalysis[1].awardedPoints,1.88);assert.match(s.reviewReason,/incompatível com a suficiência/);assert.ok(s.criteriaAnalysis[1].competenceAudit.length>0)});
test("impacto secundário aprovado não pode ser agravado",()=>{const r=response();const ref=structuredClone(reference);ref.criteria[1].calibration.complementary=[{id:"E1",description:"Forma exigida",sourceExcerpt:"elabore duas análises",maxImpact:"minor",rationale:"Não compromete o núcleo."}];r.criteriaAnalysis[1].judgment.assessment.limitations[0].target="E1";const s=finalizeGradingScores(rubric,r,ref);assert.equal(s.score,null);assert.equal(s.criteriaAnalysis[1].awardedPoints,1.88);assert.match(s.reviewReason,/Impacto acima do limite/)});
test("compatibilidade estrutural de todos os sete níveis",()=>{for(const percent of [0,25,50,65,75,90,100]){const r=response();r.criteriaAnalysis[1]=qualitative("c2",percent);assert.notEqual(score(r).score,null)}});
test("exigência opcional ou inventada não fundamenta desconto",()=>{const r=response();r.criteriaAnalysis[1].judgment.assessment.limitations[0].target="optional";assert.match(provisional(r).reviewReason,/não vinculada/)});
test("lacuna sem avaliação de impacto exige revisão",()=>{const r=response();r.criteriaAnalysis[1].gaps.push("Outra lacuna.");assert.match(provisional(r).reviewReason,/Nem todas/)});
test("núcleo suficiente não admite limitação impeditiva",()=>{const r=response();r.criteriaAnalysis[1].judgment.assessment.limitations[0].impact="blocking";assert.match(provisional(r).reviewReason,/impede sua demonstração/)});
test("núcleo insuficiente deve identificar o que impede sua demonstração",()=>{const r=response();r.criteriaAnalysis[1]=qualitative("c2",65);r.criteriaAnalysis[1].judgment.assessment.limitations[0].impact="minor";assert.match(provisional(r).reviewReason,/sem limitação impeditiva/)});
test("evidência central inexistente ou repetida bloqueia nota final",()=>{for(const indices of [[],[99],[0,0]]){const r=response();r.criteriaAnalysis[1].judgment.assessment.coreEvidenceIndices=indices;assert.match(provisional(r).reviewReason,/Evidências do núcleo/)}});
test("avaliação ausente não passa como julgamento válido",()=>{const r=response();r.criteriaAnalysis[1].judgment.assessment=null;assert.match(provisional(r).reviewReason,/suficiência\/materialidade/)});
test("uma lacuna não pode ser contabilizada duas vezes",()=>{const r=response();const limitations=r.criteriaAnalysis[1].judgment.assessment.limitations;limitations.push({...limitations[0]});assert.match(provisional(r).reviewReason,/repetido/)});
test("contagem e regra docente excepcional preservadas",()=>{const r=response();const ref=structuredClone(reference);ref.criteria[1].decisionPlan={scaleType:"teacher",exceptionReason:"Regra docente sintética.",sourceExcerpt:"Análise",levels:[{id:"L1",percent:0,description:"Ausência"},{id:"L41",percent:40,description:"Crédito específico"},{id:"L101",percent:100,description:"Pleno"}]};ref.criteria[1].calibration=null;r.criteriaAnalysis[1]=qualitative("c2",40);r.criteriaAnalysis[1].judgment.assessment=null;const s=finalizeGradingScores(rubric,r,ref);assert.equal(s.score,6.7);assert.deepEqual(s.criteriaAnalysis[1].competenceAudit,[])});

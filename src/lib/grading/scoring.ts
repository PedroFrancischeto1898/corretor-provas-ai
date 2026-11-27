import { GradeError } from "./errors";
import {auditCompetence,resolveDecisionPlan} from "./decision-core.mjs";
import { scoreCriterion, totalPoints } from "./scoring-core.mjs";
import type { CriterionStatus, FinalCriterionAnalysis, ModelGradingResult, PreparedReference, RubricCriterion } from "./types";

export function calculateMaxScore(rubric: RubricCriterion[]) { return totalPoints(rubric.map(c => c.points)); }
export function calculateScore(criteria: FinalCriterionAnalysis[]) { return totalPoints(criteria.map(c => c.awardedPoints)); }


function isTextArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(s => typeof s === "string" && !!s.trim());
}
export function buildScoredCriteria(rubric: RubricCriterion[], result: ModelGradingResult, reference: PreparedReference): {criteriaAnalysis: FinalCriterionAnalysis[]; reviewReasons: string[]} {
    const rows = result?.criteriaAnalysis;
    if (!Array.isArray(rows) || rows.length !== rubric.length || rows.some(r=>!r || typeof r.criterionId!=="string") || new Set(rows.map(r=>r.criterionId)).size !== rubric.length || rows.some(r=>!rubric.some(c=>c.id===r.criterionId))) {
        throw new GradeError("A API retornou critérios incorretos, ausentes ou duplicados.", 502);
    }
    const reviewReasons: string[] = [];
    const criteriaAnalysis = rubric.map(c=>{
        const a=rows.find(r=>r.criterionId===c.id)!;
        const rule=reference.criteria.find(r=>r.criterionId===c.id);
        if (!rule || !isTextArray(a.evidence) || !isTextArray(a.gaps) || !isTextArray(a.errors) || typeof a.analysis!=="string" || !a.analysis.trim() || !Array.isArray(a.validItems)) throw new GradeError("Evidências ou regra de correção inválidas.",502);
        const mode=rule.mode;
        const expected=rule.expectedCount;
        let value:number;
        let decisionDescription:string|null=null,decisionRationale:string|null=null,upperPercent:number|null=null;
        let competenceAudit:string[]=[];
        if (mode==="count") {
            if (a.judgment!==null || a.validItems.some(i=>!i || typeof i.concept!=="string" || !i.concept.trim() || typeof i.evidence!=="string" || !i.evidence.trim())) throw new GradeError("Itens de contagem inválidos.",502);
            const keys=a.validItems.map(i=>i.concept.trim().toLocaleLowerCase("pt-BR").replace(/\s+/g," "));
            value=new Set(keys).size;
            if(value!==keys.length) reviewReasons.push(c.id+": itens repetidos; conferir contagem.");
        } else if (mode==="qualitative") {
            if(a.validItems.length!==0||!rule.decisionPlan||!a.judgment)throw new GradeError("Retorno qualitativo inválido.",502);
            try{
                const d=resolveDecisionPlan(rule.decisionPlan,a.judgment);
                value=d.percent;upperPercent=d.upperPercent;decisionDescription=d.description;decisionRationale=d.rationale;
                if(d.needsReview)reviewReasons.push(c.id+": julgamento indeterminado; intervalo possível "+value+"–"+upperPercent+"%.");
                if(rule.decisionPlan.scaleType==="standard"){
                    const audit=auditCompetence(rule.calibration!,a,value);
                    competenceAudit=audit.summary;
                    reviewReasons.push(...audit.reasons.map(reason=>c.id+": "+reason));
                }else if(a.judgment.assessment!==null){
                    reviewReasons.push(c.id+": escala excepcional com avaliação de suficiência padrão indevida.");
                }
            }catch{throw new GradeError("Julgamento estruturado inválido para "+c.id+".",502);}
        } else throw new GradeError("Regra ainda não suportada.",400);
        let scored: ReturnType<typeof scoreCriterion>;
        try { scored=scoreCriterion(c.points,mode,value,expected); } catch { throw new GradeError("Medida de atendimento inválida para "+c.id+".",502); }
        const hasEvidence=a.evidence.length>0 || a.validItems.length>0;
        if (scored.attainmentPercent>0 && !hasEvidence) reviewReasons.push(c.id+": pontuação sem evidência registrada.");
        if (scored.attainmentPercent===0 && hasEvidence) reviewReasons.push(c.id+": evidência pertinente com atendimento zero; conferir condição expressa no gabarito.");
        if (scored.attainmentPercent===100 && (a.gaps.length>0 || a.errors.length>0)) reviewReasons.push(c.id+": atendimento pleno com lacunas ou erros materiais.");
        if (mode==="qualitative" && scored.attainmentPercent>0 && scored.attainmentPercent<100 && a.gaps.length===0 && a.errors.length===0) reviewReasons.push(c.id+": crédito parcial sem lacuna ou erro material registrado.");
        return {criterionId:c.id,criterion:c.description,status:scored.status as CriterionStatus,analysis:a.analysis,maxPoints:c.points,awardedPoints:scored.awardedPoints,attainmentPercent:scored.attainmentPercent,evidence:[...a.evidence,...a.validItems.map(i=>i.concept+": "+i.evidence)],gaps:a.gaps,errors:a.errors,validCount:mode==="count"?value:null,expectedCount:expected,decisionDescription,decisionRationale,upperPercent,competenceAudit};
    });
    return {criteriaAnalysis,reviewReasons};
}

/** Calcula e separa a nota final da provisória sem consultar a API. */
export function finalizeGradingScores(rubric: RubricCriterion[], result: ModelGradingResult, reference: PreparedReference) {
    if (!result || typeof result.needsHumanReview!=="boolean" || !(result.reviewReason===null || typeof result.reviewReason==="string")) {
        throw new GradeError("Sinalização de revisão inválida na resposta do modelo.",502);
    }
    const {criteriaAnalysis,reviewReasons}=buildScoredCriteria(rubric,result,reference);
    if (result.needsHumanReview) reviewReasons.unshift(result.reviewReason?.trim() || "Revisão indicada pelo avaliador.");
    else if (result.reviewReason?.trim()) reviewReasons.unshift(result.reviewReason.trim());
    const needsHumanReview=reviewReasons.length>0;
    const provisionalScore=calculateScore(criteriaAnalysis);
    return {criteriaAnalysis,provisionalScore,maxScore:calculateMaxScore(rubric),
        score:needsHumanReview?null:provisionalScore,needsHumanReview,
        reviewReason:needsHumanReview?reviewReasons.join(" "):null};
}

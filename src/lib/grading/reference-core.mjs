import { createHash } from "node:crypto";
import {buildDecisionPlan,validateDecisionPlan} from "./decision-core.mjs";

/** @param {string} guidance @param {import("./types").RubricCriterion[]} rubric */
export function referenceSourceHash(guidance, rubric) {
    return createHash("sha256").update(JSON.stringify({
        referenceVersion: 6,
        guidance: guidance.trim(),
        rubric: rubric.map(({id, description, points})=>({id, description, points})),
    })).digest("hex");
}

function text(value) { return typeof value === "string" && value.trim().length > 0; }
function texts(value) { return Array.isArray(value) && value.every(text); }

function normalizeSource(value) { return value.normalize("NFC").replace(/\s+/g," ").trim().toLocaleLowerCase("pt-BR"); }

/** @param {any} value @param {string} guidance @param {import("./types").RubricCriterion} criterion @returns {import("./types").CompetenceCalibration} */
function validateCalibration(value,guidance,criterion) {
    if (!value || !text(value.core) || !text(value.sufficientEvidence) || !Array.isArray(value.complementary) || value.complementary.length>20) {
        throw Error("Núcleo ou suficiência não definidos: "+criterion.id);
    }
    const ids=new Set(), descriptions=new Set();
    const complementary=value.complementary.map(c=>{
        if (!c || typeof c.id!=="string" || !/^E[1-9][0-9]*$/.test(c.id) || ids.has(c.id) ||
            !text(c.description) || descriptions.has(normalizeSource(c.description)) ||
            !text(c.sourceExcerpt) || !text(c.rationale) || !["minor","major"].includes(c.maxImpact)) {
            throw Error("Exigência complementar inválida: "+criterion.id);
        }
        if (![guidance,criterion.description].some(source=>normalizeSource(source).includes(normalizeSource(c.sourceExcerpt)))) {
            throw Error("Exigência complementar sem fonte verificável: "+criterion.id);
        }
        ids.add(c.id); descriptions.add(normalizeSource(c.description));
        return {id:c.id,description:c.description,sourceExcerpt:c.sourceExcerpt,maxImpact:c.maxImpact,rationale:c.rationale};
    });
    return {core:value.core,sufficientEvidence:value.sufficientEvidence,complementary};
}

/** Materializa a régua padrão a partir de descritores, antes de validar a referência inteira.
 * @param {any} raw
 * @param {string} guidance
 * @param {import("./types").RubricCriterion[]} rubric
 */
export function prepareReferenceFromModel(raw, guidance, rubric) {
    if (!raw || !Array.isArray(raw.criteria)) throw Error("Critérios da referência ausentes.");
    const criteria = raw.criteria.map(r=>{
        if (!r || typeof r !== "object") throw Error("Critério inválido.");
        return {...r,decisionPlan:r.mode==="qualitative"?buildDecisionPlan(r.decisionPlan):r.decisionPlan};
    });
    return validatePreparedReference({sourceHash:referenceSourceHash(guidance,rubric),criteria},guidance,rubric,true);
}
/**
 * Valida a estrutura, vincula-a à fonte e preserva a ordem da rubrica.
 * Não comprova a correção semântica da interpretação, que depende da conferência docente.
 * @param {unknown} reference
 * @param {string} guidance
 * @param {import("./types").RubricCriterion[]} rubric
 * @param {boolean} [allowUnresolved]
 * @returns {import("./types").PreparedReference}
 */
export function validatePreparedReference(reference, guidance, rubric, allowUnresolved = false) {
    const sourceHash=referenceSourceHash(guidance,rubric);
    if (!reference || reference.sourceHash!==sourceHash || !Array.isArray(reference.criteria) || reference.criteria.length!==rubric.length) {
        throw new Error("Referência ausente ou desatualizada. Prepare novamente após alterar o gabarito ou a rubrica.");
    }
    const rows=reference.criteria;
    if (rows.some(r=>!r || !text(r.criterionId)) || new Set(rows.map(r=>r.criterionId)).size!==rubric.length || rows.some(r=>!rubric.some(c=>c.id===r.criterionId))) {
        throw new Error("A referência contém critérios ausentes, desconhecidos ou duplicados.");
    }
    const criteria=rubric.map(c=>{
        const r=rows.find(row=>row.criterionId===c.id);
        if (!text(r.demand) || !texts(r.essentials) || !texts(r.equivalents) || !texts(r.optional) || !(r.ambiguity===null || text(r.ambiguity))) throw new Error("Interpretação incompleta: "+c.id);
        if (!text(r.boundary) || (r.mode!=="qualitative" && r.decisionPlan!==null)) throw new Error("Calibração avaliativa incompleta: "+c.id);
        const decisionPlan=r.mode==="qualitative"?validateDecisionPlan(r.decisionPlan):null;
        const standard=decisionPlan?.scaleType==="standard";
        if (!standard && r.calibration!==null) throw Error("Calibração padrão indevida: "+c.id);
        const calibration=standard?validateCalibration(r.calibration,guidance,c):null;
        if (decisionPlan && decisionPlan.scaleType!=="standard") {
            const excerpt=normalizeSource(decisionPlan.sourceExcerpt);
            if (!excerpt || ![guidance,c.description].some(source=>normalizeSource(source).includes(excerpt))) {
                throw Error("Exceção de escala sem trecho verificável na fonte original: "+c.id);
            }
        }
        if (r.mode==="count") {
            if (!Number.isSafeInteger(r.expectedCount) || r.expectedCount<1 || r.expectedCount>1000) throw new Error("Quantidade de itens inválida: "+c.id);
        } else if (r.mode==="qualitative" || r.mode==="unsupported") {
            if (r.expectedCount!==null || (r.mode==="unsupported" && r.ambiguity===null)) throw new Error("Regra de pontuação inválida: "+c.id);
        } else throw new Error("Tipo de regra desconhecido: "+c.id);
        if (!allowUnresolved && (r.mode==="unsupported" || r.ambiguity!==null)) throw new Error("Esclareça a regra ou a demanda do critério antes de corrigir: "+c.id);
        return {criterionId:r.criterionId,demand:r.demand,essentials:r.essentials,equivalents:r.equivalents,optional:r.optional,mode:r.mode,expectedCount:r.expectedCount,ambiguity:r.ambiguity,boundary:r.boundary,decisionPlan,calibration};
    });
    return {sourceHash,criteria};
}

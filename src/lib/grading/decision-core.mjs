// Seleção de descritor aprovado; nenhuma pontuação livre na correção.
function nonempty(s) { return typeof s === "string" && s.trim().length > 0; }

/** @type {ReadonlyArray<Readonly<{key: string, percent: number}>>} */
export const STANDARD_LEVELS = Object.freeze([
    {key:"zero", percent:0}, {key:"incipient", percent:25},
    {key:"partial", percent:50}, {key:"developing", percent:65},
    {key:"substantial", percent:75}, {key:"nearFull", percent:90},
    {key:"full", percent:100},
].map(level => Object.freeze(level)));

function matchesScale(levels, percents) {
    return levels.length === percents.length && levels.every((l,i)=>l.percent === percents[i]);
}

/** Converte a resposta estruturada da preparação em uma régua de pontuação.
 * A escala padrão pertence ao software, não ao modelo.
 * @param {any} raw @returns {import("./types").DecisionPlan}
 */
export function buildDecisionPlan(raw) {
    if (!raw || typeof raw !== "object") throw Error("Plano de descritores ausente.");
    if (raw.scaleType === "standard") {
        const d = raw.descriptors;
        if (!d || typeof d !== "object" || Array.isArray(d) ||
            Object.keys(d).length !== STANDARD_LEVELS.length ||
            STANDARD_LEVELS.some(({key})=>!Object.hasOwn(d,key) || !nonempty(d[key]))) {
            throw Error("A escala padrão exige os sete descritores completos.");
        }
        return validateDecisionPlan({
            scaleType:"standard", exceptionReason:null, sourceExcerpt:null,
            levels:STANDARD_LEVELS.map(({key,percent})=>({id:"L"+(percent+1),percent,description:d[key]})),
        });
    }
    if (raw.scaleType !== "binary" && raw.scaleType !== "teacher") throw Error("Tipo de escala desconhecido.");
    if (!Array.isArray(raw.levels)) throw Error("Níveis da exceção ausentes.");
    return validateDecisionPlan({
        scaleType:raw.scaleType, exceptionReason:raw.reason, sourceExcerpt:raw.sourceExcerpt,
        levels:raw.levels.map(l=>({id:"L"+(l?.percent+1),percent:l?.percent,description:l?.description})),
    });
}

/** @param {any} plan @returns {import("./types").DecisionPlan} */
export function validateDecisionPlan(plan) {
    if (!plan || !Array.isArray(plan.levels) || plan.levels.length < 2 || plan.levels.length > 11) {
        throw Error("Plano de descritores inválido.");
    }
    const ids = new Set(), descriptions = new Set();
    let previous = -1;
    for (const level of plan.levels) {
        if (!level || !/^L[1-9][0-9]*$/.test(level.id) || ids.has(level.id) ||
            !Number.isInteger(level.percent) || level.percent <= previous || level.percent > 100 ||
            !nonempty(level.description)) throw Error("Descritor inválido ou duplicado.");
        const normalized = level.description.trim().replace(/\s+/g, " ").toLowerCase();
        if (descriptions.has(normalized)) throw Error("Descritores indistinguíveis.");
        ids.add(level.id); descriptions.add(normalized); previous = level.percent;
    }
    if (plan.levels[0].percent !== 0 || previous !== 100) {
        throw Error("O plano deve permitir zero e atendimento pleno.");
    }
    const standard = matchesScale(plan.levels, STANDARD_LEVELS.map(l=>l.percent));
    if (plan.scaleType === "standard") {
        if (!standard || plan.exceptionReason !== null || plan.sourceExcerpt !== null) {
            throw Error("A escala padrão deve conter exatamente 0, 25, 50, 65, 75, 90 e 100%.");
        }
    } else if (plan.scaleType === "binary" || plan.scaleType === "teacher") {
        if (!nonempty(plan.exceptionReason) || !nonempty(plan.sourceExcerpt)) {
            throw Error("Escala excepcional exige justificativa e trecho da fonte.");
        }
        if (standard || (plan.scaleType === "binary" && !matchesScale(plan.levels,[0,100]))) {
            throw Error("Níveis incompatíveis com a exceção declarada.");
        }
    } else throw Error("Tipo de escala desconhecido.");
    return {
        scaleType:plan.scaleType, exceptionReason:plan.exceptionReason, sourceExcerpt:plan.sourceExcerpt,
        levels: plan.levels.map(({id, percent, description}) => ({id, percent, description})),
    };
}

/** @param {import("./types").DecisionPlan} plan @param {import("./types").LevelJudgment} judgment */
export function resolveDecisionPlan(plan, judgment) {
    const { levels } = validateDecisionPlan(plan);
    if (!judgment || !nonempty(judgment.levelId) || !nonempty(judgment.rationale) ||
        !(judgment.upperLevelId === null || nonempty(judgment.upperLevelId))) {
        throw Error("Julgamento qualitativo inválido.");
    }
    const selected = levels.find(l => l.id === judgment.levelId);
    if (!selected) throw Error("Descritor não pertence à referência.");
    const upper = judgment.upperLevelId === null ? selected : levels.find(l => l.id === judgment.upperLevelId);
    if (!upper || (judgment.upperLevelId !== null && upper.percent <= selected.percent)) {
        throw Error("Limite superior de revisão inválido.");
    }
    return {percent: selected.percent, upperPercent: upper.percent, needsReview: upper.percent !== selected.percent, description: selected.description, rationale: judgment.rationale};
}


/** Verifica a compatibilidade do julgamento declarado, sem avaliar a semântica por conta própria.
 * Uma incompatibilidade nunca altera o descritor selecionado: exige revisão.
 * @param {import("./types").CompetenceCalibration} calibration
 * @param {import("./types").ModelCriterionAnalysis} analysis
 * @param {number} selectedPercent
 * @returns {{reasons:string[], summary:string[]}}
 */
export function auditCompetence(calibration, analysis, selectedPercent) {
    const reasons = [], summary = [];
    const a = analysis.judgment?.assessment;
    const coreLabels = {absent:"Ausente",incipient:"Incipiente",partial:"Parcial",developed:"Desenvolvido, aquém do núcleo",met:"Núcleo demonstrado"};
    const impactLabels = {minor:"Pequena",major:"Relevante",blocking:"Impede demonstrar o núcleo"};
    const invalid = "Julgamento de suficiência/materialidade inválido ou incompleto.";
    if (!calibration || !a || !Object.hasOwn(coreLabels,a.coreStatus) || !nonempty(a.coreRationale) ||
        !Array.isArray(a.coreEvidenceIndices) || !Array.isArray(a.limitations)) {
        return {reasons:[invalid],summary:[]};
    }
    summary.push("Suficiência: "+coreLabels[a.coreStatus]+". "+a.coreRationale);
    const indices = a.coreEvidenceIndices;
    if (indices.some(i=>!Number.isInteger(i)||i<0||i>=analysis.evidence.length) ||
        new Set(indices).size!==indices.length ||
        (a.coreStatus==="absent" ? indices.length!==0 : indices.length===0)) {
        reasons.push("Evidências do núcleo incompatíveis com a suficiência declarada.");
    }
    for (const i of indices) {
        if (Number.isInteger(i) && i>=0 && i<analysis.evidence.length) summary.push("Evidência do núcleo: "+analysis.evidence[i]);
    }
    const seen = new Set();
    let hasBlockingCore=false, hasMajor=false, hasMinor=false;
    for (const l of a.limitations) {
        if (!l || !["gap","error"].includes(l.kind) || !Number.isInteger(l.index) ||
            !Object.hasOwn(impactLabels,l.impact) || !nonempty(l.rationale)) {
            reasons.push(invalid); continue;
        }
        const items=l.kind==="gap"?analysis.gaps:analysis.errors;
        const key=l.kind+":"+l.index;
        if (l.index<0 || l.index>=items.length || seen.has(key)) {
            reasons.push("Lacuna ou erro com índice inexistente ou repetido."); continue;
        }
        seen.add(key);
        const complement=calibration.complementary.find(c=>c.id===l.target);
        if (l.target!=="core" && !complement) {
            reasons.push("Limitação não vinculada ao núcleo nem a exigência complementar aprovada."); continue;
        }
        if (complement && (l.impact==="blocking" || (l.impact==="major" && complement.maxImpact==="minor"))) {
            reasons.push("Impacto acima do limite aprovado para "+complement.id+".");
        }
        if (l.impact==="blocking" && l.target==="core") hasBlockingCore=true;
        if (l.impact==="major") hasMajor=true;
        if (l.impact==="minor") hasMinor=true;
        summary.push(impactLabels[l.impact]+" — "+(l.target==="core"?"Núcleo":complement?.description)+": "+items[l.index]+". "+l.rationale);
    }
    if (seen.size!==analysis.gaps.length+analysis.errors.length) reasons.push("Nem todas as lacunas e erros têm impacto fundamentado.");
    if (a.coreStatus==="met" && hasBlockingCore) reasons.push("Núcleo declarado demonstrado, mas existe limitação que impede sua demonstração.");
    if (a.coreStatus!=="met" && !hasBlockingCore) reasons.push("Núcleo declarado insuficiente sem limitação impeditiva identificada.");
    const belowCore={absent:0,incipient:25,partial:50,developed:65};
    const compatible=a.coreStatus==="met" ? (hasMajor?75:hasMinor?90:100) : belowCore[a.coreStatus];
    if (selectedPercent!==compatible) reasons.push("Descritor selecionado incompatível com a suficiência e o impacto declarados (nível selecionado "+selectedPercent+"%; nível estruturalmente compatível "+compatible+"%).");
    return {reasons:[...new Set(reasons)],summary};
}

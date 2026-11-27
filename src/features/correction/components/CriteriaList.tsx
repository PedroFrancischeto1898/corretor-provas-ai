import type {
    CriterionAnalysis,
    CriterionStatus,
} from "../types";

type Props = {
    criteria: CriterionAnalysis[];
};

function getStatusLabel(
    status: CriterionStatus
    ) {
    const labels: Record<
        CriterionStatus,
        string
    > = {
        fully_met:
        "Plenamente atendido",

        mostly_met:
        "Majoritariamente atendido",

        partially_met:
        "Parcialmente atendido",

        minimally_met:
        "Minimamente atendido",

        not_met:
        "Não atendido",
    };

    return labels[status];
}

export function CriteriaList({
    criteria,
    }: Props) {
    return (
        <div className="mt-6">
        <h4 className="font-bold text-slate-900">
            Critérios
        </h4>

        <div className="mt-3 space-y-3">
            {criteria.map((criterion) => (
            <div
                key={criterion.criterionId}
                className="rounded-xl border border-slate-200 p-4"
            >
                <div className="flex flex-col gap-2 md:flex-row md:justify-between">
                <p className="font-semibold text-slate-900">
                    {criterion.criterion}
                </p>

                <div className="md:text-right">
                    <p className="text-sm font-semibold text-blue-700">
                    {getStatusLabel(criterion.status)} · {criterion.expectedCount!==null ? `${Math.min(criterion.validCount??0,criterion.expectedCount)} de ${criterion.expectedCount} itens` : `${criterion.attainmentPercent.toFixed(0)}%`}
                    </p>

                    <p className="text-sm text-slate-500">
                    {criterion.awardedPoints.toFixed(
                        2
                    )}
                    {" / "}
                    {criterion.maxPoints.toFixed(
                        2
                    )}
                    {" pts"}
                    </p>
                </div>
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-700">
                {criterion.analysis}
                </p>
                <details className="mt-2 text-sm text-slate-700">
                    <summary className="cursor-pointer font-medium text-blue-700">Fundamentos da avaliação</summary>
                    {criterion.decisionDescription && <p className="mt-2 font-semibold">Descritor selecionado: {criterion.decisionDescription}</p>}
                    {criterion.upperPercent!==null && criterion.upperPercent!==criterion.attainmentPercent && <p>Intervalo possível: {criterion.attainmentPercent}–{criterion.upperPercent}% (revisão necessária).</p>}
                    {criterion.decisionRationale && <p className="mt-2">Fundamentação do nível: {criterion.decisionRationale}</p>}
                    {(criterion.competenceAudit??[]).map((line,index)=><p key={index} className="mt-2">{line}</p>)}
                    {[{title:"Evidências",items:criterion.evidence},{title:"Lacunas relevantes",items:criterion.gaps},{title:"Equívocos conceituais",items:criterion.errors}].filter(section=>section.items.length>0).map(section=><div className="mt-2" key={section.title}><p className="font-semibold">{section.title}</p><ul className="list-disc pl-5">{section.items.map((item,index)=><li key={index}>{item}</li>)}</ul></div>)}
                </details>
            </div>
            ))}
        </div>
        </div>
    );
}
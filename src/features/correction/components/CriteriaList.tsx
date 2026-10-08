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
                    {getStatusLabel(
                        criterion.status
                    )}
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
            </div>
            ))}
        </div>
        </div>
    );
}
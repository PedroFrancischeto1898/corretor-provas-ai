type Props = {
    assessmentName: string;

    criteria: string;

    onAssessmentNameChange:
        (value: string) => void;

    onCriteriaChange:
        (value: string) => void;
};

export function AssessmentFields({
    assessmentName,
    criteria,
    onAssessmentNameChange,
    onCriteriaChange,
    }: Props) {
    return (
        <>
        <div>
            <label
            htmlFor="assessment-name"
            className="mb-2 block font-semibold text-slate-800"
            >
            Nome da avaliação
            </label>

            <input
            id="assessment-name"
            type="text"
            value={assessmentName}
            onChange={(event) =>
                onAssessmentNameChange(
                event.target.value
                )
            }
            className="w-full rounded-xl border border-slate-300 p-4"
            />
        </div>

        <div>
            <label
            htmlFor="criteria"
            className="mb-2 block font-semibold text-slate-800"
            >
            Orientações gerais /
            gabarito
            </label>

            <textarea
            id="criteria"
            rows={8}
            value={criteria}
            onChange={(event) =>
                onCriteriaChange(
                event.target.value
                )
            }
            className="w-full rounded-xl border border-slate-300 p-4"
            />
        </div>
        </>
    );
}
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
            gabarito e enunciado da questão
            </label>

            <textarea
            id="criteria"
            rows={8}
            placeholder="Cole o enunciado, o gabarito e as orientações da questão que será corrigida."
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
import type {
    GradingResult,
} from "../types";

type Props = {
    result: GradingResult;
    sourceFileName: string;
};

function getScoreText(
    result: GradingResult
    ) {
    if (result.score === null) {
        return `Revisar — provisória ${result.provisionalScore.toFixed(
        2
        )}`;
    }

    return result.score.toFixed(2);
}

export function ResultSummary({
    result,
    sourceFileName,
    }: Props) {
    const scoreText =
        getScoreText(result);

    return (
        <div className="flex flex-col gap-5 md:flex-row md:justify-between">
        <div>
            <p className="text-sm text-slate-500">
            Aluno
            </p>

            <h3 className="text-xl font-bold text-slate-900">
            {result.studentName ??
                "Não identificado"}
            </h3>

            <p className="mt-1 text-sm text-slate-600">
            Matrícula:{" "}
            {result.registration ??
                "não identificada"}
            </p>

            <p className="text-sm text-slate-500">
            Arquivo: {sourceFileName}
            </p>
        </div>

        <div className="md:text-right">
            <p className="text-sm text-slate-500">
            Nota
            </p>

            <p className="text-3xl font-bold text-blue-700">
            {scoreText}
            {" / "}
            {result.maxScore.toFixed(2)}
            </p>

            <p className="mt-1 text-sm text-slate-500">
            Confiança:{" "}
            {Math.round(
                result.gradingConfidence * 100
            )}
            %
            </p>
        </div>
        </div>
    );
}
import type {
    ExamPage,
    } from "../../grouping/types";

    type Props = {
    page: ExamPage;
};

export function PageItem({
    page,
    }: Props) {
    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="font-medium text-slate-800">
            {page.file.name}
        </p>

        <PageIdentificationInfo
            page={page}
        />
        </div>
    );
}

function PageIdentificationInfo({
    page,
    }: Props) {
    const identification =
        page.identification;

    if (!identification) {
        return (
        <p className="mt-1 text-sm text-slate-500">
            Sem identificação.
        </p>
        );
    }

    return (
        <div className="mt-1 text-sm text-slate-500">
        <p>
            Questão:{" "}
            {identification.questionNumber ??
            "não identificada"}
        </p>

        <p>
            Confiança:{" "}
            {Math.round(
            identification.confidence *
                100
            )}
            %
        </p>
        </div>
    );
}
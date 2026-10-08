import { ProcessingErrors } from "./ProcessingErrors";
import { ResultsList } from "./ResultsList";

import {
    ExportActions,
} from "./ExportActions";

import type {
    CorrectionItem,
    ProcessingError,
} from "../types";

type Props = {
    assessmentName: string;
    results: CorrectionItem[];
    processingErrors: ProcessingError[];
    onBack: () => void;
};

export function ResultsStage({
    assessmentName,
    results,
    processingErrors,
    onBack,
    }: Props) {
    return (
        <main className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-5xl">
            <button
            type="button"
            onClick={onBack}
            className="mb-4 text-sm font-semibold text-blue-700"
            >
            ← Voltar à configuração
            </button>

            <ExportActions
            assessmentName={
                assessmentName
            }
            results={
                results
            }
            />

            <ProcessingErrors
            errors={processingErrors}
            />

            <ResultsList
            assessmentName={assessmentName}
            results={results}
            />
        </div>
        </main>
    );
}
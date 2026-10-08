"use client";

import {
    exportResultsToExcel,
} from "../export/excel";

import type {
    CorrectionItem,
} from "../types";

import {
    exportFeedbackReport,
} from "../export/report";

type Props = {
    assessmentName: string;
    results: CorrectionItem[];
};

export function ExportActions({
    assessmentName,
    results,
    }: Props) {
    const hasResults =
        results.length > 0;

    function handleExcelExport() {
        exportResultsToExcel(
        assessmentName,
        results
        );
    }

    async function handleReportExport() {
        await exportFeedbackReport(
            assessmentName,
            results
        );
    }


    return (
        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
            Exportar resultados
        </h2>

        <p className="mt-1 text-sm text-slate-600">
            Baixe os resultados consolidados
            da avaliação.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
            <button
            type="button"
            disabled={!hasResults}
            onClick={
                handleExcelExport
            }
            className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
            Baixar planilha Excel
            </button>
        
        <button
            type="button"
            disabled={!hasResults}
            onClick={
                handleReportExport
            }
            className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
            Baixar devolutivas em Word
            </button>

        </div>
        </section>
    );
}
import * as XLSX from "xlsx";

import type {
    CorrectionItem,
} from "../types";

function getStudentName(
    item: CorrectionItem
) {
    return (
        item.data.studentName ??
        "Aluno não identificado"
    );
}

function getCriterionScore(
    item: CorrectionItem,
    index: number
    ) {
    const criterion =
        item.data.criteriaAnalysis[index];

    return criterion
        ? criterion.awardedPoints
        : "";
}

export function exportResultsToExcel(
    assessmentName: string,
    results: CorrectionItem[]
) {
    const sortedResults =
        [...results].sort(
        (a, b) =>
            getStudentName(a).localeCompare(
            getStudentName(b),
            "pt-BR"
            )
        );

    const count=Math.max(0,...sortedResults.map(item=>item.data.criteriaAnalysis.length));
    const rows =
        sortedResults.map(
        (item) => ({
            Aluno:
            getStudentName(item),

            Matrícula:
            item.data.registration ??
            "",

            ...Object.fromEntries(Array.from({length:count},(_,i)=>["C"+(i+1),getCriterionScore(item,i)])),

            "Nota final": item.data.score ?? "",

            "Nota provisória": item.data.score===null ? item.data.provisionalScore : "",

            "Nota máxima":
            item.data.maxScore,

            "Revisão humana":
            item.data.needsHumanReview
                ? "Sim"
                : "Não",

            Confiança:
            `${Math.round(
                item.data
                .gradingConfidence *
                100
            )}%`,
        })
    );

    const worksheet =
        XLSX.utils.json_to_sheet(
        rows
        );

    worksheet["!cols"] = [
        { wch: 35 },
        { wch: 16 },
        ...Array.from({length:count},()=>({wch:10})),
        { wch: 14 },
        { wch: 14 },
        { wch: 16 },
        { wch: 18 },
        { wch: 12 },
    ];

    const workbook =
        XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Resultados"
    );

    XLSX.writeFile(
        workbook,
        `${sanitizeFileName(
        assessmentName
        )}-resultados.xlsx`
    );
}

function sanitizeFileName(
    value: string
    ) {
    return value
        .trim()
        .replace(
        /[<>:"/\\|?*]+/g,
        "-"
        )
        .replace(/\s+/g, "_");
}
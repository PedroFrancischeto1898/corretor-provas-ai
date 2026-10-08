import {
    AlignmentType,
    Document,
    HeadingLevel,
    Packer,
    Paragraph,
    TextRun,
} from "docx";

import type {
    CorrectionItem,
    CriterionStatus,
    } from "../types";

    function getStudentName(
    item: CorrectionItem
    ) {
    return (
        item.data.studentName ??
        "Aluno não identificado"
    );
}

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

function getFinalScore(
    item: CorrectionItem
    ) {
    return (
        item.data.score ??
        item.data.provisionalScore
    );
}

function createCriterionParagraphs(
    item: CorrectionItem
    ) {
    return item.data.criteriaAnalysis.flatMap(
        (criterion, index) => [
        new Paragraph({
            children: [
            new TextRun({
                text:
                `C${index + 1} — ${criterion.criterion}`,
                bold: true,
            }),
            ],
            spacing: {
            before: 180,
            after: 60,
            },
        }),

        new Paragraph({
            children: [
            new TextRun({
                text:
                `${getStatusLabel(
                    criterion.status
                )} — ${criterion.awardedPoints.toFixed(
                    2
                )} / ${criterion.maxPoints.toFixed(
                    2
                )} pontos`,
                bold: true,
            }),
            ],
        }),

        new Paragraph({
            text:
            criterion.analysis,
            spacing: {
            after: 120,
            },
        }),
        ]
    );
}

function createListSection(
    title: string,
    items: string[]
    ) {
    return [
        new Paragraph({
        text: title,
        heading:
            HeadingLevel.HEADING_2,
        spacing: {
            before: 220,
            after: 80,
        },
    }),

    ...items.map(
        (item) =>
            new Paragraph({
            text: item,
            bullet: {
                level: 0,
            },
            })
        ),
    ];
}

function createStudentSection(
    item: CorrectionItem,
    index: number
    ) {
    const result =
        item.data;

    return [
        new Paragraph({
        text: getStudentName(item),
        heading:
            HeadingLevel.HEADING_1,
        pageBreakBefore:
            index > 0,
    }),

    new Paragraph({
        children: [
            new TextRun({
            text: "Matrícula: ",
            bold: true,
            }),

            new TextRun({
            text:
                result.registration ??
                "Não identificada",
            }),
        ],
    }),

    new Paragraph({
        children: [
            new TextRun({
            text: "Nota: ",
            bold: true,
        }),

        new TextRun({
            text:
                `${getFinalScore(
                item
                ).toFixed(2)} / ${result.maxScore.toFixed(
                2
                )}`,
            }),
        ],
    }),

    ...(result.needsHumanReview
        ? [
            new Paragraph({
                children: [
                new TextRun({
                    text:
                    "Revisão humana recomendada",
                    bold: true,
                }),
                ],
            }),

            new Paragraph({
                text:
                result.reviewReason ??
                "Revisão necessária.",
            }),
            ]
        : []),

    new Paragraph({
        text:
            "Análise por critérios",
        heading:
            HeadingLevel.HEADING_2,
        spacing: {
            before: 240,
            after: 80,
        },
    }),

    ...createCriterionParagraphs(
        item
    ),

    ...createListSection(
        "Pontos fortes",
        result.strengths
    ),

    ...createListSection(
        "Aspectos a desenvolver",
        result.improvements
    ),

    new Paragraph({
        text: "Análise geral",
        heading:
            HeadingLevel.HEADING_2,
        spacing: {
            before: 220,
            after: 80,
        },
    }),

    new Paragraph({
        text:
            result.overallAnalysis,
    }),

    new Paragraph({
        text:
            "Devolutiva ao estudante",
        heading:
            HeadingLevel.HEADING_2,
        spacing: {
            before: 220,
            after: 80,
        },
    }),

    new Paragraph({
        text:
            result.feedback,
        }),
    ];
}

export async function exportFeedbackReport(
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

    const children = [
        new Paragraph({
        children: [
            new TextRun({
            text:
                "Devolutivas da Avaliação",
            bold: true,
            size: 32,
            }),
        ],

        alignment:
            AlignmentType.CENTER,

        spacing: {
            after: 120,
        },
    }),

    new Paragraph({
        children: [
            new TextRun({
            text: assessmentName,
            bold: true,
            size: 24,
            }),
        ],

        alignment:
            AlignmentType.CENTER,

        spacing: {
            after: 400,
        },
        }),

        ...sortedResults.flatMap(
        createStudentSection
        ),
    ];

    const wordDocument =
        new Document({
        sections: [
            {
            properties: {},
            children,
            },
        ],
        });

    const blob =
        await Packer.toBlob(
        wordDocument
        );

    downloadBlob(
        blob,
        `${sanitizeFileName(
        assessmentName
        )}-devolutivas.docx`
    );
}

function downloadBlob(
    blob: Blob,
    fileName: string
    ) {
    const url =
        URL.createObjectURL(blob);

    const link =
        window.document.createElement(
        "a"
        );

    link.href = url;
    link.download = fileName;

    window.document.body.appendChild(
        link
    );

    link.click();
    link.remove();

    URL.revokeObjectURL(url);
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
import type {
    CorrectionItem,
    GradingResult,
    RubricCriterion,
} from "./types";

import type {
    StudentExamGroup,
} from "./grouping/types";

type GradeApiResponse = {
    success: boolean;
    data?: GradingResult;
    error?: string;
};

export async function gradeFile(
    file: File,
    criteria: string,
    rubric: RubricCriterion[]
): Promise<CorrectionItem> {
    const formData = new FormData();

    formData.append("image", file);
    formData.append("criteria", criteria);
    formData.append(
        "rubric",
        JSON.stringify(rubric)
    );

    const response = await fetch(
        "/api/grade",
        {
            method: "POST",
            body: formData,
        }
    );

    const responseData =
        (await response.json()) as GradeApiResponse;

        if (!response.ok) {
            throw new Error(
                responseData.error ??
                "Erro ao corrigir a prova."
            );
        }

        if (!responseData.data) {
            throw new Error(
                "A correção não retornou dados."
            );
        }

        return {
            sourceFileName: file.name,
            data: responseData.data,
        };
}

export async function gradeGroup(
    group: StudentExamGroup,
    criteria: string,
    rubric: RubricCriterion[]
    ): Promise<CorrectionItem> {
    const formData =
        new FormData();

    for (const page of group.pages) {
        formData.append(
        "images",
        page.file
        );
    }

    formData.append(
        "criteria",
        criteria
    );

    formData.append(
        "rubric",
        JSON.stringify(rubric)
    );

    const response =
        await fetch(
        "/api/grade",
        {
            method: "POST",
            body: formData,
        }
        );

    const responseData =
        (await response.json()) as GradeApiResponse;

    if (!response.ok) {
        throw new Error(
        responseData.error ??
            "Erro ao corrigir a prova."
        );
    }

    if (!responseData.data) {
        throw new Error(
        "A correção não retornou dados."
        );
    }

    return {
        sourceFileName:
        group.pages
            .map(
            (page) =>
                page.file.name
            )
            .join(" | "),

        data: {
        ...responseData.data,

        studentName:
            group.studentName,

        registration:
            group.registration,
        },
    };
}
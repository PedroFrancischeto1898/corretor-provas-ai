import type {
    ExamPage,
    PageIdentification,
} from "./types";

type ExtractResponse = {
    success: boolean;

    data?: {
        studentName: string | null;
        registration: string | null;
        questionNumber: string | null;

        confidence: number;
        needsHumanReview: boolean;
    };

    error?: string;
};

export async function identifyPage(
    page: ExamPage
    ): Promise<PageIdentification> {
    const formData = new FormData();

    formData.append(
        "image",
        page.file
    );

    const response = await fetch(
        "/api/extract",
        {
        method: "POST",
        body: formData,
        }
    );

    const responseData =
        (await response.json()) as ExtractResponse;

    if (!response.ok) {
        throw new Error(
        responseData.error ??
            "Não foi possível identificar a página."
        );
    }

    if (!responseData.data) {
        throw new Error(
        "A identificação da página não retornou dados."
        );
    }

    return {
        fileId: page.id,
        fileName: page.file.name,

        studentName:
        responseData.data.studentName,

        registration:
        responseData.data.registration,

        questionNumber:
        responseData.data.questionNumber,

        confidence:
        responseData.data.confidence,

        needsHumanReview:
        responseData.data.needsHumanReview,
    };
}
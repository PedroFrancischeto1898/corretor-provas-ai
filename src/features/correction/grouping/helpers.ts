import type {
    ExamPage,
    PageIdentification,
} from "./types";

export function createExamPages(
    files: File[]
    ): ExamPage[] {
    return files.map(
        (file, index) => ({
        id: createPageId(
            file,
            index
        ),

        file,

        identification: null,

        status: "pending",
        
        assignmentSource: null,
        
        })
    );
}

export function applyIdentification(
    page: ExamPage,
    identification: PageIdentification
): ExamPage {
    const hasRegistration =
        Boolean(
        identification.registration
            ?.trim()
        );

    return {
        ...page,

        identification,

        status:
            hasRegistration
            ? "identified"
            : "unassigned",

        assignmentSource:
            hasRegistration
            ? "automatic"
            : null,
    };
}

export function markPageAsError(
    page: ExamPage
    ): ExamPage {
    return {
        ...page,
        status: "error",
    };
}

function createPageId(
    file: File,
    index: number
) {
    return [
        file.name,
        file.size,
        file.lastModified,
        index,
    ].join("-");
}
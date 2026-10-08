export type PageIdentification = {
    fileId: string;
    fileName: string;

    studentName: string | null;
    registration: string | null;
    questionNumber: string | null;

    confidence: number;
    needsHumanReview: boolean;
};

export type ExamPage = {
    id: string;
    file: File;
    identification: PageIdentification | null;

    status:
        | "pending"
        | "identified"
        | "unassigned"
        | "error";

    assignmentSource:
        | "automatic"
        | "manual"
        | null;
};

export type StudentExamGroup = {
    id: string;

    studentName: string | null;
    registration: string | null;

    pages: ExamPage[];

    needsHumanReview: boolean;
};

export type GroupingProgress = {
    current: number;
    total: number;
};

export type PageProcessingError = {
    fileId: string;
    fileName: string;
    message: string;
};
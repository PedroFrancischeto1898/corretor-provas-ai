import type { FinalCriterionAnalysis } from "@/lib/grading/types";
export type { CriterionStatus, RubricCriterion, PreparedReference, ReferenceCriterion } from "@/lib/grading/types";
export type CriterionAnalysis = FinalCriterionAnalysis;

export type GradingResult = {
    studentName: string | null;
    registration: string | null;
    questionNumber: string | null;

    score: number | null;
    provisionalScore: number;
    maxScore: number;

    criteriaAnalysis: CriterionAnalysis[];

    strengths: string[];
    improvements: string[];

    overallAnalysis: string;
    feedback: string;

    gradingConfidence: number;

    needsHumanReview: boolean;
    reviewReason: string | null;
};

export type CorrectionItem = {
    sourceFileName: string;
    data: GradingResult;
};

export type ProcessingError = {
    sourceFileName: string;
    message: string;
};

export type ProgressState = {
    current: number;
    total: number;
};
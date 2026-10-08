export type CriterionStatus =
    | "fully_met"
    | "mostly_met"
    | "partially_met"
    | "minimally_met"
    | "not_met";

export type RubricCriterion = {
    id: string;
    description: string;
    points: number;
};

export type CriterionAnalysis = {
    criterionId: string;
    criterion: string;

    status: CriterionStatus;
    analysis: string;

    maxPoints: number;
    awardedPoints: number;
};

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
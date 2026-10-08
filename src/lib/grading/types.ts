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

export type GradeRequestData = {
    images: File[];
    guidance: string;
    rubric: RubricCriterion[];
};

export type ModelCriterionAnalysis = {
    criterionId: string;
    status: CriterionStatus;
    analysis: string;
};

export type ModelGradingResult = {
    studentName: string | null;
    registration: string | null;
    questionNumber: string | null;

    criteriaAnalysis: ModelCriterionAnalysis[];

    strengths: string[];
    improvements: string[];

    overallAnalysis: string;
    feedback: string;

    gradingConfidence: number;

    needsHumanReview: boolean;
    reviewReason: string | null;
};

export type FinalCriterionAnalysis = {
    criterionId: string;
    criterion: string;

    status: CriterionStatus;
    analysis: string;

    maxPoints: number;
    awardedPoints: number;
};
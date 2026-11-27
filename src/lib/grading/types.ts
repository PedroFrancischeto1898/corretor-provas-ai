export type CriterionStatus = "fully_met" | "mostly_met" | "partially_met" | "minimally_met" | "not_met";
export type RubricCriterion = { id: string; description: string; points: number };
export type DecisionLevel = { id: string; percent: number; description: string };
export type DecisionPlan = {
    scaleType: "standard" | "binary" | "teacher";
    exceptionReason: string | null;
    sourceExcerpt: string | null;
    levels: DecisionLevel[];
};
export type CoreStatus = "absent" | "incipient" | "partial" | "developed" | "met";
export type LimitationImpact = "minor" | "major" | "blocking";
export type ComplementaryRequirement = {
    id: string; description: string; sourceExcerpt: string; maxImpact: "minor" | "major"; rationale: string;
};
export type CompetenceCalibration = {
    core: string; sufficientEvidence: string; complementary: ComplementaryRequirement[];
};
export type LimitationAssessment = {
    kind: "gap" | "error"; index: number; target: string; impact: LimitationImpact; rationale: string;
};
export type CompetenceAssessment = {
    coreStatus: CoreStatus; coreEvidenceIndices: number[]; coreRationale: string;
    limitations: LimitationAssessment[];
};
export type LevelJudgment = { levelId: string; rationale: string; upperLevelId: string | null; assessment: CompetenceAssessment | null };
export type ReferenceCriterion = {
    criterionId: string;
    demand: string;
    essentials: string[];
    equivalents: string[];
    optional: string[];
    mode: "qualitative" | "count" | "unsupported";
    expectedCount: number | null;
    ambiguity: string | null;
    boundary: string;
    decisionPlan: DecisionPlan | null;
    calibration: CompetenceCalibration | null;
};
export type PreparedReference = { sourceHash: string; criteria: ReferenceCriterion[] };
export type GradeRequestData = { images: File[]; guidance: string; rubric: RubricCriterion[]; reference: PreparedReference };
export type ValidItem = { concept: string; evidence: string };
export type ModelCriterionAnalysis = {
    criterionId: string;
    evidence: string[];
    gaps: string[];
    errors: string[];
    validItems: ValidItem[];
    judgment: LevelJudgment | null;
    analysis: string;
};
export type ModelGradingResult = {
    studentName: string | null; registration: string | null; questionNumber: string | null;
    criteriaAnalysis: ModelCriterionAnalysis[];
    strengths: string[]; improvements: string[]; overallAnalysis: string; feedback: string;
    gradingConfidence: number; needsHumanReview: boolean; reviewReason: string | null;
};
export type FinalCriterionAnalysis = {
    criterionId: string; criterion: string; status: CriterionStatus; analysis: string;
    maxPoints: number; awardedPoints: number; attainmentPercent: number;
    evidence: string[]; gaps: string[]; errors: string[];
    validCount: number | null; expectedCount: number | null;
    decisionDescription:string|null; decisionRationale:string|null; upperPercent:number|null;
    competenceAudit: string[];
};

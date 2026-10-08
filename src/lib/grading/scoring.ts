import { GradeError } from "./errors";

import type {
    CriterionStatus,
    FinalCriterionAnalysis,
    ModelGradingResult,
    RubricCriterion,
} from "./types";

const STATUS_FACTOR: Record<
    CriterionStatus,
    number
    > = {
    fully_met: 1,
    mostly_met: 0.75,
    partially_met: 0.5,
    minimally_met: 0.25,
    not_met: 0,
};

function roundScore(
    value: number
    ) {
    return Math.round(value * 100) / 100;
    }

export function calculateMaxScore(
    rubric: RubricCriterion[]
    ) {
    return roundScore(
        rubric.reduce(
        (sum, criterion) =>
            sum + criterion.points,
        0
        )
    );
}

export function buildScoredCriteria(
    rubric: RubricCriterion[],
    modelResult: ModelGradingResult
    ): FinalCriterionAnalysis[] {
    validateModelCriteria(
        rubric,
        modelResult
    );

    const analysisById =
        new Map(
        modelResult.criteriaAnalysis.map(
            (analysis) => [
            analysis.criterionId,
            analysis,
            ]
        )
        );

    return rubric.map(
        (criterion) => {
        const analysis =
            analysisById.get(
            criterion.id
            );

        if (!analysis) {
            throw new GradeError(
            "Critério ausente na resposta do modelo.",
            502
            );
        }

        const awardedPoints =
            roundScore(
            criterion.points *
                STATUS_FACTOR[
                analysis.status
                ]
        );

        return {
            criterionId:
            criterion.id,

            criterion:
            criterion.description,

            status:
            analysis.status,

            analysis:
            analysis.analysis,

            maxPoints:
            criterion.points,

            awardedPoints,
        };
        }
    );
}

export function calculateScore(
    criteria:
        FinalCriterionAnalysis[]
) {
    return roundScore(
        criteria.reduce(
        (sum, criterion) =>
            sum +
            criterion.awardedPoints,
        0
        )
    );
}

function validateModelCriteria(
    rubric: RubricCriterion[],
    modelResult: ModelGradingResult
) {
    const expectedIds =
        rubric.map(
        (criterion) =>
            criterion.id
        );

    const returnedIds =
        modelResult.criteriaAnalysis.map(
        (criterion) =>
            criterion.criterionId
        );

    const returnedSet =
        new Set(returnedIds);

    if (
        returnedSet.size !==
        returnedIds.length
    ) {
        throw new GradeError(
        "A API retornou critérios duplicados.",
        502
        );
    }

    if (
    returnedIds.length !==
        expectedIds.length
    ) {
        throw new GradeError(
        "A API retornou uma quantidade incorreta de critérios.",
        502
        );
    }

    const invalidId =
        returnedIds.find(
        (id) =>
            !expectedIds.includes(id)
        );

    if (invalidId) {
        throw new GradeError(
        "A API retornou um critério desconhecido.",
        502
        );
    }

    const missingId =
        expectedIds.find(
        (id) =>
            !returnedSet.has(id)
        );

    if (missingId) {
        throw new GradeError(
        "A API não retornou todos os critérios.",
        502
        );
    }
}
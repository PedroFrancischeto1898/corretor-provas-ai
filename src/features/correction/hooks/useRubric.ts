"use client";

import { useState } from "react";

import type {
    RubricCriterion,
} from "../types";

const INITIAL_RUBRIC: RubricCriterion[] = [
    {
        id: "criterion-1",
        description: "",
        points: 10,
    },
];

export function useRubric() {
    const [rubric, setRubric] =
        useState<RubricCriterion[]>(
        INITIAL_RUBRIC
        );

    const [
        nextCriterionId,
        setNextCriterionId,
    ] = useState(2);

    function addCriterion() {
        const criterion: RubricCriterion = {
        id: `criterion-${nextCriterionId}`,
        description: "",
        points: 0,
        };

        setRubric((current) => [
        ...current,
        criterion,
        ]);

        setNextCriterionId(
        (current) => current + 1
        );
    }

    function removeCriterion(
        id: string
    ) {
        setRubric((current) =>
        current.filter(
            (criterion) =>
            criterion.id !== id
        )
        );
    }

    function updateCriterion(
        id: string,
        field:
        | "description"
        | "points",
        value: string
    ) {
        setRubric((current) =>
        current.map((criterion) =>
            updateCriterionValue(
            criterion,
            id,
            field,
            value
            )
        )
        );
    }

    return {
        rubric,
        addCriterion,
        removeCriterion,
        updateCriterion,
    };
}

function updateCriterionValue(
    criterion: RubricCriterion,
    targetId: string,
    field:
        | "description"
        | "points",
    value: string
    ): RubricCriterion {
    if (criterion.id !== targetId) {
        return criterion;
    }

    if (field === "points") {
        return {
        ...criterion,
        points: Number(value),
        };
    }

    return {
        ...criterion,
        description: value,
    };
}
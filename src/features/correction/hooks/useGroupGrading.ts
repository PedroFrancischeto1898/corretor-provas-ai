"use client";

import { useState } from "react";

import { gradeGroup } from "../api";
import { sortResults } from "../helpers";

import type {
    CorrectionItem,
    ProcessingError,
    ProgressState,
    RubricCriterion,
} from "../types";

import type {
    StudentExamGroup,
} from "../grouping/types";

type RunGroupGradingData = {
    groups: StudentExamGroup[];
    criteria: string;
    rubric: RubricCriterion[];
};

type GroupProcessResult = {
    result: CorrectionItem | null;
    error: ProcessingError | null;
};

export function useGroupGrading() {
    const [
        results,
        setResults,
    ] = useState<CorrectionItem[]>([]);

    const [
        processingErrors,
        setProcessingErrors,
    ] = useState<ProcessingError[]>([]);

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        progress,
        setProgress,
    ] = useState<ProgressState>({
        current: 0,
        total: 0,
    });

    async function runGroupGrading({
        groups,
        criteria,
        rubric,
    }: RunGroupGradingData) {
        startGrading(
        groups.length
        );

        const completedResults:
        CorrectionItem[] = [];

        const errors:
        ProcessingError[] = [];

        for (
        let index = 0;
        index < groups.length;
        index++
        ) {
        const processResult =
            await processGroup(
            groups[index],
            criteria,
            rubric
            );

        if (processResult.result) {
            completedResults.push(
            processResult.result
            );
        }

        if (processResult.error) {
            errors.push(
            processResult.error
            );
        }

        setProgress({
            current: index + 1,
            total: groups.length,
        });
        }

        finishGrading(
        completedResults,
        errors
        );
    }

    function resetGrading() {
        setResults([]);
        setProcessingErrors([]);

        setProgress({
        current: 0,
        total: 0,
        });

        setLoading(false);
    }

    function startGrading(
        total: number
    ) {
    setResults([]);
    setProcessingErrors([]);

    setProgress({
        current: 0,
        total,
        });

        setLoading(true);
    }

    function finishGrading(
        completedResults: CorrectionItem[],
        errors: ProcessingError[]
    ) {
    setResults(
        sortResults(
            completedResults
        )
        );

        setProcessingErrors(
        errors
        );

        setLoading(false);
    }

    return {
        results,
        processingErrors,
        loading,
        progress,

        runGroupGrading,
        resetGrading,
    };
}

async function processGroup(
    group: StudentExamGroup,
    criteria: string,
    rubric: RubricCriterion[]
    ): Promise<GroupProcessResult> {
    try {
        const result =
        await gradeGroup(
            group,
            criteria,
            rubric
        );

        return {
        result,
        error: null,
        };
    } catch (error) {
        return {
        result: null,

        error:
            createGroupError(
            group,
            error
            ),
        };
    }
}

function createGroupError(
    group: StudentExamGroup,
    error: unknown
    ): ProcessingError {
    return {
        sourceFileName:
        getGroupLabel(group),

        message:
        error instanceof Error
            ? error.message
            : "Erro inesperado ao corrigir a prova.",
    };
}

function getGroupLabel(
    group: StudentExamGroup
    ) {
    if (group.studentName) {
        return group.studentName;
    }

    if (group.registration) {
        return group.registration;
    }

    return group.id;
}
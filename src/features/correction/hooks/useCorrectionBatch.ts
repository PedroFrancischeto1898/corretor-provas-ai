"use client";

import { useState } from "react";

import { gradeFile } from "../api";
import { sortResults } from "../helpers";

import type {
    CorrectionItem,
    ProcessingError,
    ProgressState,
    RubricCriterion,
} from "../types";

type RunBatchParams = {
    files: File[];
    criteria: string;
    rubric: RubricCriterion[];
};

export function useCorrectionBatch() {
    const [results, setResults] =
        useState<CorrectionItem[]>([]);

    const [
        processingErrors,
        setProcessingErrors,
    ] = useState<ProcessingError[]>([]);

    const [loading, setLoading] =
        useState(false);

    const [progress, setProgress] =
        useState<ProgressState>({
        current: 0,
        total: 0,
        });

    async function runBatch({
        files,
        criteria,
        rubric,
    }: RunBatchParams) {
        startBatch(files.length);

        const completed:
        CorrectionItem[] = [];

        const failures:
        ProcessingError[] = [];

        for (
        let index = 0;
        index < files.length;
        index++
        ) {
        await processFile({
            file: files[index],
            criteria,
            rubric,
            completed,
            failures,
        });

        updateProgress(
            index + 1,
            files.length
        );
        }

        finishBatch(completed);
    }

    function startBatch(
        total: number
    ) {
        setLoading(true);
        setResults([]);
        setProcessingErrors([]);

        setProgress({
        current: 0,
        total,
        });
    }

    async function processFile({
        file,
        criteria,
        rubric,
        completed,
        failures,
    }: {
        file: File;
        criteria: string;
        rubric: RubricCriterion[];
        completed: CorrectionItem[];
        failures: ProcessingError[];
    }) {
        try {
        const result =
            await gradeFile(
            file,
            criteria,
            rubric
            );

        completed.push(result);

        setResults(
            sortResults(completed)
        );
        } catch (error) {
        const failure =
            createProcessingError(
            file,
            error
            );

        failures.push(failure);

        setProcessingErrors([
            ...failures,
        ]);
        }
    }

    function updateProgress(
        current: number,
        total: number
    ) {
        setProgress({
        current,
        total,
        });
    }

    function finishBatch(
        completed:
        CorrectionItem[]
    ) {
        setResults(
        sortResults(completed)
        );

        setLoading(false);
    }

    return {
        results,
        processingErrors,
        loading,
        progress,
        runBatch,
    };
}

function createProcessingError(
    file: File,
    error: unknown
    ): ProcessingError {
    return {
        sourceFileName:
        file.name,

        message:
        error instanceof Error
            ? error.message
            : "Erro inesperado.",
    };
}
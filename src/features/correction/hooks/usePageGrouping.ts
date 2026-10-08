"use client";

import { useState } from "react";

import {
    identifyPage,
} from "../grouping/api";

import {
    groupPagesByStudent,
} from "../grouping/groupPages";

import {
    applyIdentification,
    createExamPages,
    markPageAsError,
} from "../grouping/helpers";

import {
    assignPageToGroup,
    updateGroupIdentity,
    createGroupFromPage,
} from "../grouping/assignments";

import type {
    ExamPage,
    GroupingProgress,
    PageProcessingError,
    StudentExamGroup,
} from "../grouping/types";

type PageProcessResult = {
    page: ExamPage;
    error: PageProcessingError | null;
};

export function usePageGrouping() {
    const [pages, setPages] =
        useState<ExamPage[]>([]);

    const [groups, setGroups] =
        useState<StudentExamGroup[]>([]);

    const [
        unassignedPages,
        setUnassignedPages,
    ] = useState<ExamPage[]>([]);

    const [
        processingErrors,
        setProcessingErrors,
    ] = useState<
        PageProcessingError[]
    >([]);

    const [loading, setLoading] =
        useState(false);

    const [progress, setProgress] =
        useState<GroupingProgress>({
        current: 0,
        total: 0,
    });

    async function identifyFiles(
        files: File[]
    ) {
        const initialPages =
        createExamPages(files);

        startIdentification(
        initialPages
        );

        const processedPages:
        ExamPage[] = [];

        const errors:
        PageProcessingError[] = [];

        for (
        let index = 0;
        index <
        initialPages.length;
        index++
        ) {
        const result =
            await processPage(
            initialPages[index]
            );

        processedPages.push(
            result.page
        );

        if (result.error) {
            errors.push(
            result.error
            );
        }

        updateProgress(
            index + 1,
            initialPages.length
        );
        }

        finishIdentification(
        processedPages,
        errors
        );
    }

    function resetGrouping() {
        setPages([]);
        setGroups([]);
        setUnassignedPages([]);
        setProcessingErrors([]);

        setProgress({
        current: 0,
        total: 0,
        });

        setLoading(false);
    }

    function startIdentification(
        initialPages: ExamPage[]
    ) {
        setPages(initialPages);
        setGroups([]);
        setUnassignedPages([]);
        setProcessingErrors([]);

        setProgress({
        current: 0,
        total:
            initialPages.length,
        });

        setLoading(true);
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

    function finishIdentification(
        processedPages: ExamPage[],
        errors: PageProcessingError[]
    ) {
        const grouping =
        groupPagesByStudent(
            processedPages
        );

        setPages(
        processedPages
        );

        setGroups(
        grouping.groups
        );

        setUnassignedPages(
        grouping.unassignedPages
        );

        setProcessingErrors(
        errors
        );

        setLoading(false);
    }

    function assignPage(
        pageId: string,
        groupId: string
        ) {
        const result =
            assignPageToGroup(
            groups,
            unassignedPages,
            pageId,
            groupId
            );

        setGroups(
            result.groups
        );

        setUnassignedPages(
            result.unassignedPages
        );
    }

    function createManualGroup(
    pageId: string,
    studentName: string,
    registration: string
    ) {
        const result =
            createGroupFromPage(
                groups,
                unassignedPages,
                pageId,
                studentName,
                registration
            );

        setGroups(
            result.groups
        );

        setUnassignedPages(
            result.unassignedPages
        );
    }

    function confirmGroupIdentity(
        groupId: string,
        studentName: string,
        registration: string
        ) {
        setGroups((currentGroups) =>
            updateGroupIdentity(
            currentGroups,
            groupId,
            studentName,
            registration
            )
        );
    }

    return {
        pages,
        groups,
        unassignedPages,
        processingErrors,

        loading,
        progress,

        identifyFiles,
        assignPage,
        resetGrouping,
        confirmGroupIdentity,
        createManualGroup,
    };
}

async function processPage(
    page: ExamPage
    ): Promise<PageProcessResult> {
    try {
        const identification =
        await identifyPage(page);

        return {
        page:
            applyIdentification(
            page,
            identification
            ),

        error: null,
        };
    } catch (error) {
        return {
        page:
            markPageAsError(page),

        error:
            createPageError(
            page,
            error
            ),
        };
    }
}

function createPageError(
    page: ExamPage,
    error: unknown
    ): PageProcessingError {
    return {
        fileId:
        page.id,

        fileName:
        page.file.name,

        message:
        error instanceof Error
            ? error.message
            : "Erro inesperado ao identificar a página.",
    };
}
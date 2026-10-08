"use client";

import { useState } from "react";

import { useCorrectionBatch } from "./useCorrectionBatch";
import { useCorrectionForm } from "./useCorrectionForm";
import { useFileSelection } from "./useFileSelection";
import { useRubric } from "./useRubric";

import {
    validateCorrection,
    } from "../validation";

    export function useCorrectionWorkspace() {
    const form =
        useCorrectionForm();

    const rubricState =
        useRubric();

    const fileSelection =
        useFileSelection();

    const batch =
        useCorrectionBatch();

    const [error, setError] =
        useState("");

    async function submitCorrection() {
        const validationError =
        validateCorrection({
            assessmentName:
            form.assessmentName,

            criteria:
            form.criteria,

            rubric:
            rubricState.rubric,

            files:
            fileSelection.files,
        });

        if (validationError) {
        setError(
            validationError
        );

        return;
        }

        setError("");

        await batch.runBatch({
        files:
            fileSelection.files,

        criteria:
            form.criteria,

        rubric:
            rubricState.rubric,
        });
    }

    return {
        assessmentName:
        form.assessmentName,

        setAssessmentName:
        form.setAssessmentName,

        criteria:
        form.criteria,

        setCriteria:
        form.setCriteria,

        rubric:
        rubricState.rubric,

        addCriterion:
        rubricState.addCriterion,

        removeCriterion:
        rubricState.removeCriterion,

        updateCriterion:
        rubricState.updateCriterion,

        files:
        fileSelection.files,

        handleFiles:
        fileSelection.addFiles,

        removeFile:
        fileSelection.removeFile,

        clearFiles:
        fileSelection.clearFiles,

        results:
        batch.results,

        processingErrors:
        batch.processingErrors,

        loading:
        batch.loading,

        progress:
        batch.progress,

        error,

        submitCorrection,
    };
}
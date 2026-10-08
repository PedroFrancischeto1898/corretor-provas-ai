"use client";

import {
    useRef,
    useState,
} from "react";

import { validateCorrection } from "../validation";

import { useCorrectionWorkspace } from "./useCorrectionWorkspace";
import { usePageGrouping } from "./usePageGrouping";

import { useGroupGrading } from "./useGroupGrading";

export type CorrectionStage =
    | "setup"
    | "identifying"
    | "review"
    | "grading"
    | "results";

export function useCorrectionFlow() {
    const correction =
        useCorrectionWorkspace();

    const grouping =
        usePageGrouping();

    const grading =
        useGroupGrading();

    const [stage, setStage] =
        useState<CorrectionStage>(
        "setup"
        );

    const [error, setError] =
        useState("");

    const actionLockRef =
        useRef(false);

    const [
        busyAction,
        setBusyAction,
    ] = useState<
        "identifying" |
        "grading" |
        null
    >(null);

    function beginAction(
        action:
            | "identifying"
            | "grading"
    ) {
        if (
            actionLockRef.current
        ) {
            return false;
        }

        actionLockRef.current =
            true;

        setBusyAction(action);

        return true;
    }

    function endAction() {
        actionLockRef.current =
            false;

        setBusyAction(null);
    }

    async function startIdentification() {
        if (
            !beginAction(
                "identifying"
            )
        ) {
            return;
        }

        try {
            const validationError =
                validateCorrection({
                    assessmentName:
                        correction.assessmentName,

                    criteria:
                        correction.criteria,

                    rubric:
                        correction.rubric,

                    files:
                        correction.files,
                });

            if (validationError) {
                setError(
                    validationError
                );

                return;
            }

            setError("");

            setStage(
                "identifying"
            );

            await grouping.identifyFiles(
                correction.files
            );

            setStage(
                "review"
            );
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível identificar as provas."
            );

            setStage(
                "setup"
            );
        } finally {
            endAction();
        }
    }

    async function confirmAndGrade() {
        if (
            !beginAction(
                "grading"
            )
        ) {
            return;
        }

        try {
            if (
                grouping
                    .unassignedPages
                    .length > 0
            ) {
                setError(
                    "Associe todas as páginas não atribuídas antes de iniciar a correção."
                );

                return;
            }

            if (
                grouping
                    .processingErrors
                    .length > 0
            ) {
                setError(
                    "Existem páginas com erro de identificação. Resolva esses erros antes de iniciar a correção."
                );

                return;
            }

            if (
                grouping.groups.length ===
                0
            ) {
                setError(
                    "Nenhuma prova foi identificada para correção."
                );

                return;
            }

            setError("");

            setStage(
                "grading"
            );

            await grading
                .runGroupGrading({
                    groups:
                        grouping.groups,

                    criteria:
                        correction.criteria,

                    rubric:
                        correction.rubric,
                });

            setStage(
                "results"
            );
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível corrigir as provas."
            );

            setStage(
                "review"
            );
        } finally {
            endAction();
        }
    }

    function returnToSetup() {
        grouping.resetGrouping();
        grading.resetGrading();

        setError("");

        setStage(
        "setup"
        );
    }

    return {
        stage,
        error,

        correction,
        grouping,
        grading,

        startIdentification,
        confirmAndGrade,
        returnToSetup,

        busyAction,

        isIdentifying:
            busyAction ===
            "identifying",

        isGrading:
            busyAction ===
            "grading",
    };
}
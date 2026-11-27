"use client";
import { useRef, useState } from "react";
import { validateCorrection } from "../validation";
import { prepareGradingReference } from "../api";
import type { PreparedReference, RubricCriterion } from "../types";
import { useCorrectionWorkspace } from "./useCorrectionWorkspace";
import { usePageGrouping } from "./usePageGrouping";
import { useGroupGrading } from "./useGroupGrading";

export type CorrectionStage = "setup" | "identifying" | "review" | "reference" | "grading" | "results";
type BusyAction = "identifying" | "preparing" | "grading";
type BatchSource = { criteria:string; rubric:RubricCriterion[]; files:File[]; assessmentName:string };

export function useCorrectionFlow() {
    const correction=useCorrectionWorkspace();
    const grouping=usePageGrouping();
    const grading=useGroupGrading();
    const [stage,setStage]=useState<CorrectionStage>("setup");
    const [error,setError]=useState("");
    const [busyAction,setBusyAction]=useState<BusyAction|null>(null);
    const actionLockRef=useRef(false);
    const [source,setSource]=useState<BatchSource|null>(null);
    const [reference,setReference]=useState<PreparedReference|null>(null);

    function beginAction(action:BusyAction) {
        if(actionLockRef.current) return false;
        actionLockRef.current=true;
        setBusyAction(action);
        return true;
    }
    function endAction() {
        actionLockRef.current=false;
        setBusyAction(null);
    }
    async function startIdentification() {
        if(!beginAction("identifying")) return;
        try {
            const snapshot={assessmentName:correction.assessmentName,criteria:correction.criteria.trim(),rubric:correction.rubric.map(c=>({...c})),files:[...correction.files]};
            const problem=validateCorrection(snapshot);
            if(problem){setError(problem);return;}
            setSource(snapshot);
            setReference(null);
            setError("");
            setStage("identifying");
            await grouping.identifyFiles(snapshot.files);
            setStage("review");
        } catch(error) {
            setError(error instanceof Error?error.message:"Não foi possível identificar as provas.");
            setStage("setup");
        } finally {endAction();}
    }
    function groupingError() {
        if(grouping.unassignedPages.length>0) return "Associe todas as páginas não atribuídas antes de iniciar a correção.";
        if(grouping.processingErrors.length>0) return "Existem páginas com erro de identificação. Resolva esses erros antes de iniciar a correção.";
        if(grouping.groups.length===0) return "Nenhuma prova foi identificada para correção.";
        return null;
    }
    async function prepareAndReview() {
        if(!beginAction("preparing")) return;
        try {
            const problem=groupingError();
            if(problem){setError(problem);return;}
            if(!source) throw new Error("Configure a avaliação novamente.");
            setError("");
            // Reutiliza a referência se o professor voltar apenas ao agrupamento.
            if(!reference) setReference(await prepareGradingReference(source.criteria,source.rubric));
            setStage("reference");
        } catch(error) {
            setError(error instanceof Error?error.message:"Não foi possível preparar a referência.");
        } finally {endAction();}
    }
    async function confirmAndGrade() {
        if(!beginAction("grading")) return;
        try {
            if(!source || !reference) throw new Error("Prepare e confira a referência antes de corrigir.");
            if(reference.criteria.some(c=>c.ambiguity!==null || c.mode==="unsupported")) throw new Error("Esclareça as regras da referência antes da correção.");
            const problem=groupingError();
            if(problem) throw new Error(problem);
            setError("");
            setStage("grading");
            await grading.runGroupGrading({groups:grouping.groups,criteria:source.criteria,rubric:source.rubric,reference});
            setStage("results");
        } catch(error) {
            setError(error instanceof Error?error.message:"Não foi possível corrigir as provas.");
            setStage("reference");
        } finally {endAction();}
    }
    function returnToReview() {
        if(actionLockRef.current) return;
        setError("");
        setStage("review");
    }
    function returnToSetup() {
        if(actionLockRef.current) return;
        grouping.resetGrouping();
        grading.resetGrading();
        setSource(null);
        setReference(null);
        setError("");
        setStage("setup");
    }
    return {stage,error,correction,grouping,grading,reference,
        batchRubric:source?.rubric ?? correction.rubric,
        batchAssessmentName:source?.assessmentName ?? correction.assessmentName,
        startIdentification,prepareAndReview,confirmAndGrade,returnToReview,returnToSetup,busyAction,
        isIdentifying:busyAction==="identifying",isPreparing:busyAction==="preparing",isGrading:busyAction==="grading"};
}

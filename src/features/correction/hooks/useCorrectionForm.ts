"use client";

import { useState } from "react";

export function useCorrectionForm() {
    const [assessmentName, setAssessmentName] =
        useState("");

    const [criteria, setCriteria] =
        useState("");

    return {
        assessmentName,
        setAssessmentName,

        criteria,
        setCriteria,
    };
}
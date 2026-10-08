"use client";

import { useState } from "react";

import { fileKey } from "../helpers";

export function useFileSelection() {
    const [files, setFiles] =
        useState<File[]>([]);

    function addFiles(
        fileList: FileList | null
    ) {
        if (!fileList) {
        return;
        }

        const incoming =
        Array.from(fileList);

        setFiles((current) =>
        mergeUniqueFiles(
            current,
            incoming
        )
        );
    }

    function removeFile(
        index: number
    ) {
        setFiles((current) =>
        current.filter(
            (_, currentIndex) =>
            currentIndex !== index
        )
        );
    }

    function clearFiles() {
        setFiles([]);
    }

    return {
        files,
        addFiles,
        removeFile,
        clearFiles,
    };
}

function mergeUniqueFiles(
    current: File[],
    incoming: File[]
) {
    const existing =
        new Set(
        current.map(fileKey)
        );

    const unique =
        incoming.filter(
        (file) =>
            !existing.has(
            fileKey(file)
            )
        );

    return [
        ...current,
        ...unique,
    ];
}
"use client";

import {
    useState,
} from "react";

import type {
    StudentExamGroup,
} from "../../grouping/types";

type Props = {
    groups: StudentExamGroup[];

    onAssign: (
        groupId: string
    ) => void;
};

export function PageAssignment({
    groups,
    onAssign,
    }: Props) {
    const [
        selectedGroupId,
        setSelectedGroupId,
    ] = useState("");

    function handleAssign() {
        if (!selectedGroupId) {
        return;
        }

        onAssign(
        selectedGroupId
        );
    }

    return (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <select
            value={
            selectedGroupId
            }
            onChange={(event) =>
            setSelectedGroupId(
                event.target.value
            )
            }
            className="flex-1 rounded-lg border border-slate-300 bg-white p-2"
        >
            <option value="">
            Selecione o estudante
            </option>

            {groups.map(
            (group) => (
                <option
                key={group.id}
                value={group.id}
                >
                {group.studentName ??
                    "Nome não identificado"}
                {" — "}
                {group.registration ??
                    "sem matrícula"}
                </option>
            )
            )}
        </select>

        <button
            type="button"
            disabled={
            !selectedGroupId
            }
            onClick={
            handleAssign
            }
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
            Associar
        </button>
        </div>
    );
}
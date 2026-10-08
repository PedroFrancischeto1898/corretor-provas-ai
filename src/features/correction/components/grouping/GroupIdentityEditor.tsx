"use client";

import { useState } from "react";

import type {
    StudentExamGroup,
} from "../../grouping/types";

type Props = {
    group: StudentExamGroup;

    onSave: (
        groupId: string,
        studentName: string,
        registration: string
    ) => void;
};

export function GroupIdentityEditor({
    group,
    onSave,
    }: Props) {
    const [editing, setEditing] =
        useState(
        group.needsHumanReview
        );

    const [
        studentName,
        setStudentName,
    ] = useState(
        group.studentName ?? ""
    );

    const [
        registration,
        setRegistration,
    ] = useState(
        group.registration ?? ""
    );

    function handleSave() {
        onSave(
        group.id,
        studentName,
        registration
        );

        setEditing(false);
    }

    if (!editing) {
        return (
        <button
            type="button"
            onClick={() =>
            setEditing(true)
            }
            className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800"
        >
            Conferido
        </button>
        );
    }

    return (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="font-semibold text-amber-900">
            Confira a identificação
        </p>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
            <label className="mb-1 block text-sm font-medium">
                Nome do estudante
            </label>

            <input
                type="text"
                value={studentName}
                onChange={(event) =>
                setStudentName(
                    event.target.value
                )
                }
                className="w-full rounded-lg border border-slate-300 bg-white p-3"
            />
            </div>

            <div>
            <label className="mb-1 block text-sm font-medium">
                Matrícula
            </label>

            <input
                type="text"
                value={registration}
                onChange={(event) =>
                setRegistration(
                    event.target.value
                )
                }
                className="w-full rounded-lg border border-slate-300 bg-white p-3"
            />
            </div>
        </div>

        <button
            type="button"
            onClick={handleSave}
            className="mt-3 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
        >
            Confirmar identificação
        </button>
        </div>
    );
}
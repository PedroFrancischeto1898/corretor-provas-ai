"use client";

import {
    useState,
} from "react";

import { PageItem } from "./PageItem";
import { PageAssignment } from "./PageAssignment";

import type {
    ExamPage,
    StudentExamGroup,
} from "../../grouping/types";

type Props = {
    pages: ExamPage[];
    groups: StudentExamGroup[];

    onAssignPage: (
        pageId: string,
        groupId: string
    ) => void;

    onCreateGroup: (
        pageId: string,
        studentName: string,
        registration: string
    ) => void;
};

export function UnassignedPages({
    pages,
    groups,
    onAssignPage,
    onCreateGroup,
    }: Props) {
        if (pages.length === 0) {
            return null;
        }

        return (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="font-bold text-amber-900">
                Páginas não atribuídas
            </h3>

            <p className="mt-1 text-sm text-amber-800">
                Não foi possível identificar
                com segurança a matrícula
                destas páginas.
            </p>

            <div className="mt-4 space-y-2">
                {pages.map(
                    (page) => (
                        <div
                        key={page.id}
                        className="rounded-xl bg-white p-3"
                        >
                    <UnassignedPageCard
                        key={page.id}
                        page={page}
                        groups={groups}
                        onAssignPage={
                            onAssignPage
                        }
                        onCreateGroup={
                            onCreateGroup
                        }
                    />
                        </div>
                    )
                )}
            </div>
            </section>
        );

}

function UnassignedPageCard({
    page,
    groups,
    onAssignPage,
    onCreateGroup,
}: {
    page: ExamPage;
    groups: StudentExamGroup[];

    onAssignPage: (
        pageId: string,
        groupId: string
    ) => void;

    onCreateGroup: (
        pageId: string,
        studentName: string,
        registration: string
    ) => void;
}) {
    const [
        studentName,
        setStudentName,
    ] = useState(
        page.identification
            ?.studentName ??
        ""
    );

    const [
        registration,
        setRegistration,
    ] = useState(
        page.identification
            ?.registration ??
        ""
    );

    function handleCreate() {
        if (
            !studentName.trim()
        ) {
            return;
        }

        onCreateGroup(
            page.id,
            studentName,
            registration
        );
    }

    return (
        <div className="rounded-xl bg-white p-4">
            <PageItem
                page={page}
            />

            {groups.length > 0 && (
                <>
                    <PageAssignment
                        groups={groups}
                        onAssign={(
                            groupId
                        ) =>
                            onAssignPage(
                                page.id,
                                groupId
                            )
                        }
                    />

                    <div className="my-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-200" />

                        <span className="text-xs font-semibold uppercase text-slate-400">
                            ou
                        </span>

                        <div className="h-px flex-1 bg-slate-200" />
                    </div>
                </>
            )}

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-800">
                    Informar estudante manualmente
                </p>

                <p className="mt-1 text-sm text-slate-500">
                    Use esta opção quando o nome ou a matrícula não forem identificados corretamente.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700">
                            Nome do estudante
                        </label>

                        <input
                            type="text"
                            value={
                                studentName
                            }
                            onChange={(
                                event
                            ) =>
                                setStudentName(
                                    event.target.value
                                )
                            }
                            placeholder="Digite o nome"
                            className="w-full rounded-lg border border-slate-300 bg-white p-3"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700">
                            Matrícula
                            <span className="ml-1 font-normal text-slate-400">
                                (opcional)
                            </span>
                        </label>

                        <input
                            type="text"
                            value={
                                registration
                            }
                            onChange={(
                                event
                            ) =>
                                setRegistration(
                                    event.target.value
                                )
                            }
                            placeholder="Digite a matrícula"
                            className="w-full rounded-lg border border-slate-300 bg-white p-3"
                        />
                    </div>
                </div>

                <button
                    type="button"
                    disabled={
                        !studentName.trim()
                    }
                    onClick={
                        handleCreate
                    }
                    className="mt-4 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Criar estudante com esta página
                </button>
            </div>
        </div>
    );
}
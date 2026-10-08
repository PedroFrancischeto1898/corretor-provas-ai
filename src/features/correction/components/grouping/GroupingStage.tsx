import { GroupingReview } from "./GroupingReview";

import type {
    ExamPage,
    StudentExamGroup,
} from "../../grouping/types";

type Props = {
    groups: StudentExamGroup[];
    unassignedPages: ExamPage[];
    loading: boolean;
    error: string;
    onBack: () => void;
    onAssignPage: (
        pageId: string,
        groupId: string
    ) => void;
    onConfirm: () => void;
    onConfirmIdentity: (
        groupId: string,
        studentName: string,
        registration: string

    ) => void;
    onCreateGroup: (
        pageId: string,
        studentName: string,
        registration: string
    ) => void;
};

export function GroupingStage({
    groups,
    unassignedPages,
    onBack,
    onAssignPage,
    onConfirm,
    onConfirmIdentity,
    loading,
    error,
    onCreateGroup,
}: Props) {
    return (
        <main className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-5xl">
            <button
            type="button"
            onClick={onBack}
            className="mb-4 text-sm font-semibold text-blue-700"
            >
            ← Voltar à configuração
            </button>

            <GroupingReview
            groups={groups}
            unassignedPages={unassignedPages}
            onAssignPage={onAssignPage}
            onConfirmIdentity={onConfirmIdentity}
            onCreateGroup={onCreateGroup}
            />
            <div className="mt-6">
            {error && (
                <div className="mb-4 rounded-xl bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}
            <button
                type="button"
                onClick={onConfirm}
                disabled={
                loading ||
                groups.length === 0 ||
                unassignedPages.length > 0
                }
                aria-busy={loading}
                className="w-full rounded-xl bg-blue-600 p-4 font-bold text-white transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading ? (
                <span className="flex items-center justify-center gap-3">
                    <span
                        className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
                        aria-hidden="true"
                    />

                        Iniciando correção...
                    </span>
                ) : (
                    "Confirmar organização e corrigir"
                )}
            </button>
            </div>
        </div>
        </main>
    );
}
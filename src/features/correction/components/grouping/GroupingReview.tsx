import { StudentGroupCard } from "./StudentGroupCard";
import { UnassignedPages } from "./UnassignedPages";

import type {
    ExamPage,
    StudentExamGroup,
} from "../../grouping/types";

type Props = {
    groups: StudentExamGroup[];
    unassignedPages: ExamPage[];
    onAssignPage: (
        pageId: string,
        groupId: string
    ) => void;
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

export function GroupingReview({
    groups,
    unassignedPages,
    onAssignPage,
    onConfirmIdentity,
    onCreateGroup,
    }: Props) {
    if (
        groups.length === 0 &&
        unassignedPages.length === 0
    ) {
        return null;
    }

    return (
        <section className="mt-8">
        <header>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Conferência
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-900">
            Organização das provas
            </h2>

            <p className="mt-2 text-slate-600">
            Confira se as páginas foram
            associadas corretamente aos
            estudantes antes da correção.
            </p>
        </header>

        <div className="mt-6 space-y-5">
            {groups.map(
            (group) => (
                <StudentGroupCard
                key={group.id}
                group={group}
                onConfirmIdentity={onConfirmIdentity}
                />
            )
            )}

            <UnassignedPages
                pages={unassignedPages}
                groups={groups}
                onAssignPage={
                    onAssignPage
                }
                onCreateGroup={
                    onCreateGroup
                }
            />
        </div>
        </section>
    );
}
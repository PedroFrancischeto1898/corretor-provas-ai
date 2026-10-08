import { GroupIdentityEditor } from "./GroupIdentityEditor";
import { PageItem } from "./PageItem";

import type {
    StudentExamGroup,
} from "../../grouping/types";

type Props = {
    group: StudentExamGroup;

    onConfirmIdentity: (
        groupId: string,
        studentName: string,
        registration: string
    ) => void;
};

export function StudentGroupCard({
    group,
    onConfirmIdentity,
    }: Props) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
        <GroupHeader
            group={group}
        />

        <GroupIdentityEditor
            group={group}
            onSave={onConfirmIdentity}
        />

        <div className="mt-4 space-y-2">
            {group.pages.map(
            (page) => (
                <PageItem
                key={page.id}
                page={page}
                />
            )
            )}
        </div>
        </article>
    );
}

function GroupHeader({
    group,
    }: {
    group: StudentExamGroup;
    }) {
    return (
        <div>
        <p className="text-sm text-slate-500">
            Estudante
        </p>

        <h3 className="text-lg font-bold text-slate-900">
            {group.studentName ??
            "Nome não identificado"}
        </h3>

        <p className="mt-1 text-sm text-slate-600">
            Matrícula:{" "}
            {group.registration ??
            "não identificada"}
        </p>
        </div>
    );
}
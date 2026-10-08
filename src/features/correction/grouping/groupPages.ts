import type {
    ExamPage,
    StudentExamGroup,
} from "./types";

export type GroupingResult = {
    groups: StudentExamGroup[];
    unassignedPages: ExamPage[];
};

export function groupPagesByStudent(
    pages: ExamPage[]
): GroupingResult {
    const identifiedPages =
        pages.filter(
        isIdentifiedPage
        );

    const unassignedPages =
        pages.filter(
        isUnassignedPage
        );

    const groupsMap =
        buildGroupsMap(
        identifiedPages
        );

    return {
        groups:
        Array.from(
            groupsMap.values()
        ),

        unassignedPages,
    };
}

function isIdentifiedPage(
    page: ExamPage
    ) {
    return (
        page.status ===
        "identified" &&
        hasRegistration(page)
    );
}

function isUnassignedPage(
    page: ExamPage
    ) {
    return (
        page.status ===
        "unassigned"
    );
}

function hasRegistration(
    page: ExamPage
    ): boolean {
    return Boolean(
        page.identification
        ?.registration
        ?.trim()
    );
}

function buildGroupsMap(
    pages: ExamPage[]
    ) {
    const groups =
        new Map<
        string,
        StudentExamGroup
        >();

    for (const page of pages) {
        addPageToGroup(
        groups,
        page
        );
    }

    return groups;
}

function addPageToGroup(
    groups: Map<
        string,
        StudentExamGroup
    >,
    page: ExamPage
) {
    const identification =
        page.identification;

    if (
        !identification
        ?.registration
    ) {
        return;
    }

    const registration =
        normalizeRegistration(
        identification.registration
        );

    const existing =
        groups.get(
        registration
        );

    if (existing) {
        existing.pages.push(page);

        existing.needsHumanReview =
        existing.needsHumanReview ||
        identification.needsHumanReview;

        return;
    }

    groups.set(
        registration,
        createGroup(
        registration,
        page
        )
    );
}

function createGroup(
    registration: string,
    page: ExamPage
    ): StudentExamGroup {
    const identification =
        page.identification;

    return {
        id:
        `student-${registration}`,

        studentName:
        identification
            ?.studentName ??
        null,

        registration,

        pages: [page],

        needsHumanReview:
        identification
            ?.needsHumanReview ??
        false,
    };
}

function normalizeRegistration(
    registration: string
    ) {
    return registration
        .replace(/\D/g, "")
        .trim();
}
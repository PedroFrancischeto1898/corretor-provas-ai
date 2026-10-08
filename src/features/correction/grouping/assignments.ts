import type {
    ExamPage,
    StudentExamGroup,
} from "./types";

type AssignmentResult = {
    groups: StudentExamGroup[];
    unassignedPages: ExamPage[];
};

export function createGroupFromPage(
    groups: StudentExamGroup[],
    unassignedPages: ExamPage[],
    pageId: string,
    studentName: string,
    registration: string
): AssignmentResult {
    const page =
        unassignedPages.find(
            (item) =>
                item.id === pageId
        );

    const normalizedName =
        studentName.trim();

    const normalizedRegistration =
        registration.trim();

    if (
        !page ||
        !normalizedName
    ) {
        return {
            groups,
            unassignedPages,
        };
    }

    const assignedPage: ExamPage = {
        ...page,
        status: "identified",
        assignmentSource: "manual",
    };

    const newGroup: StudentExamGroup = {
        id:
            `manual-${page.id}`,

        studentName:
            normalizedName,

        registration:
            normalizedRegistration ||
            null,

        pages: [
            assignedPage,
        ],

        needsHumanReview: false,
    };

    return {
        groups: [
            ...groups,
            newGroup,
        ],

        unassignedPages:
            unassignedPages.filter(
                (item) =>
                    item.id !==
                    pageId
            ),
    };
}

export function updateGroupIdentity(
    groups: StudentExamGroup[],
    groupId: string,
    studentName: string,
    registration: string
    ): StudentExamGroup[] {
    return groups.map((group) => {
        if (group.id !== groupId) {
        return group;
        }

        return {
        ...group,

        studentName:
            studentName.trim() ||
            null,

        registration:
            registration.trim() ||
            null,

        needsHumanReview: false,
        };
    });
}
export function assignPageToGroup(
    groups: StudentExamGroup[],
    unassignedPages: ExamPage[],
    pageId: string,
    groupId: string
): AssignmentResult {
    const page =
        unassignedPages.find(
        (item) =>
            item.id === pageId
        );

    if (!page) {
        return {
        groups,
        unassignedPages,
        };
    }

    const assignedPage: ExamPage = {
        ...page,
        status: "identified",
        assignmentSource: "manual",
    };

    return {
        groups:
        addPageToSelectedGroup(
            groups,
            assignedPage,
            groupId
        ),

    unassignedPages:
        unassignedPages.filter(
            (item) =>
            item.id !== pageId
        ),
    };
}

function addPageToSelectedGroup(
    groups: StudentExamGroup[],
    page: ExamPage,
    groupId: string
) {
    return groups.map(
        (group) => {
        if (
            group.id !== groupId
        ) {
            return group;
        }

        return {
            ...group,
            pages: [
            ...group.pages,
            page,
            ],
        };
        }
    );
}
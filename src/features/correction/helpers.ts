import type {
    CorrectionItem,
    RubricCriterion,
} from "./types";

export function sortResults(
    items: CorrectionItem[]
) {
    return [...items].sort(
        (a, b) => {
            const nameA =
                a.data.studentName?.trim() ||
                a.sourceFileName;

            const nameB =
                b.data.studentName?.trim() ||
                b.sourceFileName;

            return nameA.localeCompare(
                nameB,
                "pt-BR",
                {
                    sensitivity: "base",
                }
            );
        }
    );
}

export function calculateRubricTotal(
    rubric: RubricCriterion[]
) {
    return rubric.reduce(
        (total, criterion) =>
            total +
        (Number.isFinite(criterion.points) ? criterion.points : 0), 0
    );
}

export function fileKey( file: File) {
    return `${file.name}-${file.size}`;
}
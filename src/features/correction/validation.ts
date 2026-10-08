import type {
    RubricCriterion,
} from "./types";

type ValidationData = {
    assessmentName: string;
    criteria: string;
    rubric: RubricCriterion[];
    files: File[];
};

export function validateCorrection(
    data: ValidationData
): string | null {
    if (!data.assessmentName.trim()) {
        return "Informe o nome da avaliação.";
    }

    if (!data.criteria.trim()) {
        return "Informe as orientações de correção.";
    }

    if (data.rubric.length === 0) {
        return "Adicione pelo menos um critério à rubrica.";
    }

    const invalidCriterion =
        data.rubric.some(
            (criterion) =>
            !criterion.description.trim() ||
            !Number.isFinite(
                criterion.points
            ) ||
            criterion.points <= 0
        );

    if (invalidCriterion) {
        return "Preencha todos os critérios e suas pontuações.";
    }

    if (data.files.length === 0) {
        return "Selecione pelo menos uma prova.";
    }

    return null;
}
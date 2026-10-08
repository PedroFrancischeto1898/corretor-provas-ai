import { GradeError } from "./errors";

import type {
    GradeRequestData,
    RubricCriterion,
} from "./types";

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

const MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

function validateImage(
    image: FormDataEntryValue | null
    ): File {
    if (!(image instanceof File)) {
        throw new GradeError(
        "Nenhuma imagem foi enviada."
        );
    }

    if (
        !ALLOWED_IMAGE_TYPES.includes(
            image.type
            )
    ) {
        throw new GradeError(
        "Formato de imagem não suportado."
        );
    }

    if (image.size > MAX_IMAGE_SIZE) {
        throw new GradeError(
        "A imagem deve ter no máximo 10 MB."
        );
    }

    return image;
}

function parseImages(
    formData: FormData
    ): File[] {
    const images = formData
        .getAll("images")
        .filter(
        (item): item is File =>
            item instanceof File &&
            item.size > 0
        );

    // Compatibilidade temporária com
    // o frontend antigo.
    if (images.length === 0) {
        const legacyImage =
        formData.get("image");

        if (
        legacyImage instanceof File &&
        legacyImage.size > 0
        ) {
        images.push(legacyImage);
        }
    }

    if (images.length === 0) {
        throw new GradeError(
        "Nenhuma imagem da prova foi enviada."
        );
    }

    images.forEach(validateImage);

    return images;
}

function validateGuidance(
    value: FormDataEntryValue | null
    ): string {
    if (
        typeof value !== "string" ||
        !value.trim()
    ) {
        throw new GradeError(
        "As orientações de correção não foram informadas."
        );
    }

    return value.trim();
}

function parseRubric(
    value: FormDataEntryValue | null
    ): RubricCriterion[] {
    if (typeof value !== "string") {
        throw new GradeError(
        "A rubrica de correção não foi informada."
        );
    }

    let rubric: unknown;

    try {
        rubric = JSON.parse(value);
    } catch {
        throw new GradeError(
        "A rubrica enviada possui formato inválido."
        );
    }

    if (
        !Array.isArray(rubric) ||
        rubric.length === 0
    ) {
        throw new GradeError(
        "Adicione pelo menos um critério à rubrica."
        );
    }

    return validateRubricItems(
        rubric
    );
}

function validateRubricItems(
    rubric: unknown[]
    ): RubricCriterion[] {
    const validatedRubric =
        rubric.map((item) => {
        if (!isValidRubricCriterion(item)) {
            throw new GradeError(
            "Há critérios incompletos ou com pontuação inválida."
            );
        }

        return item;
        });

    validateUniqueIds(
        validatedRubric
    );

    return validatedRubric;
}

function isValidRubricCriterion(
    item: unknown
    ): item is RubricCriterion {
    if (
        typeof item !== "object" ||
        item === null
    ) {
        return false;
    }

    const criterion =
        item as Partial<RubricCriterion>;

    return (
        typeof criterion.id === "string" &&
        criterion.id.trim() !== "" &&
        typeof criterion.description ===
        "string" &&
        criterion.description.trim() !== "" &&
        typeof criterion.points === "number" &&
        Number.isFinite(criterion.points) &&
        criterion.points > 0
    );
}

function validateUniqueIds(
    rubric: RubricCriterion[]
    ) {
    const ids = rubric.map(
        (criterion) => criterion.id
    );

    if (
        new Set(ids).size !== ids.length
    ) {
        throw new GradeError(
        "A rubrica contém critérios duplicados."
        );
    }
}

export async function parseGradeRequest(
    request: Request
    ): Promise<GradeRequestData> {
    const formData =
        await request.formData();

    const images =
        parseImages(formData);

    const guidance =
        validateGuidance(
        formData.get("criteria")
        );

    const rubric =
        parseRubric(
        formData.get("rubric")
        );

    return {
        images,
        guidance,
        rubric,
    };
}
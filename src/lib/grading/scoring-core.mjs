// Núcleo de cálculo puro, sem API ou dependências.
/** @param {number} maxPoints @param {string} mode @param {number} value @param {number|null} [expectedCount] */
export function scoreCriterion(maxPoints, mode, value, expectedCount=null) {
    const cents = Math.round(maxPoints * 100);
    if (typeof maxPoints !== "number" || !Number.isFinite(maxPoints) || maxPoints < 0.01 || !Number.isSafeInteger(cents) || Math.abs(maxPoints * 100 - cents) > 1e-7) throw new Error("Pontuação máxima inválida (use até duas casas decimais).");
    let numerator, denominator;
    if (mode === "count") {
        if (expectedCount === null || !Number.isSafeInteger(expectedCount) || expectedCount < 1 || !Number.isSafeInteger(value) || value < 0) throw new Error("Contagem inválida.");
        numerator = Math.min(value, expectedCount); denominator = expectedCount;
    } else if (mode === "qualitative") {
        if (!Number.isInteger(value) || value < 0 || value > 100 || expectedCount !== null) throw new Error("Percentual qualitativo inválido.");
        numerator = value; denominator = 100;
    } else throw new Error("Regra de pontuação não suportada.");
    const ratio = numerator / denominator;
    const status = numerator === 0 ? "not_met" : numerator === denominator ? "fully_met" : ratio < 0.4 ? "minimally_met" : ratio < 0.7 ? "partially_met" : "mostly_met";
    // Arredondamento exato de frações em centavos, sem imprecisão binária em .5.
    const twice = BigInt(2);
    const d = BigInt(denominator);
    const rounded = (twice * BigInt(cents) * BigInt(numerator) + d) / (twice * d);
    return {awardedPoints: Number(rounded) / 100, attainmentPercent: 100 * ratio, status};
}

/** @param {number[]} values */
export function totalPoints(values) { return values.reduce((sum, value) => sum + Math.round(value * 100), 0) / 100; }

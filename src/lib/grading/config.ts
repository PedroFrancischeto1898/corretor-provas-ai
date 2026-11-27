import { GradeError } from "./errors";

// Perfis experimentais, selecionados apenas no servidor.
// D é o perfil padrão validado; B e C permanecem como alternativas pontuais.
export function getGradingExperimentConfig(): {
    model: string;
    effort: "low" | "medium";
} {
    switch (process.env.GRADING_EXPERIMENT_PROFILE ?? "D") {
        case "B":
            return { model: "gpt-5.6-terra", effort: "low" };
        case "C":
            return { model: "gpt-6.1-terra", effort: "low" };
        case "D":
            return { model: "gpt-6.1-terra", effort: "medium" };
        default:
            throw new GradeError("Perfil experimental de correção inválido.", 500);
    }
}


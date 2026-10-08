import { ProgressBar } from "./ProgressBar";

import type {
    ProgressState,
} from "../types";

type Props = {
    progress: ProgressState;
};

export function GradingStage({
    progress,
    }: Props) {
    return (
        <main className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-3xl">
            <section className="rounded-2xl bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                Correção em andamento
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Corrigindo provas
            </h1>

            <p className="mt-2 text-slate-600">
                As provas estão sendo corrigidas
                uma a uma com base na rubrica
                definida.
            </p>

            <ProgressBar
                progress={progress}
            />
            </section>
        </div>
        </main>
    );
}
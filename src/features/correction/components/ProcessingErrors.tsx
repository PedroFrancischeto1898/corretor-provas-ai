import type {
    ProcessingError,
} from "../types";

type Props = {
    errors: ProcessingError[];
};

export function ProcessingErrors({
    errors,
    }: Props) {
    if (errors.length === 0) {
        return null;
    }

    return (
        <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-bold text-red-800">
            Algumas provas apresentaram erro
        </h2>

        <div className="mt-3 space-y-2">
        {errors.map((error) => (
                <p
                    key={error.sourceFileName}
                    className="text-sm text-red-700"
                >
                    <strong>
                    {error.sourceFileName}
                    </strong>
                    : {error.message}
                </p>
        ))}
        </div>
        </section>
    );
}
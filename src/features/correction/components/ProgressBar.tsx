import type {
    ProgressState,
} from "../types";

type Props = {
    progress: ProgressState;
};

export function ProgressBar({
    progress,
    }: Props) {
    const percentage =
        calculatePercentage(progress);

    return (
        <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
            <span>
            Processando provas
            </span>

            <span>
            {progress.current}
            {" / "}
            {progress.total}
            </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
            <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{
                width: `${percentage}%`,
            }}
            />
        </div>
        </div>
    );
}

function calculatePercentage(
    progress: ProgressState
    ) {
    if (progress.total === 0) {
        return 0;
    }

    return (
        progress.current /
        progress.total
    ) * 100;
}
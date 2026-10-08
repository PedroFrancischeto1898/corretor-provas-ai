type Props = {
    loading: boolean;
    fileCount: number;
    error: string;
    label: string;
};

export function SubmitSection({
    loading,
    fileCount,
    error,
    label,
}: Props) {
    return (
        <div>
        {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
            </div>
        )}

        <button
            type="submit"
            disabled={
            loading ||
            fileCount === 0
            }
            aria-busy={loading}
            className="w-full rounded-xl bg-blue-600 p-4 font-bold text-white disabled:opacity-50"
        >
            {loading ? (
                <span className="flex items-center justify-center gap-3">
                    <span
                        className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
                        aria-hidden="true"
                    />

                    Identificando provas...
                </span>
            ) : (
                label
            )}
        </button>
        </div>
    );
}
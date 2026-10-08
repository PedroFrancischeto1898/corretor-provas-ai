type FileUploaderProps = {
    files: File[];
    loading: boolean;

    onFiles: (
        files: FileList | null
    ) => void;

    onRemove: (
        index: number
    ) => void;

    onClear: () => void;
};

type SelectedFilesProps = {
    files: File[];
    loading: boolean;

    onRemove: (
        index: number
    ) => void;

    onClear: () => void;
};

type SelectedFileProps = {
    file: File;
    index: number;
    loading: boolean;

    onRemove: (
        index: number
    ) => void;
};

export function FileUploader({
    files,
    loading,
    onFiles,
    onRemove,
    onClear,
    }: FileUploaderProps) {
    return (
        <div>
        <label
            htmlFor="files"
            className="mb-2 block font-semibold text-slate-800"
        >
            Provas
        </label>

        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6">
            <input
            id="files"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            disabled={loading}
            onChange={(event) =>
                onFiles(
                event.target.files
                )
            }
            />

            <p className="mt-3 text-sm text-slate-500">
            Você pode selecionar várias imagens.
            </p>
        </div>

        <SelectedFiles
            files={files}
            loading={loading}
            onRemove={onRemove}
            onClear={onClear}
        />
        </div>
    );
}

function SelectedFiles({
    files,
    loading,
    onRemove,
    onClear,
    }: SelectedFilesProps) {
    if (files.length === 0) {
        return null;
    }

    return (
        <div className="mt-4">
        <div className="flex items-center justify-between">
            <strong>
            Arquivos selecionados
            </strong>

            <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
                {files.length} arquivo(s)
            </span>

            <button
                type="button"
                disabled={loading}
                onClick={onClear}
                className="text-sm font-semibold text-red-600 disabled:opacity-50"
            >
                Limpar
            </button>
            </div>
        </div>

        <div className="mt-3 space-y-2">
            {files.map(
            (file, index) => (
                <SelectedFile
                key={`${file.name}-${file.size}-${index}`}
                file={file}
                index={index}
                loading={loading}
                onRemove={onRemove}
                />
            )
            )}
        </div>
        </div>
    );
}

function SelectedFile({
    file,
    index,
    loading,
    onRemove,
}: SelectedFileProps) {
    return (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div>
            <p className="font-medium text-slate-800">
            {file.name}
            </p>

            <p className="text-xs text-slate-500">
            {(
                file.size /
                1024 /
                1024
            ).toFixed(2)}
            {" MB"}
            </p>
        </div>

        <button
            type="button"
            disabled={loading}
            onClick={() =>
            onRemove(index)
            }
            className="text-sm font-semibold text-red-600 disabled:opacity-50"
        >
            Remover
        </button>
        </div>
    );
}
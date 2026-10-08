import {
    calculateRubricTotal,
} from "../helpers";

import type {
    RubricCriterion,
} from "../types";

type Props = {
    rubric: RubricCriterion[];
    loading: boolean;

    onAdd: () => void;

    onRemove:
        (id: string) => void;

    onUpdate: (
        id: string,
        field:
        | "description"
        | "points",
        value: string
    ) => void;
};

export function RubricEditor({
    rubric,
    loading,
    onAdd,
    onRemove,
    onUpdate,
    }: Props) {
    return (
        <div>
        <RubricHeader
            loading={loading}
            onAdd={onAdd}
        />

        <div className="mt-4 space-y-3">
            {rubric.map(
            (criterion, index) => (
                <RubricCriterionRow
                key={criterion.id}
                criterion={criterion}
                index={index}
                removable={
                    rubric.length > 1
                }
                loading={loading}
                onRemove={onRemove}
                onUpdate={onUpdate}
                />
            )
            )}
        </div>

        <RubricTotal
            rubric={rubric}
        />
        </div>
    );
}

function RubricHeader({
    loading,
    onAdd,
    }: {
    loading: boolean;
    onAdd: () => void;
}) {
    return (
        <div className="flex items-center justify-between">
        <div>
            <h2 className="font-semibold text-slate-800">
            Rubrica de pontuação
            </h2>

            <p className="mt-1 text-sm text-slate-500">
            Defina os critérios e suas pontuações.
            </p>
        </div>

        <button
            type="button"
            disabled={loading}
            onClick={onAdd}
            className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600"
        >
            + Adicionar critério
        </button>
        </div>
    );
}

function RubricCriterionRow({
    criterion,
    index,
    removable,
    loading,
    onRemove,
    onUpdate,
}: {
    criterion: RubricCriterion;
    index: number;
    removable: boolean;
    loading: boolean;

    onRemove:
        (id: string) => void;

    onUpdate: (
        id: string,
        field:
        | "description"
        | "points",
        value: string
    ) => void;
    }) {
    return (
        <div className="rounded-xl border border-slate-200 p-4">
        <div className="flex gap-4">
            <div className="flex-1">
            <label className="mb-1 block text-sm font-semibold">
                Critério {index + 1}
            </label>

            <textarea
                rows={2}
                value={
                criterion.description
                }
                onChange={(event) =>
                onUpdate(
                    criterion.id,
                    "description",
                    event.target.value
                )
                }
                className="w-full rounded-lg border border-slate-300 p-3"
            />
            </div>

            <div className="w-28">
            <label className="mb-1 block text-sm font-semibold">
                Pontos
            </label>

            <input
                type="number"
                min="0.1"
                step="0.1"
                value={criterion.points}
                onChange={(event) =>
                onUpdate(
                    criterion.id,
                    "points",
                    event.target.value
                )
                }
                className="w-full rounded-lg border border-slate-300 p-3"
            />
            </div>
        </div>

        {removable && (
            <button
            type="button"
            disabled={loading}
            onClick={() =>
                onRemove(
                criterion.id
                )
            }
            className="mt-2 text-sm font-semibold text-red-600"
            >
            Remover critério
            </button>
        )}
        </div>
    );
}

function RubricTotal({
    rubric,
    }: {
    rubric: RubricCriterion[];
    }) {
    const total =
        calculateRubricTotal(
        rubric
        );

    return (
        <div className="mt-4 rounded-xl bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
            Valor total
        </p>

        <p className="text-2xl font-bold text-blue-900">
            {total.toFixed(2)} pontos
        </p>
        </div>
    );
}
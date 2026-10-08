import { ResultCard } from "./ResultCard";

import type {
  CorrectionItem,
} from "../types";

type Props = {
  assessmentName: string;
  results: CorrectionItem[];
};

export function ResultsList({
  assessmentName,
  results,
}: Props) {
  if (results.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="mb-5 text-2xl font-bold text-slate-900">
        {assessmentName}
      </h2>

      <div className="space-y-6">
        {results.map((item) => (
          <ResultCard
            key={item.sourceFileName}
            item={item}
          />
        ))}
      </div>
    </section>
  );
}
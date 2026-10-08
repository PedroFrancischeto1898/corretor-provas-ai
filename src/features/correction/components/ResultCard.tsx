import { CriteriaList } from "./CriteriaList";
import { FeedbackSection } from "./FeedbackSection";
import { ResultSummary } from "./ResultSummary";

import type {
    CorrectionItem,
} from "../types";

type Props = {
    item: CorrectionItem;
};

export function ResultCard({
    item,
    }: Props) {
    const { data: result } = item;

    return (
        <article className="rounded-2xl bg-white p-7 shadow-sm">
        <ResultSummary
            result={result}
            sourceFileName={item.sourceFileName}
        />

        {result.needsHumanReview && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <strong>
                Revisão recomendada:
            </strong>{" "}
            {result.reviewReason}
            </div>
        )}

        <CriteriaList
            criteria={result.criteriaAnalysis}
        />

        <FeedbackSection
            result={result}
        />
        </article>
    );
}
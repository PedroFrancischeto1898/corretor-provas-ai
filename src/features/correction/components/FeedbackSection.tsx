import type {
    GradingResult,
} from "../types";

type Props = {
    result: GradingResult;
};

export function FeedbackSection({
    result,
}: Props) {
    return (
        <div className="mt-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
            <FeedbackList
            title="Pontos fortes"
            items={result.strengths}
            />

            <FeedbackList
            title="Aspectos a desenvolver"
            items={result.improvements}
            />
        </div>

        <TextSection
            title="Análise geral"
            text={result.overallAnalysis}
        />

        <TextSection
            title="Feedback ao estudante"
            text={result.feedback}
        />
        </div>
    );
}

function FeedbackList({
    title,
    items,
}: {
    title: string;
    items: string[];
}) {
    return (
        <div>
        <h4 className="font-bold text-slate-900">
            {title}
        </h4>

        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {items.map((item, index) => (
            <li key={index}>
                {item}
            </li>
            ))}
        </ul>
        </div>
    );
}

function TextSection({
    title,
    text,
}: {
    title: string;
    text: string;
}) {
    return (
        <div>
        <h4 className="font-bold text-slate-900">
            {title}
        </h4>

        <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">
            {text}
        </p>
        </div>
    );
}
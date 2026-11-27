import type { PreparedReference, RubricCriterion } from "../types";
type Props = {reference:PreparedReference;rubric:RubricCriterion[];loading:boolean;error:string;onBack:()=>void;onEdit:()=>void;onConfirm:()=>Promise<void>};
function TextList({title,items}:{title:string;items:string[]}) {
    if(items.length===0) return null;
    return <div className="mt-3"><p className="text-sm font-semibold text-slate-800">{title}</p>
        <ul className="list-disc pl-5 text-sm leading-6 text-slate-700">{items.map((item,index)=><li key={index}>{item}</li>)}</ul></div>;
}
export function ReferenceReview({reference,rubric,loading,error,onBack,onEdit,onConfirm}:Props) {
    const unresolved=reference.criteria.some(c=>c.mode==="unsupported" || c.ambiguity!==null);
    const hasExceptions=reference.criteria.some(c=>c.decisionPlan && c.decisionPlan.scaleType!=="standard");
    return <main className="min-h-screen bg-slate-100 p-6"><section className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Conferência dos critérios</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Como as provas serão avaliadas</h1>
        <p className="mt-2 text-slate-600">Confira a interpretação do gabarito. A mesma referência será usada em todas as correções. Os pesos originais não serão alterados.</p>
        <div className="mt-6 space-y-4">{reference.criteria.map((c,i)=>{
            const original=rubric.find(r=>r.id===c.criterionId);
            return <article key={c.criterionId} className="rounded-xl border border-slate-200 p-5">
                <div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-semibold text-slate-900">C{i+1} — {original?.description}</h2><p className="font-semibold text-blue-700">{original?.points.toFixed(2)} pts</p></div>
                <p className="mt-2 text-sm text-slate-700">{c.demand}</p>
                <p className="mt-2 text-sm font-medium text-slate-800">{c.mode==="count" && c.expectedCount!==null ? `Contagem: ${c.expectedCount} itens de mesmo valor (crédito proporcional).` : c.mode==="qualitative" ? "Julgamento qualitativo: cada descritor tem pontuação previamente definida." : "Regra especial ainda não suportada."}</p>
                <TextList title="Conhecimentos e requisitos essenciais" items={c.essentials}/>
                {c.calibration && <div className="mt-3 space-y-2 rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
                    <p className="font-semibold">Núcleo da competência</p><p>{c.calibration.core}</p>
                    <p className="font-semibold">O que demonstra o núcleo de forma suficiente</p><p>{c.calibration.sufficientEvidence}</p>
                    <p className="font-semibold">Exigências complementares obrigatórias (sem pesos internos)</p>
                    {c.calibration.complementary.length===0?<p>Nenhuma exigência complementar.</p>:c.calibration.complementary.map(e=><div key={e.id} className="border-t border-slate-200 pt-2">
                        <p className="font-medium">{e.description} — impacto máximo: {e.maxImpact==="minor"?"pequeno":"relevante"}</p>
                        <p>{e.rationale}</p><p>Fonte: {e.sourceExcerpt}</p>
                    </div>)}
                </div>}
                <TextList title="Exemplos de formulações equivalentes (não exaustivos)" items={c.equivalents}/>
                <TextList title="Aprofundamentos opcionais (sem desconto por ausência)" items={c.optional}/>
                <p className="mt-3 text-sm font-semibold text-slate-800">Fronteira de crédito</p>
                <p className="text-sm leading-6 text-slate-700">{c.boundary}</p>
                {c.decisionPlan && <div className="mt-3 space-y-3">
                    <p className="text-sm font-semibold text-slate-800">Descritores de desempenho e pontuação</p>
                    {c.decisionPlan.scaleType==="standard" ? <p className="text-sm text-slate-600">Escala padrão: 0, 25, 50, 65, 75, 90 e 100%.</p> : <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                        <p className="font-semibold">Exceção à escala padrão — {c.decisionPlan.scaleType==="binary"?"critério estritamente binário":"regra docente específica"}</p>
                        <p>{c.decisionPlan.exceptionReason}</p><p>Trecho da fonte: {c.decisionPlan.sourceExcerpt}</p>
                        <p className="mt-1">Confira se a exceção é academicamente justificada antes de confirmar.</p>
                    </div>}
                    {c.decisionPlan.levels.map(l=><div key={l.id} className="rounded border p-3 text-sm text-slate-700"><p className="font-medium">{l.percent}% — {((original?.points??0)*l.percent/100).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})} pts (aprox.)</p><p>{l.description}</p></div>)}
                </div>}
                {c.ambiguity && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{c.ambiguity}</p>}
            </article>;
        })}</div>
        {unresolved && <p className="mt-4 rounded-lg bg-amber-50 p-4 text-amber-900">Há critérios que precisam de esclarecimento. Volte à configuração e esclareça o gabarito ou a regra de pontuação antes de corrigir.</p>}
        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" disabled={loading} onClick={onBack} className="rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-700 disabled:opacity-50">Voltar à organização</button>
            <button type="button" disabled={loading} onClick={onEdit} className="rounded-lg border border-blue-600 px-4 py-3 font-semibold text-blue-700 disabled:opacity-50">Rever gabarito ou critérios</button>
            <button type="button" disabled={loading || unresolved} onClick={()=>void onConfirm()} className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-bold text-white disabled:opacity-50">{hasExceptions?"Confirmar critérios e exceções e corrigir":"Confirmar critérios e corrigir"}</button>
        </div>
    </section></main>;
}

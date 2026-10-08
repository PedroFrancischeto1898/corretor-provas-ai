"use client";

import { CorrectionForm } from "./components/CorrectionForm";
import { ProgressBar } from "./components/ProgressBar";
import { useCorrectionFlow } from "./hooks/useCorrectionFlow";
import { GroupingStage } from "./components/grouping/GroupingStage";
import { GradingStage } from "./components/GradingStage";
import { ResultsStage } from "./components/ResultsStage";

export function CorrectionWorkspace() {
    const flow = useCorrectionFlow();

    const workspace = flow.correction;

    if (flow.stage === "review") {
        return (
            <GroupingStage
            groups={flow.grouping.groups}
            unassignedPages={
                flow.grouping.unassignedPages
            }
            onBack={flow.returnToSetup}
            onAssignPage={
                flow.grouping.assignPage
            }
            onConfirm={flow.confirmAndGrade}
            onConfirmIdentity={
                flow.grouping
                    .confirmGroupIdentity
            }
            loading={
                flow.isGrading
            }

            error={
                flow.error
            }
            onCreateGroup={
                flow.grouping
                    .createManualGroup
            }
            />
        );
    }

    if (flow.stage === "grading") {
        return (
            <GradingStage
            progress={
                flow.grading.progress
            }
            />
        );
    }

    if (flow.stage === "results") {
        return (
            <ResultsStage
            assessmentName={
                flow.correction.assessmentName
            }
            results={
                flow.grading.results
            }
            processingErrors={
                flow.grading.processingErrors
            }
            onBack={
                flow.returnToSetup
            }
            />
        );
    }

    return (
        <main className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-5xl">
            <section className="rounded-2xl bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                Novo ambiente
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Correção de Provas
            </h1>

            <p className="mt-2 text-slate-600">
                Configure a avaliação e selecione as provas dos estudantes.
            </p>

            <div className="mt-8">
                <CorrectionForm
                assessmentName={
                    workspace.assessmentName
                }
                onAssessmentNameChange={
                    workspace.setAssessmentName
                }

                criteria={
                    workspace.criteria
                }
                onCriteriaChange={
                    workspace.setCriteria
                }

                rubric={
                    workspace.rubric
                }

                files={
                    workspace.files
                }

                loading={
                    flow.isIdentifying
                }

                error={
                    flow.error
                }

                submitLabel="Identificar e organizar provas"

                onAddCriterion={
                    workspace.addCriterion
                }

                onRemoveCriterion={
                    workspace.removeCriterion
                }

                onUpdateCriterion={
                    workspace.updateCriterion
                }

                onFiles={
                    workspace.handleFiles
                }

                onRemoveFile={
                    workspace.removeFile
                }

                onClearFiles={
                    workspace.clearFiles
                }

                onSubmit={
                    flow.startIdentification
                }
                />
            </div>

            {flow.isIdentifying && (
                <ProgressBar
                    progress={
                        flow.grouping.progress
                    }
                />
            )}
            </section>

        </div>
        </main>
    );
}
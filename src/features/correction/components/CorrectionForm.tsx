import type {
    FormEvent,
} from "react";

import { AssessmentFields } from "./AssessmentFields";
import { FileUploader } from "./FileUploader";
import { RubricEditor } from "./RubricEditor";
import { SubmitSection } from "./SubmitSection";

import type {
    RubricCriterion,
} from "../types";

type Props = {
    assessmentName: string;

    onAssessmentNameChange:
        (value: string) => void;

    criteria: string;

    onCriteriaChange:
        (value: string) => void;

    rubric: RubricCriterion[];

    files: File[];

    loading: boolean;

    error: string;

    submitLabel: string;

    onAddCriterion:
        () => void;

    onRemoveCriterion:
        (id: string) => void;

    onUpdateCriterion: (
        id: string,
        field:
        | "description"
        | "points",
        value: string
    ) => void;

    onFiles:
        (files: FileList | null) =>
        void;

    onRemoveFile:
        (index: number) => void;

    onClearFiles:
        () => void;

    onSubmit:
        () => Promise<void>;
};

export function CorrectionForm(
    props: Props
    ) {
    function handleSubmit(
        event:
        FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        void props.onSubmit();
    }

    return (
        <form
        onSubmit={handleSubmit}
        className="space-y-7"
        >
        <AssessmentFields
            assessmentName={
            props.assessmentName
            }
            criteria={
            props.criteria
            }
            onAssessmentNameChange={
            props.onAssessmentNameChange
            }
            onCriteriaChange={
            props.onCriteriaChange
            }
        />

        <RubricEditor
            rubric={
            props.rubric
            }
            loading={
            props.loading
            }
            onAdd={
            props.onAddCriterion
            }
            onRemove={
            props.onRemoveCriterion
            }
            onUpdate={
            props.onUpdateCriterion
            }
        />

        <FileUploader
            files={
            props.files
            }
            loading={
            props.loading
            }
            onFiles={
            props.onFiles
            }
            onRemove={
            props.onRemoveFile
            }
            onClear={
            props.onClearFiles
            }
        />

        <SubmitSection
            loading={
            props.loading
            }
            fileCount={
            props.files.length
            }
            error={
            props.error
            }
            label={
            props.submitLabel
            }
        />
        </form>
    );
}
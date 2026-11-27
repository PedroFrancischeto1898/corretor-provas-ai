import type { CorrectionItem, GradingResult, RubricCriterion, PreparedReference } from "./types";
import type { StudentExamGroup } from "./grouping/types";

type GradeApiResponse = { success: boolean; data?: GradingResult; error?: string };

function sourceForm(criteria:string,rubric:RubricCriterion[]) {
    const formData=new FormData();
    formData.append("criteria",criteria);
    formData.append("rubric",JSON.stringify(rubric));
    return formData;
}

export async function prepareGradingReference(criteria:string,rubric:RubricCriterion[]):Promise<PreparedReference> {
    const response=await fetch("/api/prepare-reference",{method:"POST",body:sourceForm(criteria,rubric)});
    const data=await response.json() as {success:boolean;reference?:PreparedReference;error?:string};
    if(!response.ok || !data.success || !data.reference) throw new Error(data.error || "Não foi possível preparar a referência avaliativa.");
    return data.reference;
}

async function grade(formData:FormData,reference:PreparedReference):Promise<GradingResult> {
    formData.append("reference",JSON.stringify(reference));
    const response=await fetch("/api/grade",{method:"POST",body:formData});
    const data=await response.json() as GradeApiResponse;
    if(!response.ok || !data.success || !data.data) throw new Error(data.error || "A correção não retornou dados.");
    return data.data;
}

export async function gradeFile(file:File,criteria:string,rubric:RubricCriterion[],reference:PreparedReference):Promise<CorrectionItem> {
    const formData=sourceForm(criteria,rubric);
    formData.append("image",file);
    return {sourceFileName:file.name,data:await grade(formData,reference)};
}

export async function gradeGroup(group:StudentExamGroup,criteria:string,rubric:RubricCriterion[],reference:PreparedReference):Promise<CorrectionItem> {
    const formData=sourceForm(criteria,rubric);
    for(const page of group.pages) formData.append("images",page.file);
    const data=await grade(formData,reference);
    return {sourceFileName:group.pages.map(page=>page.file.name).join(" | "),data:{...data,studentName:group.studentName,registration:group.registration}};
}

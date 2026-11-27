import { NextResponse } from "next/server";
import { GradeError } from "@/lib/grading/errors";
import { prepareReference } from "@/lib/grading/reference-service";
import { parseRubric, validateGuidance } from "@/lib/grading/validation";

export async function POST(request: Request) {
    try {
        const form=await request.formData();
        const guidance=validateGuidance(form.get("criteria"));
        const rubric=parseRubric(form.get("rubric"));
        return NextResponse.json({success:true,...await prepareReference(guidance,rubric)});
    } catch (error) {
        if(error instanceof GradeError) return NextResponse.json({success:false,error:error.message},{status:error.status});
        console.error("Falha ao preparar referência:",error instanceof Error?error.name:"Erro");
        return NextResponse.json({success:false,error:"Não foi possível preparar a referência avaliativa."},{status:500});
    }
}

import { NextResponse } from "next/server";

import { GradeError } from "@/lib/grading/errors";
import { gradeExam } from "@/lib/grading/service";
import { parseGradeRequest } from "@/lib/grading/validation";

export async function POST(
    request: Request
    ) {
    try {
        const data =
        await parseGradeRequest(
            request
        );

    const result =
        await gradeExam(data);

    return NextResponse.json({
        success: true,
        ...result,
        });
    } catch (error) {
        console.error(
        "Erro na correção:",
        error
    );

    if (
        error instanceof GradeError
        ) {
        return NextResponse.json(
            {
            success: false,
            error: error.message,
            },
            {
            status: error.status,
            }
        );
    }

    return NextResponse.json(
        {
            success: false,
            error:
            "Não foi possível corrigir a prova.",
        },
        {
            status: 500,
        }
        );
    }
}
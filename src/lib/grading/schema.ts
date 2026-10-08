export const gradingSchema = {
    type: "object",
    additionalProperties: false,

    properties: {
        studentName: {
        type: ["string", "null"],
        },

        registration: {
        type: ["string", "null"],
        },

        questionNumber: {
        type: ["string", "null"],
        },

        criteriaAnalysis: {
        type: "array",

        items: {
            type: "object",
            additionalProperties: false,

            properties: {
            criterionId: {
                type: "string",
            },

            status: {
                type: "string",
                enum: [
                    "fully_met",
                    "mostly_met",
                    "partially_met",
                    "minimally_met",
                    "not_met",
                ],
            },

            analysis: {
                type: "string",
            },
            },

            required: [
            "criterionId",
            "status",
            "analysis",
            ],
        },
        },

        strengths: {
        type: "array",
        items: {
            type: "string",
        },
        },

        improvements: {
        type: "array",
        items: {
            type: "string",
        },
        },

        overallAnalysis: {
        type: "string",
        },

        feedback: {
        type: "string",
        },

        gradingConfidence: {
        type: "number",
        minimum: 0,
        maximum: 1,
        },

        needsHumanReview: {
        type: "boolean",
        },

        reviewReason: {
        type: ["string", "null"],
        },
    },

    required: [
        "studentName",
        "registration",
        "questionNumber",
        "criteriaAnalysis",
        "strengths",
        "improvements",
        "overallAnalysis",
        "feedback",
        "gradingConfidence",
        "needsHumanReview",
        "reviewReason",
    ],
};
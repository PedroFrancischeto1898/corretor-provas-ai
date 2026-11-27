const strings = { type: "array", items: { type: "string" } };
const assessment = {
    type:"object",additionalProperties:false,
    properties:{
        coreStatus:{type:"string",enum:["absent","incipient","partial","developed","met"]},
        coreEvidenceIndices:{type:"array",items:{type:"integer"}},
        coreRationale:{type:"string"},
        limitations:{type:"array",items:{
            type:"object",additionalProperties:false,
            properties:{kind:{type:"string",enum:["gap","error"]},index:{type:"integer"},target:{type:"string"},impact:{type:"string",enum:["minor","major","blocking"]},rationale:{type:"string"}},
            required:["kind","index","target","impact","rationale"],
        }},
    },
    required:["coreStatus","coreEvidenceIndices","coreRationale","limitations"],
};
const criterion = {
    type:"object", additionalProperties:false,
    properties:{
        criterionId:{type:"string"}, evidence:strings, gaps:strings, errors:strings,
        validItems:{type:"array",items:{type:"object",additionalProperties:false,properties:{concept:{type:"string"},evidence:{type:"string"}},required:["concept","evidence"]}},
        judgment:{anyOf:[{type:"null"},{type:"object",additionalProperties:false,properties:{levelId:{type:"string"},rationale:{type:"string"},upperLevelId:{type:["string","null"]},assessment:{anyOf:[{type:"null"},assessment]}},required:["levelId","rationale","upperLevelId","assessment"]}]},
        analysis:{type:"string"},
    },
    required:["criterionId","evidence","gaps","errors","validItems","judgment","analysis"],
};
export const gradingSchema = {
    type:"object",additionalProperties:false,
    properties:{
        studentName:{type:["string","null"]},registration:{type:["string","null"]},questionNumber:{type:["string","null"]},
        criteriaAnalysis:{type:"array",items:criterion},
        strengths:strings,improvements:strings,overallAnalysis:{type:"string"},feedback:{type:"string"},
        gradingConfidence:{type:"number",minimum:0,maximum:1},needsHumanReview:{type:"boolean"},reviewReason:{type:["string","null"]},
    },
    required:["studentName","registration","questionNumber","criteriaAnalysis","strengths","improvements","overallAnalysis","feedback","gradingConfidence","needsHumanReview","reviewReason"],
};

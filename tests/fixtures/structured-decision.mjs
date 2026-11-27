export const level=(percent, description="Descritor sintético "+percent)=>({id:"L"+(percent+1),percent,description});
export const plan={scaleType:"standard",exceptionReason:null,sourceExcerpt:null,levels:[0,25,50,65,75,90,100].map(p=>level(p))};
export const calibration={core:"Competência central sintética.",sufficientEvidence:"Demonstração válida e suficiente.",complementary:[]};
export const assessment=(percent)=>({
    coreStatus:({0:"absent",25:"incipient",50:"partial",65:"developed"})[percent]??"met",
    coreEvidenceIndices:percent===0?[]:[0],coreRationale:"Suficiência sintética.",
    limitations:percent===100?[]:[{kind:"gap",index:0,target:"core",impact:percent<75?"blocking":percent===75?"major":"minor",rationale:"Impacto sintético."}],
});
export const judge=(percent,upper=null)=>({levelId:"L"+(percent+1),rationale:"Evidência e lacunas sintéticas.",upperLevelId:upper===null?null:"L"+(upper+1),assessment:assessment(percent)});

import test from "node:test";
import assert from "node:assert/strict";
import { scoreCriterion, totalPoints } from "../src/lib/grading/scoring-core.mjs";
const cases = [["contagem 0",4.5,"count",0,3,0],["contagem 1",4.5,"count",1,3,1.5],["contagem 2",4.5,"count",2,3,3],["contagem 3",4.5,"count",3,3,4.5],["contagem acima do máximo",4.5,"count",4,3,4.5],["escala institucional original",1.5,"count",2,3,1],["qualitativo 0",3,"qualitative",0,null,0],["qualitativo 100",3,"qualitative",100,null,3],["qualitativo 60",2.5,"qualitative",60,null,1.5],["qualitativo 75",1.35,"qualitative",75,null,1.01],["arredondamento",0.83,"qualitative",50,null,0.42],["decimais",0.05,"count",1,2,0.03]];
for (const [name,max,mode,value,n,expected] of cases) test(name,()=>assert.equal(scoreCriterion(max,mode,value,n).awardedPoints,expected));
const invalid = [[4.5,"count",-1,3],[4.5,"count",1.5,3],[4.5,"count",1,0],[3,"qualitative",110,null],[3,"qualitative",-10,null],[3,"qualitative",50,3],[3,"unsupported",1,null],[1.234,"qualitative",100,null],[NaN,"qualitative",100,null]];
for (const [i,args] of invalid.entries()) test("entrada inválida "+i,()=>assert.throws(()=>scoreCriterion(...args)));
test("total dos pontos exibidos",()=>assert.equal(totalPoints([4.5,1.88,.75]),7.13));
test("dois de três não vira 50% ou 75%",()=>{const s=scoreCriterion(4.5,"count",2,3);assert.equal(s.awardedPoints,3);assert.ok(Math.abs(s.attainmentPercent-200/3)<1e-10);assert.equal(s.status,"partially_met");});

test("arredondamento exato: 70% de 0,45",()=>assert.equal(scoreCriterion(0.45,"qualitative",70).awardedPoints,0.32));
test("arredondamento exato: 7 de 10 itens",()=>assert.equal(scoreCriterion(0.45,"count",7,10).awardedPoints,0.32));
test("rejeita peso positivo inferior a um centésimo",()=>assert.throws(()=>scoreCriterion(1e-10,"qualitative",100)));
test("grade exaustiva de centésimos e percentuais",()=>{
    for(let cents=1;cents<=1000;cents++) for(let p=0;p<=100;p++)
        assert.equal(scoreCriterion(cents/100,"qualitative",p).awardedPoints,Math.floor((cents*p+50)/100)/100);
});
test("grade exaustiva de contagens",()=>{
    for(let cents=1;cents<=1000;cents++) for(let n=1;n<=20;n++) for(let k=0;k<=n;k++)
        assert.equal(scoreCriterion(cents/100,"count",k,n).awardedPoints,Math.floor((2*cents*k+n)/(2*n))/100);
});

const {test}=require('node:test');
const assert=require('node:assert/strict');
const B=require('../business-core.js');
const D=require('../../chrome-extension/business-draft.js');
const fs=require('node:fs'),path=require('node:path');

test('published bot configuration fits the builder and contains every current example field',()=>{
  const config=fs.readFileSync(path.join(__dirname,'../lessons/business-plan-boodlebox-configuration.txt'),'utf8');
  assert.ok(config.length<49000);
  for(const e of Object.values(B.examples))for(const value of Object.values(e.plan))assert.ok(config.includes(value));
  assert.ok(config.includes('gapReview or extra keys'));
});

test('all five examples retain exact bounded transfer values and open planning gaps',()=>{
  for(const [key,e] of Object.entries(B.examples)){
    assert.deepEqual(B.cleanPlan(e.plan),e.plan,key);
    assert.equal(B.planningGaps(e.plan).filter(g=>g.status==='open').length,6,key);
    for(const [step,keys] of Object.entries(D.fieldsByStep)){
      const draft={fieldwork:D.marker,step,fields:Object.fromEntries(keys.map(k=>[k,e.plan[k]]))};
      assert.deepEqual(D.normalize(draft),draft,key+':'+step);
    }
    for(const step of B.steps.filter(s=>s!=='review'))assert.ok(B.planningTip({...e.plan,exampleKey:key},step).text);
    assert.match(e.source.url,/^https:\/\/(?:legacy|www)\.sba\.gov\//);
  }
  assert.match(B.examples.consulting.source.label,/Adapted/);
  assert.match(B.examples.toys.source.traditional,/traditional/);
  assert.match(B.examples.yard.source.label,/Original/);
});

test('new teaching numbers expose different capacity and income outcomes',()=>{
  const consulting=B.calculate(B.examples.consulting.plan),toys=B.calculate(B.examples.toys.plan);
  assert.equal(consulting.result,3700);assert.equal(consulting.ownerPaySales,39);assert.equal(consulting.breakEven,8);
  assert.equal(toys.result,1360);assert.equal(toys.breakEven,30);assert.equal(toys.ownerPaySales,104);assert.equal(toys.ownerPayOverCapacity,true);
  assert.ok(B.modelGaps(B.examples.toys.plan).some(x=>x.includes('exceed')));
  assert.ok(!B.modelGaps({...B.examples.toys.plan,price:'60'}).some(x=>x.includes('exceed')));
});

test('a filled plan is still unverified; findings need text and survive backups and exports',()=>{
  const plan={...B.examples.consulting.plan,exampleKey:'consulting',gapReview:{cash:{status:'recorded',note:'Client confirmed 30-day terms on September 13. Owner will model a late payment this week.'},demand:{status:'recorded',note:''},unexpected:{status:'recorded',note:'ignore'}}};
  const restored=B.parseBackup(B.backupText(plan)).plan;
  assert.equal(restored.gapReview.cash.status,'recorded');assert.equal(restored.gapReview.demand.status,'open');assert.equal(restored.gapReview.unexpected,undefined);
  assert.equal(B.planningGaps(restored).filter(g=>g.status==='open').length,5);
  const text=B.planText(restored);
  assert.ok(text.includes(plan.gapReview.cash.note));assert.ok(text.includes('self-reported'));assert.ok(text.includes(B.examples.consulting.source.url));
  assert.ok(B.chatNote(restored,'review').includes('Client confirmed 30-day terms'));
  assert.equal(B.planningGaps(B.parseBackup(B.backupText(B.example)).plan).filter(g=>g.status==='open').length,6);
  assert.equal(B.cleanPlan({gapReview:{cash:{status:'recorded',note:'x'.repeat(2000)}}}).gapReview.cash.note.length,1000);
});

test('recording evidence does not remove warnings from the actual numbers',()=>{
  const plan={...B.examples.toys.plan,gapReview:{costs:{status:'recorded',note:'A quote was obtained.'}}};
  assert.deepEqual(B.modelGaps(plan),B.modelGaps(B.examples.toys.plan));
  assert.ok(B.modelGaps({...B.example,variable:''}).some(x=>x.includes('valid price')));
});

test('catalog choices are explicit, bounded and never read arbitrary query text as a plan',()=>{
  for(const key of [...Object.keys(B.examples),'own'])assert.equal(B.selectionFromURL('https://denson.github.io/fieldwork/?demo=business&example='+key),key);
  for(const query of ['','?example=__proto__','?example=unknown','?name=Private%20plan'])assert.equal(B.selectionFromURL('https://denson.github.io/fieldwork/'+query),null);
});

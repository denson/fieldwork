const {test}=require('node:test');
const assert=require('node:assert/strict');
const B=require('../business-core.js');
const routing=require('../../chrome-extension/routing.js');
test('business guide routes the exact public and local companion',()=>{
 for(const origin of ['https://denson.github.io/fieldwork/','http://127.0.0.1:4173/']){
  const combo=routing.combo(origin+'?demo=business&step=review');assert.equal(combo.companion,'BusinessPlanFirstSteps');assert.equal(combo.profileUrl,'https://box.boodle.ai/a/@BusinessPlanFirstSteps');
 }
 assert.equal(routing.validNote({text:'My planning question',companion:'BusinessPlanFirstSteps'}),true);
 assert.equal(routing.combo('https://denson.github.io/unrelated/?demo=business'),null);
});
test('fictional example separates operation, startup spending and owner pay',()=>{
 const r=B.calculate(B.example);assert.equal(r.revenue,1800);assert.equal(r.result,700);assert.equal(r.breakEven,10);assert.equal(r.lowerSales,15);assert.equal(r.lowerResult,350);assert.equal(r.startup,1800);assert.equal(r.ownerPay,1500);assert.equal(r.ownerPaySales,32);assert.equal(r.ownerPayOverCapacity,true);
});
test('blank and invalid inputs never become a zero-cost success',()=>{
 assert.equal(B.calculate({}).ready,false);
 for(const change of [{price:''},{fixed:'-1'},{price:'Infinity'},{price:'1e9'},{sales:'1.5'},{capacity:'3.5'},{startup:'bad'}])assert.equal(B.calculate({...B.example,...change}).ready,false);
 assert.equal(B.calculate({...B.example,fixed:'0',sales:'0'}).ready,true);
});
test('non-positive unit margin has no attainable operating break-even',()=>{
 for(const price of ['20','10']){const r=B.calculate({...B.example,price});assert.equal(r.breakEven,null);assert.ok(r.result<0);}
});
test('break-even rounds up in cents and flags limited capacity',()=>{
 const r=B.calculate({...B.example,price:'1.10',variable:'1.00',fixed:'1.01',sales:'15',capacity:'10'});assert.equal(r.breakEven,11);assert.equal(r.overCapacity,true);assert.equal(r.breakEvenOverCapacity,true);
});
test('feedback excludes the draft unless deliberately included',()=>{
 const p={...B.example,idea:'PRIVATE BUSINESS IDEA'};const f={helped:'Clear explanation',change:'A larger button'};
 assert.ok(!B.feedbackText(p,f,false).includes('PRIVATE BUSINESS IDEA'));
 assert.ok(B.feedbackText(p,f,true).includes('PRIVATE BUSINESS IDEA'));
 assert.ok(B.feedbackText(p,f,false).includes('Clear explanation'));
});
test('email drafts encode text and use an attachment instruction for long packages',()=>{
 assert.equal(B.emailDraft('a@example.com?bcc=b@example.com','x'),null);
 assert.equal(B.emailDraft('a@example.com\r\nBcc: b@example.com','x'),null);
 assert.equal(B.emailDraft('a%0abcc:b@example.com','x'),null);
 const short=B.emailDraft('a@example.com','A & B?');assert.equal(short.attach,false);assert.ok(short.href.includes('A%20%26%20B%3F'));
 const long=B.emailDraft('a@example.com','Long feedback '.repeat(500));assert.equal(long.attach,true);assert.ok(long.href.length<1800);assert.ok(decodeURIComponent(long.href).includes('Please attach'));
});
test('chat notes stay compact, distinguish assumptions and keep freeform data out of links',()=>{
 for(const step of B.steps){const p=Object.fromEntries(Object.keys(B.labels).map(k=>[k,'SECRET '.repeat(100)]));const note=B.chatNote(p,step);assert.ok(note.length<=3700);assert.ok(note.includes('draft ideas and assumptions'));assert.ok(!note.split('My activity: ')[1]?.includes('SECRET'));}
});
test('progress distinguishes empty, partial and complete steps',()=>{
 const empty=B.completion({});assert.equal(empty.byStep.idea.status,'empty');assert.equal(empty.topMissing[0],'Working business name');
 const partial=B.completion({name:'A temporary name'});assert.equal(partial.byStep.idea.status,'partial');
 const complete=B.completion(B.example);assert.equal(complete.byStep.idea.status,'complete');assert.equal(complete.byStep.review.status,'complete');assert.equal(complete.missing.length,0);
});
test('plan export is structured Markdown with gaps, assumptions and adviser work',()=>{
 const plan={name:'Tiny Studio',idea:'Design help'},draft=B.planText(plan),sections=B.planSections(plan);assert.ok(draft.startsWith('# Business Plan First Steps'));assert.ok(draft.includes('## Customer and need'));assert.ok(draft.includes('Not filled in yet'));assert.ok(draft.includes('Not provided (optional)'));assert.ok(draft.includes('## Assumptions, evidence and risks to discuss'));assert.ok(draft.includes('## Questions for an adviser'));assert.equal(sections.flatMap(s=>s.items).find(item=>item.key==='ownerPay').missing,false);
});
test('JSON backup round-trips only recognized bounded plan data',()=>{
 const backup=B.backupText({...B.example,name:'Backup test',unexpected:'ignore me'}),parsed=B.parseBackup(backup);assert.equal(parsed.ok,true);assert.equal(parsed.plan.name,'Backup test');assert.equal(parsed.plan.unexpected,undefined);
 assert.equal(B.parseBackup('{bad json').ok,false);assert.equal(B.parseBackup(JSON.stringify({plan:B.example})).ok,false);
});

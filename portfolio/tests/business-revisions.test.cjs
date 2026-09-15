const {test}=require('node:test');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const D=require('../../chrome-extension/business-draft.js'),C=require('../business-core.js'),R=require('../../chrome-extension/routing.js');
const revision={fieldwork:D.revisionMarker,plan:{...C.examples.bike.plan,name:'Mobile Auto Care',idea:'Quick car repairs and diagnosis; parts billed separately.',price:'',variable:'',fixed:'',sales:''}};

test('complete revisions require every field, preserve unknown numbers and reopen findings',()=>{
  const good=D.normalizeRevision({...revision,plan:{...revision.plan,gapReview:{cash:{note:'Review the old deposit assumption',status:'recorded'}}}});
  assert.equal(good.plan.price,'');assert.equal(good.plan.gapReview.cash.status,'open');
  for(const plan of [{...revision.plan,price:'unknown'},{...revision.plan,sales:'2.5'},{...revision.plan,extra:'ignored?'},{...revision.plan,idea:'x'.repeat(501)},{...revision.plan,gapReview:{cash:{note:'x'.repeat(1001)}}}])assert.equal(D.normalizeRevision({...revision,plan}),null);
  const partial={...revision.plan};delete partial.customer;assert.equal(D.normalizeRevision({...revision,plan:partial}),null);
  assert.equal(D.normalizeRevision({...revision,plan:[]}),null);
  assert.equal(D.parseRevision(JSON.stringify(revision)).plan.price,'');
  assert.equal(D.normalize(revision),null);
});

test('browser and extension use the exact same revision validator',()=>{
  assert.equal(fs.readFileSync(require.resolve('../business-draft-protocol.js'),'utf8'),fs.readFileSync(require.resolve('../../chrome-extension/business-draft.js'),'utf8'));
});

test('version backups preserve workspace notes and explicit departure from an example',()=>{
  const plan={...revision.plan,exampleKey:'',gapReview:{cash:{note:'Client supplied a payment policy',status:'recorded'}}};
  const workspace={feedback:{name:'Reviewer',helped:'Keep this comment',confused:'',change:'',use:'Yes'},includePlan:true,step:'customer'};
  const backup=C.parseBackup(C.backupText(plan,workspace));assert.deepEqual(backup.plan,C.cleanPlan(plan));assert.deepEqual(backup.workspace,workspace);
  assert.equal(C.exampleKeyForPlan({...C.examples.bike.plan,exampleKey:''}), '');
  assert.equal(C.parseBackup('{"format":"fieldwork-business-plan-backup","plan":[]}').ok,false);
});

test('revision transfer stages only in the exact paired business workspace',async()=>{
  const chat={id:7,windowId:1,splitViewId:12,url:'https://box.boodle.ai/c/business'};
  let activity={id:8,windowId:1,splitViewId:12,url:'https://denson.github.io/fieldwork/?demo=business&step=idea'};
  let handler;const deliveries=[];
  const chrome={runtime:{id:'test-extension',onMessage:{addListener:f=>handler=f}},storage:{local:{get:async()=>({enabled:true})},session:{get:async()=>({})}},tabs:{get:async id=>id===7?chat:activity,query:async()=>[chat,activity],sendMessage:async(id,message,options)=>{deliveries.push({id,message,options});return {status:'revision-staged'};}}};
  vm.runInNewContext(fs.readFileSync(require.resolve('../../chrome-extension/background.js'),'utf8'),{chrome,URL,FieldworkRouting:R,FieldworkBusinessDraft:D,FieldworkTransition:require('../../chrome-extension/transition.js'),importScripts(){}});
  const send=(data,sender={id:'test-extension',frameId:0,tab:chat,url:chat.url})=>new Promise(resolve=>{if(handler(data,sender,resolve)!==true)resolve({status:'ignored'});});
  const request={type:'fieldwork-business-revision',...revision,chatUrl:chat.url};
  assert.equal((await send(request)).status,'revision-staged');assert.equal(deliveries[0].message.type,'fieldwork-stage-business-revision');assert.equal(deliveries[0].options.frameId,0);
  assert.equal((await send(request,{id:'other',frameId:0,tab:chat,url:chat.url})).status,'ignored');
  assert.equal((await send({...request,chatUrl:chat.url+'-changed'})).status,'page-changed');
  activity={...activity,splitViewId:99};assert.equal((await send(request)).status,'no-chat');assert.equal(deliveries.length,1);
});

const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const D=require('../../chrome-extension/business-draft.js');
const R=require('../../chrome-extension/routing.js');

const idea={fieldwork:'business-plan-draft-v1',step:'idea',fields:{name:'Boodle-Ready Sites',idea:'Websites designed to work alongside BoodleBox bots.'}};

test('business draft protocol accepts only one known bounded step',()=>{
  assert.deepEqual(D.parse(JSON.stringify(idea)),idea);
  for(const bad of [
    {...idea,fieldwork:'other'},
    {...idea,step:'review'},
    {...idea,fields:{}},
    {...idea,fields:{customer:'wrong step'}},
    {...idea,fields:{name:''}},
    {...idea,fields:{name:'x'.repeat(501)}},
    {fieldwork:D.marker,step:'numbers',fields:{sales:'1.5'}},
    {fieldwork:D.marker,step:'numbers',fields:{price:'1000001'}}
  ])assert.equal(D.normalize(bad),null);
  assert.equal(D.parse('not json'),null);
});

test('paired Business Plan chat can deliver an approved draft only to its exact activity',async()=>{
  const chat={id:7,windowId:1,splitViewId:12,url:'https://box.boodle.ai/c/business'};
  const activity={id:8,windowId:1,splitViewId:12,url:'https://denson.github.io/fieldwork/?demo=business&step=idea'};
  let handler;const deliveries=[];
  const chrome={runtime:{onMessage:{addListener:f=>handler=f}},storage:{local:{get:async()=>({enabled:true})},session:{get:async()=>({})}},tabs:{
    get:async id=>id===chat.id?chat:activity,query:async()=>[chat,activity],update:async()=>{},create:async()=>{},sendMessage:async(id,message,options)=>{deliveries.push({id,message,options});return {status:'draft-applied',count:2};}
  }};
  vm.runInNewContext(fs.readFileSync(require.resolve('../../chrome-extension/background.js'),'utf8'),{chrome,URL,FieldworkRouting:R,FieldworkBusinessDraft:D,FieldworkTransition:require('../../chrome-extension/transition.js'),importScripts(){}});
  const send=(message,sender={frameId:0,tab:chat,url:chat.url})=>new Promise(resolve=>{if(handler(message,sender,resolve)!==true)resolve({status:'ignored'});});
  const result=await send({type:'fieldwork-business-draft',...idea,chatUrl:chat.url});assert.equal(result.status,'draft-applied');assert.equal(deliveries.length,1);assert.equal(deliveries[0].id,activity.id);assert.equal(deliveries[0].options.frameId,0);assert.deepEqual(deliveries[0].message.fields,idea.fields);
  assert.equal((await send({type:'fieldwork-business-draft',...idea,chatUrl:'https://box.boodle.ai/c/other'})).status,'page-changed');
});

const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const R=require('../../chrome-extension/routing.js'),D=require('../../chrome-extension/draft.js'),BusinessDraft=require('../../chrome-extension/business-draft.js');
const activity={id:8,windowId:1,splitViewId:12,url:'http://127.0.0.1:4173/start.html?step=share'};
const chat={id:7,windowId:1,splitViewId:12,url:'https://box.boodle.ai/c/practice'};
const note={type:'fieldwork-note',text:'My badge: Lantern\nMy topic: Earthquakes & tsunamis',companion:'FieldworkFirstSteps',sourceUrl:activity.url};
function worker({peers=[activity,chat],enabled=true,changePair=false,changeChat=false}={}){
  let handler,reads=0;const deliveries=[],mutations=[];
  const chrome={runtime:{onMessage:{addListener:f=>handler=f}},storage:{local:{get:async()=>({enabled})}},tabs:{
    get:async id=>{reads++;const t=peers.find(t=>t.id===id);return reads>1&&changePair?{...t,splitViewId:id}:reads>1&&changeChat&&id===chat.id?{...t,url:'https://box.boodle.ai/c/other'}:t;},
    query:async()=>peers,update:async(...args)=>mutations.push(args),create:async(...args)=>mutations.push(args),
    sendMessage:async(id,message,options)=>{deliveries.push({id,message,options});return {status:'draft-ready'};}
  }};
  vm.runInNewContext(fs.readFileSync(require.resolve('../../chrome-extension/background.js'),'utf8'),{chrome,URL,FieldworkRouting:R,FieldworkBusinessDraft:BusinessDraft,FieldworkTransition:require('../../chrome-extension/transition.js'),importScripts(){}});
  return {deliveries,mutations,send:(message=note,sender={frameId:0,tab:activity,url:activity.url})=>new Promise(resolve=>{if(handler(message,sender,resolve)!==true)resolve({status:'ignored'});})};
}
(async()=>{
  let w=worker();assert.equal((await w.send()).status,'draft-ready');assert.equal(w.deliveries.length,1);assert.equal(w.deliveries[0].id,chat.id);assert.equal(w.deliveries[0].options.frameId,0);assert.equal(w.deliveries[0].message.text,note.text);assert.equal(w.deliveries[0].message.chatUrl,chat.url);assert.equal(w.mutations.length,0);
  w=worker();assert.equal((await w.send(note,{frameId:0,tab:activity,url:'http://127.0.0.1:4173/start.html?step=return'})).status,'draft-ready');
  w=worker();assert.equal((await w.send({...note,sourceUrl:'http://127.0.0.1:4173/start.html?step=choose'})).status,'page-changed');assert.equal(w.deliveries.length,0);
  for(const options of [
    {peers:[activity]}, {peers:[{...activity,splitViewId:-1},chat]},
    {peers:[activity,{...chat,splitViewId:99}]}, {peers:[activity,{...chat,windowId:2}]},
    {peers:[activity,chat,{...chat,id:9}]}, {peers:[activity,{...chat,url:'https://bank.example/'}]},
    {peers:[activity,{...chat,url:'https://box.boodle.ai/a/@FieldworkFirstSteps'}]},
    {peers:[activity,{...chat,pendingUrl:'https://box.boodle.ai/c/other'}]},
    {enabled:false}, {changePair:true}, {changeChat:true}
  ]){w=worker(options);assert.notEqual((await w.send()).status,'draft-ready');assert.equal(w.deliveries.length,0);assert.equal(w.mutations.length,0);}
  for(const sender of [{frameId:1,tab:activity,url:activity.url},{frameId:0,tab:activity,url:'https://evil.example/'},{frameId:0,tab:activity,url:'http://127.0.0.1:4173/lessons/first-steps.md'},{frameId:0,tab:chat,url:chat.url}]){w=worker();assert.equal((await w.send(note,sender)).status,'ignored');assert.equal(w.deliveries.length,0);}
  for(const patch of [{text:''},{text:'a'.repeat(32001)},{text:{}},{companion:'__proto__'},{companion:'UnknownBot'}]){w=worker();assert.equal((await w.send({...note,...patch})).status,'rejected');assert.equal(w.deliveries.length,0);}
  let inserted=0,sent=0;
  const editor={innerText:'My unfinished question',getAttribute:name=>name==='contenteditable'?'true':null};
  const send={disabled:true,getAttribute:()=>null,click:()=>sent++};
  const args={text:note.text,editor,send,insert:(e,t)=>{inserted++;e.innerText=t;send.disabled=false;},wait:async()=>{}};
  assert.equal((await D.place(args)).status,'draft-not-empty');assert.equal(editor.innerText,'My unfinished question');assert.equal(inserted,0);
  editor.innerText='';assert.equal((await D.place(args)).status,'draft-ready');assert.equal(inserted,1);assert.equal(sent,0);
  assert.equal((await D.place(args)).status,'already-ready');assert.equal(inserted,1);
  editor.innerText='';assert.equal((await D.place(args)).status,'draft-not-empty'); // Preserve an attachment-only draft.
  send.disabled=true;assert.equal((await D.place({...args,insert:()=>{}})).status,'check-draft');
  assert.equal((await D.place({...args,insert:(e,t)=>{e.innerText=t;send.disabled=true;}})).status,'check-draft');assert.equal(sent,0);
  assert.equal(D.normalize('Badge: Lantern\n\nTopic: Quakes'),D.normalize('Badge: Lantern\nTopic: Quakes'));
  assert.notEqual(D.normalize('Badge: LanternTopic: Quakes'),D.normalize('Badge: Lantern\nTopic: Quakes'));
  const manifest=JSON.parse(fs.readFileSync(require.resolve('../../chrome-extension/manifest.json'),'utf8'));
  assert.equal(manifest.version,'0.8.0');assert.deepEqual(manifest.permissions,['storage','tabs']);
  console.log('Note transfer: exact paired chat only, navigation races, no new tabs, top frame/origin/payload boundaries, existing draft preservation, duplicate prevention, editor acceptance, and no automatic send passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});

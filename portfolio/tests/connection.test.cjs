const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const R=require('../../chrome-extension/routing.js'),C=require('../../chrome-extension/connection.js');
const fixed='2026-09-13T22:00:00.000Z';
const chat={id:7,windowId:1,splitViewId:12,url:'https://box.boodle.ai/c/business'};
const activity={id:8,windowId:1,splitViewId:12,url:C.workspace};
function setup(options={}){
  const calls=[],mutations=[];let gets=0,settings=0,chatChecks=0;
  const peers=options.peers||[chat,activity];
  const chrome={runtime:{id:'extension-test',getManifest:()=>({version:'0.10.0'})},storage:{local:{get:async()=>({enabled:options.enabled!==false&&!(options.disableLater&&++settings>1)})}},tabs:{
    get:async id=>{gets++;const t={...peers.find(t=>t.id===id)};if(gets>1&&options.changePair)t.splitViewId=id;if(gets>1&&options.changeURL)t.url+='&changed=1';return t;},
    query:async()=>peers,
    sendMessage:async(id,message,opts)=>{calls.push({id,message,opts});if(message.type==='fieldwork-business-chat-probe'){chatChecks++;return options.wrongGuide||options.switchGuide&&chatChecks>1?{status:'chat-unavailable'}:{status:'chat-ready',protocol:C.protocol};}if(options.noReceiver)throw Error('No receiving end');return options.oldReceiver?{status:'workspace-ready'}:{status:'workspace-ready',protocol:C.protocol,step:'numbers'};},
    update:async(...args)=>mutations.push(['update',...args]),create:async(...args)=>mutations.push(['create',...args])
  }};
  return {chrome,calls,mutations,args:{chrome,R,sourceId:chat.id,chatUrl:chat.url,now:()=>fixed}};
}
test('connection requires a responding business guide and workspace in the exact split',async()=>{
  const env=setup(),state=await C.check(env.args);
  assert.equal(state.status,'connected');assert.equal(state.protocol,C.protocol);assert.equal(state.checkedAt,fixed);assert.equal(state.extensionVersion,'0.10.0');
  assert.equal(env.mutations.length,0);assert.equal(env.calls.length,3);assert.ok(env.calls.every(x=>x.opts.frameId===0));
  for(const options of [
    {peers:[chat]},{peers:[{...chat,splitViewId:-1},activity]},
    {peers:[chat,{...activity,windowId:2}]},{peers:[chat,{...activity,splitViewId:99}]},
    {peers:[chat,activity,{...activity,id:9}]},{peers:[chat,{...activity,url:'https://example.com/'}]},
    {peers:[chat,{...activity,url:'https://denson.github.io/fieldwork/?demo=history'}]},
    {peers:[chat,{...activity,pendingUrl:'https://example.com/'}]},
    {enabled:false},{noReceiver:true},{oldReceiver:true},{wrongGuide:true},{changePair:true},{changeURL:true},{disableLater:true},{switchGuide:true}
  ]){const e=setup(options);assert.notEqual((await C.check(e.args)).status,'connected',JSON.stringify(options));assert.equal(e.mutations.length,0);}
});
test('connection messages are explicit choices, bounded and expire locally',async()=>{
  const e=setup(),state=await C.check(e.args),now=Date.parse(fixed);
  const text=C.note(state,now);
  assert.ok(text.includes('Requested experience: connected workspace'));assert.ok(text.includes('not a live view'));assert.ok(text.length<1500);assert.ok(!text.includes('/c/business'));
  assert.equal(C.note(state,now+30001),null);assert.equal(C.note({...state,checkedAt:'not a time'},now),null);assert.equal(C.note({status:'unconnected'},now),null);
  assert.ok(C.chatNote().includes('Requested experience: chat only'));assert.ok(C.chatNote().includes('Keep our latest shared plan'));
});
test('Open workspace reuses only a blank paired pane and preserves other pages',async()=>{
  let e=setup({peers:[chat,{...activity,url:'about:blank'}]});assert.equal((await C.open(e.args)).status,'opened-paired');assert.equal(e.mutations[0][0],'update');assert.equal(e.mutations[0][1],8);assert.equal(e.mutations[0][2].url,C.workspace);
  for(const url of ['https://example.com/','https://denson.github.io/fieldwork/?demo=history']){e=setup({peers:[chat,{...activity,url}]});assert.equal((await C.open(e.args)).status,'opened-new');assert.equal(e.mutations.length,1);assert.equal(e.mutations[0][0],'create');}
  e=setup();assert.equal((await C.open(e.args)).status,'already-open');assert.equal(e.mutations.length,0);
  for(const options of [{enabled:false},{wrongGuide:true},{changeURL:true}]){e=setup(options);await C.open(e.args);assert.equal(e.mutations.length,0);}
});
test('the new background channel rejects external, wrong-origin and child-frame senders',async()=>{
  const e=setup();let handler;
  e.chrome.runtime.onMessage={addListener:f=>handler=f};
  vm.runInNewContext(fs.readFileSync(require.resolve('../../chrome-extension/background.js'),'utf8'),{chrome:e.chrome,URL,FieldworkRouting:R,FieldworkBusinessDraft:require('../../chrome-extension/business-draft.js'),FieldworkConnection:C,FieldworkTransition:require('../../chrome-extension/transition.js'),importScripts(){}});
  const message={type:'fieldwork-connection-state',chatUrl:chat.url};
  const send=sender=>new Promise(resolve=>{if(handler(message,sender,resolve)!==true)resolve({status:'ignored'});});
  assert.equal((await send({id:e.chrome.runtime.id,frameId:0,tab:chat,url:chat.url})).status,'connected');
  for(const patch of [{id:'another-extension'},{frameId:1},{url:'https://evil.example/'},{tab:null}])assert.equal((await send({id:e.chrome.runtime.id,frameId:0,tab:chat,url:chat.url,...patch})).status,'ignored');
});

test('new chats opened within BoodleBox can connect and open the workspace without reloading',async()=>{
  const source=fs.readFileSync(require.resolve('../../chrome-extension/background.js'),'utf8');
  const packaged=require('../../chrome-extension/store-build.cjs').buildFiles().get('background.js').toString();
  for(const code of [source,packaged])for(const originalUrl of ['https://box.boodle.ai/a/@BusinessPlanFirstSteps','https://box.boodle.ai/launch/chat','https://box.boodle.ai/']){
    const e=setup({peers:[chat,{...activity,url:'chrome://tab-search.top-chrome/split_new_tab_page.html'}]});let handler;
    e.chrome.runtime.onMessage={addListener:f=>handler=f};
    vm.runInNewContext(code,{chrome:e.chrome,URL,FieldworkRouting:R,FieldworkBusinessDraft:require('../../chrome-extension/business-draft.js'),FieldworkConnection:C,FieldworkTransition:require('../../chrome-extension/transition.js'),importScripts(){}});
    const send=(type,chatUrl=chat.url)=>new Promise(resolve=>{if(handler({type,chatUrl},{id:e.chrome.runtime.id,frameId:0,tab:chat,url:originalUrl},resolve)!==true)resolve({status:'ignored'});});
    assert.equal((await send('fieldwork-connection-state')).status,'unconnected',originalUrl);
    assert.equal((await send('fieldwork-business-workspace-open')).status,'opened-paired',originalUrl);
    assert.equal(e.mutations.length,1);assert.equal(e.mutations[0][1],activity.id);assert.equal(e.mutations[0][2].url,C.workspace);
    e.chrome.tabs.query=async()=>[chat,activity];
    e.chrome.tabs.get=async id=>({... (id===chat.id?chat:activity)});
    assert.equal((await send('fieldwork-connection-state')).status,'connected');
    assert.equal((await send('fieldwork-business-workspace-open','https://box.boodle.ai/c/other')).status,'changed');
    assert.equal((await send('fieldwork-business-workspace-open',originalUrl)).status,'ignored');
    e.chrome.tabs.get=async id=>({... (id===chat.id?{...chat,url:originalUrl}:activity)});
    assert.equal((await send('fieldwork-business-workspace-open')).status,'changed');
    assert.equal(e.mutations.length,1,'a stale or non-chat current page cannot open a workspace');
  }
});

test('a business note carries only the responding pair status and cancels a later pair change',async()=>{
  for(const changesPair of [false,true]){
    const e=setup();let handler,checks=0,delivered;
    e.chrome.runtime.onMessage={addListener:f=>handler=f};
    const get=e.chrome.tabs.get;
    e.chrome.tabs.get=async id=>{const tab=await get(id);if(changesPair&&checks&&id===activity.id)tab.splitViewId=999;return tab;};
    e.chrome.tabs.sendMessage=async(id,message)=>{if(message.type==='fieldwork-place-draft'){delivered={id,message};return {status:'draft-ready'};}throw Error('unexpected message');};
    const connection={status:'connected',protocol:C.protocol,extensionVersion:'0.10.0',checkedAt:fixed};
    vm.runInNewContext(fs.readFileSync(require.resolve('../../chrome-extension/background.js'),'utf8'),{chrome:e.chrome,URL,FieldworkRouting:R,FieldworkBusinessDraft:require('../../chrome-extension/business-draft.js'),FieldworkConnection:{check:async args=>{checks++;assert.equal(args.sourceId,chat.id);assert.equal(args.chatUrl,chat.url);return connection;}},FieldworkTransition:require('../../chrome-extension/transition.js'),importScripts(){}});
    const text='FIELDWORK BUSINESS PLAN\nFictional test note';
    const result=await new Promise(resolve=>handler({type:'fieldwork-note',text,sourceUrl:activity.url,companion:'BusinessPlanFirstSteps'},{id:e.chrome.runtime.id,frameId:0,tab:activity,url:activity.url},resolve));
    if(changesPair){assert.equal(result.status,'pair-changed');assert.equal(delivered,undefined);}
    else{assert.equal(result.status,'draft-ready');assert.equal(delivered.id,chat.id);assert.equal(delivered.message.text,text);assert.equal(delivered.message.connection,connection);}
  }
});

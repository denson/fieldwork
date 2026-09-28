const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const R=require('./registry-fixture.cjs');
const S=require('../../chrome-extension/support-packet.js');
const chat={id:1,windowId:2,splitViewId:5,url:'https://box.boodle.ai/c/device-case'};
const site={id:2,windowId:2,splitViewId:5,url:'https://denson.github.io/fieldwork/device-support.html'};
const packet={fieldwork:S.protocol,version:1,updateType:'proposal',device:'Unknown printer',sources:[{title:'Maker help',url:'https://maker.example/help'}]};
function worker(peers=[chat,site]){
  let handler;const deliveries=[];
  const chrome={runtime:{onMessage:{addListener:f=>handler=f}},storage:{local:{get:async()=>({enabled:true})}},tabs:{get:async id=>peers.find(t=>t.id===id),query:async()=>peers,sendMessage:async(...args)=>{deliveries.push(args);return {status:'support-staged'};}}};
  vm.runInNewContext(fs.readFileSync(require.resolve('../../chrome-extension/background.js'),'utf8'),{chrome,URL,FieldworkRouting:R,FieldworkRegistryService:{create:()=>({load:async()=>require('../companion-registry.json')})},FieldworkBusinessDraft:require('../../chrome-extension/business-draft.js'),FieldworkSupportPacket:S,FieldworkTransition:require('../../chrome-extension/transition.js'),importScripts(){}});
  return {deliveries,send:(value=packet,sender={frameId:0,tab:chat,url:chat.url})=>new Promise(resolve=>{const message={type:'fieldwork-support-update',packet:value,chatUrl:chat.url};if(handler(message,sender,resolve)!==true)resolve({status:'ignored'});})};
}
test('a support update reaches only the exact paired workspace and remains staged',async()=>{
  const w=worker();assert.equal((await w.send()).status,'support-staged');assert.equal(w.deliveries.length,1);
  assert.equal(w.deliveries[0][0],site.id);assert.equal(w.deliveries[0][1].type,'fieldwork-stage-support-update');assert.equal(w.deliveries[0][2].frameId,0);
  for(const peers of [[chat,{...site,url:'https://bank.example/'}],[chat,{...site,splitViewId:7}],[chat,{...site,url:'https://denson.github.io/fieldwork/start.html'}]]){
    const bad=worker(peers);assert.notEqual((await bad.send()).status,'support-staged');assert.equal(bad.deliveries.length,0);
  }
  const bad=worker();assert.equal((await bad.send({...packet,sources:[{url:'javascript:alert(1)'}]})).status,'rejected');assert.equal(bad.deliveries.length,0);
});

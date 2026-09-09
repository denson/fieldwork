const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const R=require('../../chrome-extension/routing.js');
const source={id:7,windowId:1,splitViewId:12,url:'https://box.boodle.ai/c/practice'};
const target={id:8,windowId:1,splitViewId:12,url:'http://127.0.0.1:4173/start.html?step=share'};
const url='http://127.0.0.1:4173/start.html?step=return&pass=abcd1234&badge=lantern&topic=quakes';
assert.equal(R.paired(source,[source,target]).tabId,8);
assert.equal(R.paired(source,[source,{...target,windowId:2}]).tabId,undefined);
assert.equal(R.paired(source,[source,{...target,splitViewId:13}]).tabId,undefined);
assert.equal(R.paired({...source,splitViewId:-1},[source,target]).reason,'no-split');
assert.equal(R.paired({...source,splitViewId:undefined},[source,target]).reason,'no-split');
assert.equal(R.paired(source,[source,target,{...target,id:9}]).reason,'no-unique-pair');
assert.equal(R.paired(source,[source,{...target,url:'https://bank.example/form'}]).reason,'different-site');
assert.equal(R.paired(source,[source,{...target,pendingUrl:'https://bank.example/form'}]).reason,'page-changing');
const blankPanes=['about:blank','chrome://newtab/','chrome://new-tab-page/','chrome://tab-search.top-chrome/split_new_tab_page.html'];
for(const blank of blankPanes)assert.equal(R.paired(source,[source,{...target,url:blank}]).tabId,target.id);
for(const other of [undefined,'','chrome://extensions/','chrome://settings/','chrome://tab-search.top-chrome/other.html','https://example.test/split_new_tab_page.html'])assert.equal(R.paired(source,[source,{...target,url:other}]).reason,'different-site');
assert.equal(new URL(R.destination(url)).searchParams.get('here'),'1');
for(const bad of ['javascript:alert(1)','https://evil.example/','http://127.0.0.1:4174/','http://127.0.0.1:4173.evil.example/','http://user:password@127.0.0.1:4173/','http://127.0.0.1:4173/lessons/first-steps.md'])assert.equal(R.destination(bad),null);
const manifest=JSON.parse(fs.readFileSync(require.resolve('../../chrome-extension/manifest.json'),'utf8'));
assert.equal(manifest.manifest_version,3);assert.deepEqual(manifest.permissions,['storage','tabs']);assert.ok(!manifest.host_permissions.includes('<all_urls>'));
function worker({peers=[source,target],enabled=true,moveOnRecheck=false}={}){
  let handler,getCalls=0;const updates=[],creates=[];
  const chrome={runtime:{onMessage:{addListener:f=>handler=f}},storage:{local:{get:async()=>({enabled})},session:{get:async()=>({})}},tabs:{
    get:async id=>{getCalls++;return moveOnRecheck&&getCalls>1?{...(id===source.id?source:target),splitViewId:44+id}:id===source.id?source:peers.find(t=>t.id===id);},
    query:async()=>peers,update:async(id,data)=>updates.push({id,...data}),create:async data=>creates.push(data),sendMessage:async()=>({status:'same-guide'})
  }};
  vm.runInNewContext(fs.readFileSync(require.resolve('../../chrome-extension/background.js'),'utf8'),{chrome,FieldworkRouting:R,FieldworkTransition:require('../../chrome-extension/transition.js'),importScripts(){}});
  return {updates,creates,send:(message={type:'fieldwork-open',url},sender={frameId:0,tab:source,url:source.url})=>new Promise(resolve=>{if(handler(message,sender,resolve)!==true)resolve({status:'ignored'});})};
}
(async()=>{
  let w=worker();assert.equal((await w.send()).status,'routed');assert.deepEqual(w.updates,[{id:8,url:R.destination(url)}]);assert.equal(w.creates.length,0);
  for(const blank of blankPanes){
    w=worker({peers:[source,{...target,url:blank}]});assert.equal((await w.send()).status,'routed',blank);assert.deepEqual(w.updates,[{id:8,url:R.destination(url)}]);assert.equal(w.creates.length,0);
  }
  w=worker({peers:[source,{...target,url:blankPanes[3],pendingUrl:'https://bank.example/form'}]});assert.equal((await w.send()).status,'pair-changed');assert.equal(w.updates.length+w.creates.length,0);
  w=worker({peers:[source,{...target,url:blankPanes[3]}],moveOnRecheck:true});assert.equal((await w.send()).status,'pair-changed');assert.equal(w.updates.length+w.creates.length,0);
  w=worker({peers:[source,{...target,url:'https://bank.example/form'}]});assert.equal((await w.send()).status,'opened-new');assert.equal(w.updates.length,0);assert.equal(w.creates[0].openerTabId,7);
  w=worker({moveOnRecheck:true});assert.equal((await w.send()).status,'pair-changed');assert.equal(w.updates.length+w.creates.length,0);
  w=worker({enabled:false});assert.equal((await w.send()).status,'disabled');assert.equal(w.updates.length+w.creates.length,0);
  w=worker();assert.equal((await w.send({type:'fieldwork-open',url:'https://evil.example/'})).status,'rejected');assert.equal(w.updates.length+w.creates.length,0);
  assert.equal((await w.send(undefined,{frameId:0,tab:source,url:'https://evil.example/'})).status,'ignored');
  assert.equal((await w.send(undefined,{frameId:1,tab:source,url:source.url})).status,'ignored');
  console.log('Extension: exact split/window targeting, recheck races, unrelated pages preserved, origin/path validation, disabled mode, sender validation, and permissions passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});

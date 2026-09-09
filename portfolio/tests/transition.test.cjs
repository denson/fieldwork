const assert=require('node:assert/strict'),R=require('../../chrome-extension/routing.js'),T=require('../../chrome-extension/transition.js');
const left={id:7,windowId:1,splitViewId:12,url:'https://box.boodle.ai/c/orientation'};
const right={id:8,windowId:1,splitViewId:12,url:'http://127.0.0.1:4173/start.html?step=return'};
const destination='http://127.0.0.1:4173/?demo=budget&preset=balanced&event=none';
function setup({guard='safe-to-start',rePair=false,activityUrl=right.url}={}){
  const initialRight={...right,url:activityUrl};
  let time=1000,enabled=true;const tabs=new Map([[7,{...left}],[8,{...initialRight}]]),storage={},updates=[],messages=[];
  const chrome={storage:{session:{get:async key=>({[key]:structuredClone(storage[key])}),set:async values=>Object.assign(storage,structuredClone(values)),remove:async key=>delete storage[key]},local:{get:async()=>({enabled})}},tabs:{
    get:async id=>{if(!tabs.has(id))throw Error('Tab closed');return {...tabs.get(id)};},
    sendMessage:async(id,message,options)=>{messages.push({id,message,options});if(rePair)tabs.get(8).splitViewId=99;return {status:guard};},
    update:async(id,data)=>{updates.push({id,...data});Object.assign(tabs.get(id),data);return {...tabs.get(id)};}
  }};
  const t=T.create({chrome,R,now:()=>time,token:()=> 'test-intent'});
  return {t,tabs,storage,updates,messages,disable:()=>enabled=false,expire:()=>time=70000,
    start:()=>t.start({boodle:{...left},activity:{...initialRight},url:destination}),
    resume:(type,extra={})=>t.resume({type,url:tabs.get(7).url,token:'test-intent',...extra},{tab:{id:7}})};
}
(async()=>{
  assert.equal(R.combo(destination).companion,'CommunityBudgetCoach');assert.equal(R.profileAlias('https://box.boodle.ai/a/%40CommunityBudgetCoach'),'CommunityBudgetCoach');
  for(const url of ['http://127.0.0.1:4173/?demo=home','http://127.0.0.1:4173/index.html?demo=home','http://localhost:4173/?demo=home'])assert.equal(R.combo(url).companion,'FieldworkPortfolioGuide');
  assert.equal(R.combo('http://127.0.0.1:4173/start.html').companion,'FieldworkFirstSteps');
  const chooser='chrome://tab-search.top-chrome/split_new_tab_page.html';
  const fromChooser=setup({activityUrl:chooser});
  assert.equal((await fromChooser.start()).status,'starting-combo');assert.equal(fromChooser.tabs.get(8).url,chooser);
  assert.equal((await fromChooser.resume('fieldwork-transition-start')).status,'start-approved');fromChooser.tabs.get(7).url='https://box.boodle.ai/c/from-blank';
  assert.equal((await fromChooser.resume('fieldwork-transition-ready',{companion:'CommunityBudgetCoach'})).status,'combo-ready');assert.equal(fromChooser.tabs.get(8).url,destination);
  const sameFromChooser=setup({activityUrl:chooser,guard:'same-guide'});assert.equal((await sameFromChooser.start()).status,'routed');assert.deepEqual(sameFromChooser.updates,[{id:8,url:destination}]);
  for(const activityUrl of ['chrome://extensions/',undefined,'https://bank.example/form']){if(activityUrl===undefined)continue;const unrelated=setup({activityUrl});assert.equal((await unrelated.start()).status,'no-chat');assert.equal(unrelated.updates.length,0);}
  const practiceReturn=R.combo('http://127.0.0.1:4173/start.html?step=return&pass=abcd1234&badge=lantern&topic=budget');
  assert.equal(practiceReturn.companion,'FieldworkFirstSteps');assert.equal(new URL(practiceReturn.url).searchParams.get('here'),'1');
  for(const [url,companion] of [['http://127.0.0.1:4173/?demo=home','FieldworkPortfolioGuide'],['http://127.0.0.1:4173/start.html','FieldworkFirstSteps']]){
    const trial=setup();assert.equal((await trial.t.start({boodle:{...left},activity:{...right},url})).status,'starting-combo');
    assert.equal(trial.tabs.get(7).url,'https://box.boodle.ai/a/@'+companion);assert.equal(trial.tabs.get(8).url,right.url);
    assert.equal((await trial.resume('fieldwork-transition-start')).status,'start-approved');trial.tabs.get(7).url='https://box.boodle.ai/c/next';
    assert.equal((await trial.resume('fieldwork-transition-ready',{companion})).status,'combo-ready');assert.equal(trial.tabs.get(8).url,url);
  }
  for(const bad of ['https://evil.example/?demo=budget','http://127.0.0.1:4173/lessons/x?demo=budget','http://127.0.0.1:4173/?demo=__proto__','http://127.0.0.1:4173/?demo=math'])assert.equal(R.combo(bad),null);
  let s=setup();assert.equal((await s.start()).status,'starting-combo');assert.equal(s.updates.length,1);assert.equal(s.updates[0].id,7);assert.equal(s.tabs.get(8).url,right.url);assert.equal(s.messages[0].options.frameId,0);
  assert.equal((await s.resume('fieldwork-transition-state')).phase,'profile');
  assert.equal((await s.resume('fieldwork-transition-start',{token:'forged'})).status,'rejected');
  assert.equal((await s.resume('fieldwork-transition-start')).status,'start-approved');
  assert.equal((await s.resume('fieldwork-transition-start')).status,'rejected'); // Never start twice.
  s.tabs.get(7).url='https://box.boodle.ai/c/new-budget';
  assert.equal((await s.resume('fieldwork-transition-ready',{companion:'EarthquakeTsunamiGuide'})).status,'rejected');assert.equal(s.updates.length,1);
  assert.equal((await s.resume('fieldwork-transition-ready',{companion:'CommunityBudgetCoach'})).status,'combo-ready');assert.equal(s.tabs.get(8).url,destination);assert.equal(Object.keys(s.storage).length,0);
  assert.equal((await s.resume('fieldwork-transition-ready',{companion:'CommunityBudgetCoach'})).status,'no-transition');assert.equal(s.updates.length,2);
  s=setup({guard:'draft-not-empty'});assert.equal((await s.start()).status,'draft-not-empty');assert.equal(s.updates.length,0);
  s=setup({guard:'same-guide'});assert.equal((await s.start()).status,'routed');assert.deepEqual(s.updates,[{id:8,url:destination}]);assert.equal(Object.keys(s.storage).length,0);
  s=setup({rePair:true});assert.equal((await s.start()).status,'pair-changed');assert.equal(s.updates.length,0);
  for(const disturb of [s=>s.tabs.get(8).splitViewId=99,s=>s.tabs.get(8).url='http://127.0.0.1:4173/?demo=history',s=>s.tabs.get(7).url='https://box.boodle.ai/a/@EarthquakeTsunamiGuide',s=>s.tabs.get(7).pendingUrl='https://box.boodle.ai/c/other',s=>s.disable(),s=>s.expire()]){
    s=setup();await s.start();disturb(s);assert.notEqual((await s.resume('fieldwork-transition-start')).status,'start-approved');assert.equal(s.updates.length,1);assert.equal(Object.keys(s.storage).length,0);
  }
  s=setup();assert.deepEqual((await Promise.all([s.start(),s.start()])).map(r=>r.status).sort(),['starting-combo','transition-busy'].sort());assert.equal(s.updates.length,1);
  console.log('Transitions: profile-to-new-chat handoff, exact guide and pair, old chat retained, drafts protected, same-guide reuse, one-shot approval, races, expiry, disabled state, and replay protection passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});

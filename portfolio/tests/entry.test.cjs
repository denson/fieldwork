const assert=require('node:assert/strict'),E=require('../entry.js'),R=require('../../chrome-extension/routing.js'),F=require('../start-core.js');
for(const input of ['http://127.0.0.1:4173/','http://127.0.0.1:4173/index.html','http://localhost:4173/?demo=']){
  const expected=new URL('/start.html',input).href;
  assert.equal(E.tutorialURL(input),expected);assert.equal(R.combo(input).url,expected);assert.equal(R.combo(input).companion,'FieldworkFirstSteps');
}
assert.equal(E.tutorialURL('https://example.org/fieldwork/?utm_source=invite'),'https://example.org/fieldwork/start.html?utm_source=invite');
for(const demo of ['home','history','quakes','budget','hearing','math'])assert.equal(E.tutorialURL('http://127.0.0.1:4173/?demo='+demo),null);
assert.equal(E.tutorialURL('http://127.0.0.1:4173/start.html?step=return'),null);
for(const topic of ['history','quakes','budget','hearing']){
  const state={pass:'abcd1234',badge:'lantern',topic,confirmed:true,understood:true,private:'not for the next URL'};
  const next=F.portfolioURL('http://127.0.0.1:4173/start.html?pass=old#practice',state),u=new URL(next);
  assert.deepEqual([...u.searchParams.entries()],[['demo','home'],['interest',topic]]);assert.equal(u.hash,'');
  assert.equal(E.tutorialURL(next),null);assert.equal(R.combo(next).companion,'FieldworkPortfolioGuide');
}
assert.throws(()=>F.portfolioURL('http://127.0.0.1:4173/',{pass:'abcd1234',badge:'lantern',topic:'__proto__'}));
console.log('Entry flow: default home opens tutorial; explicit demos remain reachable; portfolio handoff carries only the chosen interest; matching guide routes agree.');

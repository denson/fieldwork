const assert=require('node:assert/strict');
const fs=require('node:fs');
const R=require('../../chrome-extension/routing.js');
const E=require('../entry.js');
const base='https://denson.github.io/fieldwork/';
assert.equal(E.tutorialURL(base),base+'start.html');
assert.equal(E.tutorialURL(base+'?demo=home'),null);
assert.equal(R.destination(base),base+'start.html');
assert.equal(R.destination(base+'index.html'),base+'start.html');
for(const [query,alias] of [['','FieldworkFirstSteps'],['?demo=home','FieldworkPortfolioGuide'],['?demo=budget','CommunityBudgetCoach'],['?demo=history','PuebloHistoryDetective'],['?demo=hearing','EastbankHearingGuide'],['?demo=quakes&case=alaska1964&step=reach','EarthquakeTsunamiGuide']]) {
  const c=R.combo(base+query);assert.equal(c.companion,alias);assert.ok(c.url.startsWith(base));
}
const back=base+'start.html?step=return&pass=abcdefgh&badge=lantern&topic=budget';
assert.equal(R.destination(back),back+'&here=1');
const page={id:2,windowId:1,splitViewId:4,url:back};
const chat={id:1,windowId:1,splitViewId:4,url:'https://box.boodle.ai/c/practice'};
assert.equal(R.paired(chat,[chat,page]).tabId,2);
assert.equal(R.pairedChat(page,[chat,page]).tabId,1);
assert.equal(R.combo('https://denson.github.io/colorado-weed-field-guide/companion/').companion,'ColoradoWeedGuide');
for(const url of ['https://denson.github.io/fieldwork-other/','https://denson.github.io/other/','https://evil.example/fieldwork/','https://user:pass@denson.github.io/fieldwork/','https://denson.github.io/fieldwork/%2fstart.html','https://denson.github.io/fieldwork/%2estart.html']){assert.equal(R.destination(url),null);assert.equal(R.isActivity(url),false);}
assert.equal(R.destination(base+'lessons/budget.md'),null);
assert.equal(R.destination(base+'assets/history-casebook.png'),null);
const m=JSON.parse(fs.readFileSync(require.resolve('../../chrome-extension/manifest.json'),'utf8'));
assert.ok(m.content_scripts.some(s=>s.matches.includes(base+'*')));
assert.deepEqual(m.permissions,['storage','tabs']);
console.log('Public Pages routes, paired notes, known companions and project boundaries passed.');

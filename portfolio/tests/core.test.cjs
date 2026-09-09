const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const context = { module:{exports:{}}, URLSearchParams };
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../core.js'),'utf8'),context);
const C = context.module.exports;
const defaults = C.config(new URLSearchParams());
assert.equal(defaults.ms,0); assert.equal(defaults.level,1); assert.equal(defaults.rounds,6); assert.equal(defaults.layout,'grouped'); assert.equal(defaults.demo,'home');
const invalid = C.config(new URLSearchParams('demo=bad&level=999&rounds=100000&ms=-1&layout=%3Cscript%3E&period=month&min=0'));
assert.equal(invalid.level,1); assert.equal(invalid.rounds,6); assert.equal(invalid.ms,0); assert.equal(invalid.layout,'grouped'); assert.equal(invalid.period,'day'); assert.equal(invalid.min,'2.5');
assert.equal(C.config(new URLSearchParams('ms=0')).ms,0);
assert.equal(C.config(new URLSearchParams('ms=3000')).ms,3000);
assert.equal(C.config(new URLSearchParams('ms=5000')).ms,5000);
let patternsChecked = 0;
for (const level of [1,2,3]) for (const layout of ['mixed','grouped','scattered']) for (const rounds of [6,8,12]) for(let seed=1;seed<=100;seed++) {
  const deck=C.patterns({level,layout,rounds},seed); assert.equal(deck.length,rounds);
  for(const p of deck) { assert.equal(p.points.length,p.amount); assert.equal(new Set(p.points.map(v=>v.join(','))).size,p.amount); for(const [x,y] of p.points) assert.ok(x>=25&&x<=575&&y>=25&&y<=335); patternsChecked++; }
  if(layout==='mixed') { const grouped=deck.filter(p=>p.layout==='grouped').map(p=>p.amount).sort().join(','); const scattered=deck.filter(p=>p.layout==='scattered').map(p=>p.amount).sort().join(','); assert.equal(grouped,scattered); }
}
const summary = C.summary([{layout:'grouped',amount:7,answer:7,responseMs:2000,strategy:'groups'},{layout:'grouped',amount:5,answer:4,responseMs:4000,strategy:'counted'}]);
assert.equal(summary[0].correct,1); assert.equal(summary[0].responseMs,3000); assert.equal(summary[0].counted,1); assert.equal(summary[1].responseMs,null);
assert.equal(C.project(0,0).join(','),'450,225'); assert.equal(C.median([10,1,20,2]),6); assert.equal(C.median([]),null);
const event={id:'demo',properties:{type:'earthquake',mag:3.2,place:'<script>data</script>',time:1700000000000,status:'reviewed'},geometry:{coordinates:[-104,38,5]}};
const parsed=C.earthquakes({type:'FeatureCollection',metadata:{generated:1700000001000},features:[event,{...event,id:'missing',geometry:{coordinates:[0,100,1]}},{...event,id:'not-quake',properties:{...event.properties,type:'explosion'}}]});
assert.equal(parsed.length,1); assert.equal(parsed[0].lon,-104); assert.equal(parsed[0].lat,38); assert.equal(parsed[0].depth,5); assert.equal(parsed[0].url,'https://earthquake.usgs.gov/earthquakes/eventpage/demo');
assert.throws(()=>C.earthquakes({}),/unexpected feed/);
console.log(`Passed: URL validation, ${patternsChecked} generated dot patterns, paired layouts, scoring, feed normalization, and coordinate checks.`);

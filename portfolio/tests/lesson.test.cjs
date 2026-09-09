// Application-level checks with a minimal DOM fixture, not browser/visual QA.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname,'..');
const nodes = new Map();
class Element {
  constructor(id) { this.id=id; this.value=''; this.hidden=false; this.open=false; this.disabled=false; this.style={}; this.dataset={}; this.events={}; this.attrs={}; this.classList={add(){},remove(){}}; }
  addEventListener(type,handler) { this.events[type]=handler; }
  setAttribute(name,value) { this.attrs[name]=value; }
  removeAttribute(name) { delete this.attrs[name]; }
  querySelectorAll() { return []; }
  focus() {}
  showModal() { this.open=true; }
  set innerHTML(markup) { this.markup=markup; register(markup); }
  get innerHTML() { return this.markup||''; }
}
function register(markup) {
  for(const match of markup.matchAll(/\bid="([^"]+)"/g)) if(!nodes.has(match[1])) nodes.set(match[1],new Element(match[1]));
}
register(fs.readFileSync(path.join(root,'index.html'),'utf8'));
let requestCount=0, failRequest=true;
const fixedTime=Date.UTC(2026,8,4,12);
const fixture={type:'FeatureCollection',metadata:{generated:fixedTime},features:[{id:'unit-test-only',properties:{type:'earthquake',mag:3.2,time:fixedTime,place:'Test fixture location',status:'reviewed',magType:'ml'},geometry:{coordinates:[-150,60,12]}}]};
const document={
  getElementById(id) { assert.ok(nodes.has(id),`Missing application element: ${id}`); return nodes.get(id); },
  querySelectorAll(selector) { return selector==='.view'?['home-view','history-view','math-view','quakes-view'].map(id=>nodes.get(id)):[]; },
  addEventListener() {}, hidden:false
};
const context={document,URL,URLSearchParams,Date,Number,String,Object,Array,Math,Map,Set,AbortController,setTimeout,clearTimeout,requestAnimationFrame:()=>1,cancelAnimationFrame(){},performance:{now:()=>1},location:{href:'http://localhost/?demo=quakes',search:'?demo=quakes',protocol:'http:',hostname:'localhost'},history:{replaceState(){}},navigator:{clipboard:{writeText:async()=>{}}},fetch:async()=>{
  requestCount++; if(failRequest)throw new Error('Simulated unavailable feed');
  return {ok:true,json:async()=>fixture};
}};
context.addEventListener=()=>{};
document.querySelector=()=>({hidden:false});
context.window=context;
vm.createContext(context);
for(const file of ['content.js','tsunami.js','core.js','app.js']) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
const exportNote=()=>{nodes.get('quake-export').events.click();return nodes.get('export-text').value;};
(async()=>{
  assert.equal(requestCount,0,'Opening the lesson must not request a live feed');
  assert.equal(nodes.get('quakes-view').hidden,false);
  assert.equal(nodes.get('home-view').hidden,true);
  nodes.get('tsunami-why').value='Readiness can matter even during quiet years.';
  let note=exportNote();
  assert.ok(note.includes('\n## Historical example: 1964'));
  assert.ok(note.includes('Readiness can matter even during quiet years.'));
  assert.ok(note.includes('No live earthquake snapshot was loaded.'));
  assert.ok(!note.includes('\\n'),'Export uses real Markdown newlines');
  assert.ok(!note.includes('undefined'));
  assert.equal(nodes.get('export-dialog').open,true);
  nodes.get('tsunami-example').value=context.FIELDWORK_TSUNAMI.cases.find(c=>c.year==='2011').key;
  nodes.get('tsunami-example').events.change();
  note=exportNote();
  assert.ok(note.includes('## Historical example: 2011'),'The response uses the event chosen beside the questions');
  assert.ok(!note.includes('## Historical example: 1964'),'Changing the example replaces the previous event');
  nodes.get('live-earthquake-data').open=true;
  nodes.get('live-earthquake-data').events.toggle();
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(requestCount,1);
  assert.equal(nodes.get('quake-error').hidden,false);
  assert.equal(nodes.get('quake-export').disabled,false);
  assert.ok(exportNote().includes('No live earthquake snapshot was loaded.'));
  failRequest=false;
  await nodes.get('quake-refresh').events.click();
  note=exportNote();
  assert.equal(requestCount,2);
  assert.ok(note.includes('unit-test-only: Test fixture location'));
  assert.ok(note.includes('## Why maintaining these systems matters'));
  assert.ok(note.includes('does not establish tsunami warning status'));
  assert.ok(!note.includes('undefined'));
  console.log('Passed: lesson startup without API access; response event selection; readable Markdown export before loading, after API failure, and with a successful feed fixture.');
})().catch(error=>{console.error(error);process.exitCode=1;});

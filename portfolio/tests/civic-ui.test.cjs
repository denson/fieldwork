// Application integration checks using a minimal DOM fixture, not browser/visual QA.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
function fixture(search,storage=new Map()){
  const nodes=new Map(),elements=new Set(),windowEvents={};let document,context,fetches=0;
  class Element{
    constructor(tag,attrs={}){
      this.tagName=tag.toUpperCase();this.attrs={...attrs};this.id=attrs.id;this.value=attrs.value||'';this.hidden='hidden'in attrs;this.checked='checked'in attrs;this.open=false;this.style={};this.events={};this.children=[];this.dataset={};this.disabled='disabled'in attrs;
      Object.entries(attrs).filter(([key])=>key.startsWith('data-')).forEach(([key,value])=>this.dataset[key.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=value);
      const classes=new Set((attrs.class||'').split(/\s+/));
      this.classList={add:(...a)=>a.forEach(v=>classes.add(v)),remove:(...a)=>a.forEach(v=>classes.delete(v)),toggle:(v,force)=>{const state=force===undefined?!classes.has(v):force;if(state)classes.add(v);else classes.delete(v);return state;},contains:v=>classes.has(v)};
    }
    addEventListener(type,fn){this.events[type]=fn;}
    setAttribute(key,value){this.attrs[key]=String(value);}
    removeAttribute(key){delete this.attrs[key];}
    focus(){document.activeElement=this;}
    select(){this.selected=true;}
    showModal(){this.open=true;}
    matches(selector){
      if(selector.startsWith('.'))return this.classList.contains(selector.slice(1));
      const m=selector.match(/^\[data-([a-z-]+)\]$/);
      return m?Object.prototype.hasOwnProperty.call(this.attrs,'data-'+m[1]):false;
    }
    closest(selector){return this.matches(selector)?this:null;}
    querySelector(selector){return this.children.find(e=>e.matches(selector))||null;}
    querySelectorAll(selector){return this.children.filter(e=>e.matches(selector));}
    set innerHTML(value){
      this.markup=value;
      this.children.forEach(e=>{elements.delete(e);if(e.id&&nodes.get(e.id)===e)nodes.delete(e.id);});
      this.children=register(value);
    }
    get innerHTML(){return this.markup||'';}
  }
  function register(markup){
    const list=[];
    for(const match of markup.matchAll(/<([a-z][\w-]*)\b([^>]*?)>/gi)){
      const attrs={};
      for(const a of match[2].matchAll(/([\w-]+)(?:="([^"]*)"|='([^']*)')?/g))attrs[a[1]]=a[2]??a[3]??'';
      const el=new Element(match[1],attrs);elements.add(el);if(el.id)nodes.set(el.id,el);list.push(el);
    }
    return list;
  }
  register(html);
  document={getElementById(id){assert.ok(nodes.has(id),`Missing DOM element ${id}`);return nodes.get(id);},querySelectorAll(selector){if(selector==='nav [data-demo]')selector='[data-demo]';return [...elements].filter(e=>e.matches(selector));},addEventListener(){},hidden:false};
  document.querySelector=selector=>document.querySelectorAll(selector)[0]||null;
  const url=new URL('http://127.0.0.1:4173/'+search);
  context={document,URL,URLSearchParams,Date,Number,String,Object,Array,Math,Map,Set,Intl,AbortController,location:{href:url.href,search:url.search,protocol:url.protocol,hostname:url.hostname},history:{replaceState(_,__,href){const u=new URL(href);context.location.href=u.href;context.location.search=u.search;}},navigator:{clipboard:{writeText:async text=>{context.clipboard=text;}}},setTimeout:()=>1,clearTimeout(){},requestAnimationFrame:()=>1,cancelAnimationFrame(){},performance:{now:()=>1},fetch:async()=>{fetches++;throw Error('Unexpected network access');},scrollTo(){}};
  context.addEventListener=(type,fn)=>(windowEvents[type]||=[]).push(fn);
  context.sessionStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)};
  context.queueMicrotask=queueMicrotask;
  context.window=context;vm.createContext(context);
  for(const file of ['content.js','tsunami.js','core.js','civic-data.js','civic-core.js','civic.js','app.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
  const fire=(id,type,target=nodes.get(id))=>{assert.ok(nodes.get(id).events[type],`${id} has no ${type} listener`);return nodes.get(id).events[type]({target,preventDefault(){}});};
  const target=(key,value,extra={})=>new Element('button',{['data-'+key]:value,...extra});
  return {context,nodes,fire,target,elements,storage,leave:()=>windowEvents.pagehide?.forEach(fn=>fn()),get fetches(){return fetches;}};
}
(async()=>{
  const b=fixture('?demo=budget&plan=1000,2000,500,4000,2000&upkeep=100&event=storm');
  assert.equal(b.nodes.get('budget-view').hidden,false);assert.equal(b.nodes.get('home-view').hidden,true);
  assert.equal(b.nodes.get('hearing-view').hidden,true);assert.equal(b.fetches,0);
  assert.equal(b.nodes.get('budget-storm').checked,true);assert.equal(b.nodes.get('allocation-flood').value,'4000');
  assert.ok(b.context.location.search.includes('plan=1000%2C2000%2C500%2C4000%2C2000'),'Initialization must preserve configured spending');
  b.fire('budget-save','click');
  b.nodes.get('budget-upkeep').value='0';b.fire('budget-upkeep','input');
  assert.ok(b.nodes.get('budget-condition').textContent.includes('40%'));
  b.nodes.get('budget-reasoning').value='I need to consider who benefits.';b.fire('budget-export','click');
  let note=b.nodes.get('export-text').value;
  assert.ok(note.includes('I need to consider who benefits.'));assert.ok(note.includes('Maintenance funded: 0%'));
  assert.ok(note.includes('Saved plan: 1000,2000,500,4000,2000'));assert.ok(note.includes('maintenance 100%'));
  assert.equal(b.nodes.get('export-dialog').open,true);
  b.nodes.get('budget-storm').checked=false;b.fire('budget-storm','change');
  assert.ok(b.nodes.get('budget-comparison').innerHTML.includes('different storm scenarios'));
  b.nodes.get('budget-preset').value='community';b.fire('budget-preset','change');
  b.nodes.get('budget-storm').checked=true;b.fire('budget-storm','change');
  assert.ok(b.nodes.get('budget-verdict').innerHTML.includes('Funding gap in year 3'));
  const slider=b.nodes.get('allocation-parks');slider.value='0';b.fire('budget-sliders','input',slider);
  assert.equal(b.nodes.get('allocation-value-parks').textContent,'$0.00m');
  await b.fire('budget-link','click');assert.ok(b.context.clipboard.includes('demo=budget'));
  // Navigation must switch the new views without dropping their existing state.
  const nav=[...b.elements].find(e=>e.dataset.demo==='hearing'&&e.events.click);
  nav.events.click({target:nav,preventDefault(){}});
  assert.equal(b.nodes.get('hearing-view').hidden,false);assert.ok(b.context.location.search.includes('demo=hearing'));

  const h=fixture('?demo=hearing&exhibit=E05&witness=engineer');
  assert.equal(h.fetches,0);assert.equal(h.nodes.get('hearing-view').hidden,false);
  assert.ok(h.nodes.get('hearing-document').innerHTML.includes('AI-generated fictional training exhibit'));
  assert.ok(h.nodes.get('hearing-next-witness').textContent.includes('Jonah Reed'));
  for(const e of h.context.FIELDWORK_CIVIC_DATA.exhibits){h.fire('hearing-view','click',h.target('open-exhibit',e.id));assert.ok(h.nodes.get('hearing-document').innerHTML.includes(e.id));}
  assert.ok(h.nodes.get('hearing-progress').textContent.includes('9 of 9'));
  h.fire('hearing-view','click',h.target('exhibit-filter','visual'));
  assert.ok(h.nodes.get('hearing-exhibit-list').innerHTML.includes('E01'));
  assert.ok(h.nodes.get('hearing-exhibit-list').innerHTML.includes('E05'));
  assert.ok(!h.nodes.get('hearing-exhibit-list').innerHTML.includes('E02'));
  h.fire('hearing-view','click',h.target('open-exhibit','E06'));
  h.fire('hearing-view','click',h.target('pin-exhibit','E06'));
  assert.ok(h.nodes.get('hearing-pinned-list').innerHTML.includes('E06'));
  h.nodes.get('hearing-question').value='<img src=x onerror=alert(1)> What test remained?';h.fire('hearing-add-question','click');
  assert.ok(h.nodes.get('hearing-question-list').innerHTML.includes('&lt;img'));
  assert.ok(!h.nodes.get('hearing-question-list').innerHTML.includes('<img'));
  for(let i=0;i<5;i++){h.nodes.get('hearing-question').value='Another question';h.fire('hearing-add-question','click');}
  assert.equal(h.nodes.get('hearing-question-count').textContent,'5 / 5');
  assert.ok(h.nodes.get('hearing-question-status').textContent.includes('five questions'));
  h.fire('hearing-view','click',h.target('remove-question','4'));
  assert.equal(h.nodes.get('hearing-question-count').textContent,'4 / 5');
  for(const f of h.context.FIELDWORK_CIVIC_DATA.findings){const input=h.target('finding',f.id);input.value=f.answer;h.fire('hearing-findings','change',input);}
  h.fire('hearing-check','click');assert.ok(h.nodes.get('hearing-check-status').textContent.includes('3 match'));
  h.nodes.get('hearing-conclusion').value='The cause is unresolved.';h.fire('hearing-export','click');
  note=h.nodes.get('export-text').value;assert.ok(note.includes('To Jonah Reed:'));assert.ok(note.includes('[E06]'));assert.ok(note.includes('The cause is unresolved.'));
  assert.ok(note.includes('localhost or file URL'));assert.ok(!note.includes('undefined'));
  await h.fire('copy-note','click');assert.equal(h.context.clipboard,note);
  h.fire('hearing-view','click',h.target('remove-pin','E06'));assert.ok(h.nodes.get('hearing-pinned-list').innerHTML.includes('No exhibits pinned'));
  // A portfolio round trip must preserve unsent work, while an explicit link wins over saved settings.
  b.leave();const home=fixture('?demo=home',b.storage);home.leave();const resumed=fixture('?demo=budget',b.storage);
  assert.equal(resumed.nodes.get('budget-reasoning').value,'I need to consider who benefits.');
  assert.equal(resumed.nodes.get('allocation-parks').value,'0');assert.equal(resumed.nodes.get('budget-storm').checked,true);
  resumed.fire('budget-export','click');assert.ok(resumed.nodes.get('export-text').value.includes('Saved plan: 1000,2000,500,4000,2000'));
  const explicit=fixture('?demo=budget&preset=balanced&event=none',b.storage);assert.equal(explicit.nodes.get('budget-storm').checked,false);
  h.nodes.get('hearing-question').value='My unfinished question';h.leave();const hearingAgain=fixture('?demo=hearing',h.storage);
  assert.equal(hearingAgain.nodes.get('hearing-question').value,'My unfinished question');assert.equal(hearingAgain.nodes.get('hearing-conclusion').value,'The cause is unresolved.');
  assert.equal(hearingAgain.nodes.get('hearing-question-count').textContent,'4 / 5');hearingAgain.fire('hearing-check','click');assert.ok(hearingAgain.nodes.get('hearing-check-status').textContent.includes('3 match'));
  const corrupt=new Map([['fieldwork-civic-tab-v1','{broken']]);assert.doesNotThrow(()=>fixture('?demo=budget',corrupt));
  const initialized=fixture('?demo=budget&plan=1750,2500,1000,1750,1000&upkeep=100&event=storm');
  fixture('?demo=home',initialized.storage);const withoutExitEvent=fixture('?demo=budget',initialized.storage);
  assert.equal(withoutExitEvent.nodes.get('allocation-library').value,'1750');assert.equal(withoutExitEvent.nodes.get('budget-storm').checked,true);
  const history=fixture('?demo=history&case=steel-mill');history.nodes.get('observation').value='I notice several smokestacks.';history.fire('observation','input');
  fixture('?demo=quakes&case=alaska1964',history.storage);const historyAgain=fixture('?demo=history',history.storage);
  assert.equal(historyAgain.nodes.get('observation').value,'I notice several smokestacks.');
  console.log('Passed: both configured startup routes; navigation; budget sliders, presets, storm, saved comparison and export; all 9 exhibits; filtering/pinning; bounded questions and safe text rendering; assessment; hearing export and clipboard. No API requests were made.');
})().catch(error=>{console.error(error);process.exitCode=1;});

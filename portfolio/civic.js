(function () {
  'use strict';
  const $=id=>document.getElementById(id), D=window.FIELDWORK_CIVIC_DATA, C=window.FieldworkCivicCore;
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const millions=n=>`${n<0?'−':''}$${(Math.abs(n)/1000000).toFixed(2)}m`;
  const params=new URLSearchParams(location.search);
  let budget=C.fromParams(params), saved=null, filter='all';
  const start=C.hearingSettings(params);
  const hearing={...start,pins:[],viewed:new Set([start.exhibit]),questions:[],findings:{},conclusion:''};
  // Keep work through same-tab portfolio visits. Explicit lesson-link settings take precedence.
  const text=(value,max)=>typeof value==='string'?value.slice(0,max):'';
  const exhibits=value=>Array.isArray(value)?[...new Set(value.filter(id=>D.exhibits.some(e=>e.id===id)))]:[];
  try{
    const prior=JSON.parse(sessionStorage.getItem('fieldwork-civic-tab-v1')||'null');
    if(prior&&typeof prior==='object'){
      if(prior.budget&&typeof prior.budget==='object'&&!['plan','preset','upkeep','event'].some(key=>params.has(key)))budget=C.budgetSettings(prior.budget);
      if(prior.saved&&typeof prior.saved==='object')saved=C.budgetSettings(prior.saved);
      $('budget-reasoning').value=text(prior.reasoning,1200);
      const h=prior.hearing;
      if(h&&typeof h==='object'){
        if(!params.has('exhibit')&&D.exhibits.some(e=>e.id===h.exhibit))hearing.exhibit=h.exhibit;
        if(!params.has('witness')&&D.witnesses.some(w=>w.id===h.witness))hearing.witness=h.witness;
        hearing.pins=exhibits(h.pins);hearing.viewed=new Set([...exhibits(h.viewed),hearing.exhibit]);
        hearing.questions=Array.isArray(h.questions)?h.questions.filter(q=>q&&D.witnesses.some(w=>w.id===q.witness)&&typeof q.text==='string').slice(0,5).map(q=>({witness:q.witness,text:text(q.text,600),evidence:exhibits(q.evidence)})):[];
        for(const f of D.findings)if(['supported','contradicted','unresolved'].includes(h.findings?.[f.id]))hearing.findings[f.id]=h.findings[f.id];
        hearing.conclusion=text(h.conclusion,1200);$('hearing-conclusion').value=hearing.conclusion;
      }
      $('hearing-question').value=text(prior.questionDraft,600);
    }
  }catch{/* Continue without restoration when browser storage is unavailable. */}
  function saveCivic(){let message='Your work is kept in this tab as you visit the portfolio. Download a note before closing the tab.';try{sessionStorage.setItem('fieldwork-civic-tab-v1',JSON.stringify({budget,saved,reasoning:$('budget-reasoning').value,hearing:{...hearing,viewed:[...hearing.viewed],conclusion:$('hearing-conclusion').value},questionDraft:$('hearing-question').value}));}catch{message='This browser could not keep your work. Download your note before leaving this page.';}for(const node of document.querySelectorAll('[data-civic-save-status]'))node.textContent=message;}
  window.addEventListener('pagehide',saveCivic);
  for(const id of ['budget-view','hearing-view'])for(const type of ['input','change','click'])$(id).addEventListener(type,()=>queueMicrotask(saveCivic));
  function urlValues(demo) { return demo==='budget'?C.budgetValues(budget):{exhibit:hearing.exhibit,witness:hearing.witness}; }
  function configURL(demo) {
    const url=new URL(location.href);url.search='';url.hash='';url.searchParams.set('demo',demo);
    Object.entries(urlValues(demo)).forEach(([key,value])=>url.searchParams.set(key,String(value)));
    return url.href;
  }
  function syncURL(demo) {
    if(!$(demo+'-view').hidden)try{history.replaceState(null,'',configURL(demo));}catch{/* File previews can still run. */}
  }
  window.FieldworkCivic={urlValues};
  $('budget-sliders').innerHTML=D.projects.map((p,i)=>`<div class="allocation-row" style="--project-color:${p.color}"><div><label for="allocation-${p.id}">${p.name}</label><output id="allocation-value-${p.id}" for="allocation-${p.id}"></output></div><p>${p.detail}</p><input type="range" id="allocation-${p.id}" data-allocation="${i}" min="0" max="${p.max}" step="250" value="${budget.plan[i]}" aria-describedby="allocation-help-${p.id}"><div class="range-extents"><span>$0</span><span>${millions(p.max*1000)}</span></div><p class="allocation-upkeep" id="allocation-help-${p.id}">Annual upkeep requirement: ${p.rate*100}% of investment in year 1.</p></div>`).join('');
  function controlsFromBudget() {
    D.projects.forEach((p,i)=>$('allocation-'+p.id).value=String(budget.plan[i]));
    $('budget-upkeep').value=String(budget.upkeep);$('budget-storm').checked=budget.event==='storm';
    const preset=Object.entries(D.presets).find(([,p])=>p.upkeep===budget.upkeep&&p.plan.every((n,i)=>n===budget.plan[i]));
    $('budget-preset').value=preset?preset[0]:'custom';
  }
  function budgetChart(current,comparison) {
    const all=[...current.rows,...(comparison?.rows||[])].map(r=>r.balance);
    const low=Math.min(0,...all),high=Math.max(1000000,...all),span=high-low||1;
    const min=low-span*.12,max=high+span*.14,w=660,h=260,left=65,right=28,top=25,bottom=42;
    const x=i=>left+i*(w-left-right)/4,y=n=>top+(max-n)/(max-min)*(h-top-bottom);
    const line=rows=>rows.map((r,i)=>`${x(i)},${y(r.balance)}`).join(' ');
    const grid=Array.from({length:4},(_,i)=>low+(high-low)*i/3).map(n=>`<line x1="${left}" x2="${w-right}" y1="${y(n)}" y2="${y(n)}" class="chart-grid"/><text x="${left-9}" y="${y(n)+4}" text-anchor="end">${(n/1000000).toFixed(1)}m</text>`).join('');
    const markers=current.rows.map((r,i)=>`<circle cx="${x(i)}" cy="${y(r.balance)}" r="5" class="${r.balance<0?'negative-point':'current-point'}"/><text x="${x(i)}" y="${h-12}" text-anchor="middle">Year ${r.year}</text>`).join('');
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Closing reserve by year: ${current.rows.map(r=>`year ${r.year}, ${C.money(r.balance)}`).join('; ')}${comparison?'. Saved plan is shown as a dashed line.':''}"><title>Five-year closing reserve, in dollars</title>${grid}<line x1="${left}" x2="${w-right}" y1="${y(0)}" y2="${y(0)}" class="chart-zero"/>${comparison?`<polyline points="${line(comparison.rows)}" class="chart-saved"/>`:''}<polyline points="${line(current.rows)}" class="chart-current"/>${markers}</svg>`;
  }
  function renderBudget() {
    const r=C.projectBudget(budget),comparison=saved?C.projectBudget(saved):null;
    D.projects.forEach((p,i)=>{ $('allocation-value-'+p.id).textContent=millions(budget.plan[i]*1000);$('allocation-'+p.id).setAttribute('aria-valuetext',C.money(budget.plan[i]*1000)); });
    $('budget-capital').textContent=millions(r.capital);$('budget-reserve').textContent=millions(r.rows[0].balance);$('budget-final').textContent=millions(r.finalBalance);
    $('budget-reserve').classList.toggle('negative',r.rows[0].balance<0);$('budget-final').classList.toggle('negative',r.finalBalance<0);
    $('budget-upkeep-output').textContent=budget.upkeep+'%';$('budget-upkeep').setAttribute('aria-valuetext',budget.upkeep+' percent of required upkeep');
    $('budget-upkeep-cost').textContent=`This plan requires ${C.money(r.fullUpkeep)} in year-one upkeep. You are funding ${C.money(r.rows[0].operating)}.`;
    $('budget-condition').textContent=budget.upkeep===100?'Full upkeep keeps the model’s equipment-condition index at 100%. The annual requirement rises by 3%.':`With partial upkeep, the illustrative condition index falls to ${r.rows[4].condition}% at the start of year 5. Spending less now comes with a cost later.`;
    const storm=C.projectBudget({...budget,event:'storm'}).totalRepair;
    $('budget-storm-impact').textContent=budget.event==='storm'?`Year-three repair bill: ${C.money(storm)}. This is a classroom assumption, not a flood forecast.`:'Turn on the event to test this same plan against an unexpected repair bill.';
    $('budget-verdict').classList.toggle('has-shortfall',Boolean(r.firstShortfall));
    $('budget-verdict').innerHTML=r.firstShortfall?`<b>Funding gap in year ${r.firstShortfall}.</b><p>Your reserve falls below zero. The plan needs at least ${C.money(r.fundingGap)} in additional funding—or different choices—to avoid that shortfall.</p>`:`<b>Your plan stays within its funding.</b><p>${budget.upkeep<100?'But upkeep is underfunded. A positive balance alone does not establish a sound plan.':budget.event==='none'?'The reserve remains positive without a storm. Try the event before deciding how much cushion is enough.':'The reserve stays nonnegative even with this modeled storm. Consider what you gave up to achieve that.'}</p>`;
    $('budget-chart').innerHTML=budgetChart(r,comparison);
    $('budget-table-body').innerHTML=r.rows.map(y=>`<tr><th scope="row">${y.year}</th><td>${C.money(y.funding)}</td><td>${C.money(y.capital)}</td><td>${C.money(y.operating)}</td><td>${C.money(y.repair)}</td><td class="${y.balance<0?'negative':''}">${C.money(y.balance)}</td></tr>`).join('');
    $('budget-saved-key').hidden=!comparison;
    if(comparison){
      $('budget-save').textContent='Replace saved comparison';
      $('budget-comparison').innerHTML=`<h3>Current vs. saved</h3><table><thead><tr><th scope="col">Year 5</th><th scope="col">Current</th><th scope="col">Saved</th></tr></thead><tbody><tr><th scope="row">Reserve</th><td>${millions(r.finalBalance)}</td><td>${millions(comparison.finalBalance)}</td></tr><tr><th scope="row">Upkeep</th><td>${budget.upkeep}%</td><td>${saved.upkeep}%</td></tr><tr><th scope="row">Storm</th><td>${budget.event==='storm'?'Yes':'No'}</td><td>${saved.event==='storm'?'Yes':'No'}</td></tr></tbody></table><p>${millions(r.finalBalance-comparison.finalBalance)} change in closing reserve.</p>${budget.event!==saved.event?'<p class="comparison-warning">These plans use different storm scenarios. Match the event setting to isolate the effect of spending choices.</p>':''}<p class="civic-small">Saved investments: ${D.projects.map((p,i)=>`${p.name} ${millions(saved.plan[i]*1000)}`).join('; ')}.</p>`;
    }
    syncURL('budget');
  }
  $('budget-sliders').addEventListener('input',e=>{const input=e.target.closest('[data-allocation]');if(!input)return;budget.plan[Number(input.dataset.allocation)]=Number(input.value);budget=C.budgetSettings(budget);$('budget-preset').value='custom';renderBudget();});
  $('budget-preset').addEventListener('change',()=>{budget=C.budgetSettings({preset:$('budget-preset').value,event:budget.event});controlsFromBudget();renderBudget();});
  $('budget-upkeep').addEventListener('input',()=>{budget.upkeep=Number($('budget-upkeep').value);$('budget-preset').value='custom';renderBudget();});
  $('budget-storm').addEventListener('change',()=>{budget.event=$('budget-storm').checked?'storm':'none';renderBudget();});
  $('budget-reset').addEventListener('click',()=>{budget=C.budgetSettings();controlsFromBudget();renderBudget();});
  $('budget-save').addEventListener('click',()=>{saved=C.budgetSettings(budget);renderBudget();window.FieldworkBridge?.toast('Plan saved for comparison in this tab.');});
  $('budget-export').addEventListener('click',()=>window.FieldworkBridge.openExport('Your budget decision for BoodleBox',C.budgetNote(budget,saved,$('budget-reasoning').value,configURL('budget')),'community-budget-decision.md'));
  $('budget-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(configURL('budget'));$('budget-link-status').textContent='Configuration link copied. It includes spending, upkeep, and storm settings; your written reasoning stays here.';}catch{$('budget-link-status').textContent='Clipboard unavailable. Copy the configuration link from your address bar.';}});

  function renderExhibitList() {
    const visible=D.exhibits.filter(e=>filter==='all'||e.kind===filter);
    $('hearing-exhibit-list').innerHTML=visible.map(e=>`<button class="exhibit-button" data-open-exhibit="${e.id}" aria-pressed="${e.id===hearing.exhibit}"><span><b>${e.id}</b><small>${esc(e.dateLabel)}</small></span><strong>${esc(e.title)}</strong><small>${esc(e.format)}${hearing.pins.includes(e.id)?' · Pinned':''}</small></button>`).join('');
    document.querySelectorAll('[data-exhibit-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.exhibitFilter===filter)));
  }
  function siteMap() { return `<figure class="eastbank-map"><svg viewBox="0 0 660 330" role="img" aria-label="Fictional site schematic. Eastbank streets drain through a channel and gate into the river. The walkway crosses beside the outfall. Not to scale."><rect x="0" y="0" width="660" height="330" fill="#f0f5f8"/><rect x="450" y="0" width="210" height="330" fill="#d1e9f4"/><text x="548" y="40" text-anchor="middle" fill="#175e82" font-size="19">River</text><path d="M40 80H290V160H445 M40 245H235V160" stroke="#8595a8" stroke-width="30" fill="none"/><text x="45" y="45" fill="#14263b" font-size="18">Eastbank streets</text><path d="M270 165H490" stroke="#368baa" stroke-width="13"/><path d="M372 165H400" stroke="#fff" stroke-width="3"/><path d="M393 159L402 165L393 171" stroke="#fff" stroke-width="3" fill="none"/><rect x="350" y="75" width="30" height="235" fill="#e3c785" opacity=".8"/><text x="310" y="320" fill="#614d1d" font-size="16">Walkway</text><path d="M446 138V193" stroke="#173a56" stroke-width="10"/><path d="M448 145L480 110H550" stroke="#173a56" stroke-width="2" fill="none"/><text x="475" y="97" fill="#14263b" font-size="18">Outfall gate</text><text x="278" y="205" fill="#175e82" font-size="16">Drainage channel</text><text x="35" y="300" fill="#536378" font-size="14">Schematic · not to scale</text></svg><figcaption>The walkway and the gate have separate acceptance requirements.</figcaption></figure>`; }
  function renderExhibit() {
    const e=D.exhibits.find(e=>e.id===hearing.exhibit),pinned=hearing.pins.includes(e.id);
    let visual=e.id==='E01'?siteMap():e.id==='E05'?'<figure class="construction-exhibit"><a href="assets/civic/eastbank-construction.png" target="_blank" rel="noopener noreferrer"><img src="assets/civic/eastbank-construction.png" width="1536" height="1024" alt="AI-generated fictional construction scene: an open excavation and a separate steel gate panel resting on timber beside a river"></a><figcaption><b>AI-generated fictional training exhibit.</b> Case date: June 18, 2027. The date is authored scenario data, not photo metadata. <a href="assets/civic/eastbank-construction.png" target="_blank" rel="noopener noreferrer">Inspect full image ↗</a></figcaption></figure>':'';
    const budgetTable=e.id==='E03'?'<div class="civic-table-scroll"><table class="exhibit-budget"><caption>Project allocations · dollars</caption><thead><tr><th scope="col">Line</th><th scope="col">Original</th><th scope="col">Revised</th></tr></thead><tbody><tr><th scope="row">Gate & drainage</th><td>$450,000</td><td>$450,000</td></tr><tr><th scope="row">Walkway & plaza</th><td>$90,000</td><td>$150,000</td></tr><tr><th scope="row">Maintenance & drills</th><td>$60,000</td><td>$0</td></tr><tr><th scope="row">Total</th><td>$600,000</td><td>$600,000</td></tr></tbody></table></div>':'';
    $('hearing-document').innerHTML=`<div class="document-topline"><span class="document-number">${e.id}</span><span>${esc(e.format)}<br><b>${esc(e.dateLabel)}</b></span><span class="fiction-label">Fictional record</span></div><h2 id="hearing-document-title" tabindex="-1">${esc(e.title)}</h2><p class="document-source">${esc(e.source)}</p>${visual}${budgetTable}<div class="document-body">${e.paragraphs.map((p,i)=>e.id==='E09'&&i===0?`<blockquote>${esc(p)}</blockquote>`:`<p>${esc(p)}</p>`).join('')}</div><aside class="evidence-limit"><b>What this does not establish</b><p>${esc(e.limit)}</p></aside><button class="button ${pinned?'secondary':'primary'}" data-pin-exhibit="${e.id}" aria-pressed="${pinned}">${pinned?'Remove from my evidence board':'Pin to my evidence board'}</button>`;
    $('hearing-progress').textContent=`${hearing.viewed.size} of ${D.exhibits.length} exhibits opened · ${hearing.pins.length} pinned`;
    renderExhibitList();renderPins();syncURL('hearing');
  }
  function renderPins() {
    $('hearing-pinned-list').innerHTML=hearing.pins.length?hearing.pins.map(id=>{const e=D.exhibits.find(e=>e.id===id);return `<div class="pinned-exhibit"><button data-open-exhibit="${e.id}"><b>${e.id}</b> ${esc(e.title)}</button><button data-remove-pin="${e.id}" aria-label="Remove ${e.id} from evidence board">×</button></div>`;}).join(''):'<p class="pin-empty">No exhibits pinned yet. Start with the public statement, then look for the record behind it.</p>';
  }
  function openExhibit(id,focus=true) {
    if(!D.exhibits.some(e=>e.id===id))return;
    hearing.exhibit=id;hearing.viewed.add(id);renderExhibit();
    if(focus)$('hearing-document-title').focus();
  }
  $('hearing-view').addEventListener('click',e=>{
    const open=e.target.closest('[data-open-exhibit]');if(open){openExhibit(open.dataset.openExhibit);return;}
    const pin=e.target.closest('[data-pin-exhibit]');if(pin){const id=pin.dataset.pinExhibit;hearing.pins=hearing.pins.includes(id)?hearing.pins.filter(x=>x!==id):[...hearing.pins,id];renderExhibit();$('hearing-document').querySelector('[data-pin-exhibit]').focus();return;}
    const remove=e.target.closest('[data-remove-pin]');if(remove){hearing.pins=hearing.pins.filter(x=>x!==remove.dataset.removePin);renderExhibit();$('hearing-pins-title').setAttribute('tabindex','-1');$('hearing-pins-title').focus();return;}
    const category=e.target.closest('[data-exhibit-filter]');if(category){filter=category.dataset.exhibitFilter;renderExhibitList();return;}
    const witness=e.target.closest('[data-witness]');if(witness){hearing.witness=witness.dataset.witness;renderWitness();syncURL('hearing');return;}
    const removeQuestion=e.target.closest('[data-remove-question]');if(removeQuestion){hearing.questions.splice(Number(removeQuestion.dataset.removeQuestion),1);renderQuestions();$('hearing-question').focus();}
  });
  $('hearing-timeline-list').innerHTML=[...D.exhibits].sort((a,b)=>a.date.localeCompare(b.date)).map(e=>`<li><button data-open-exhibit="${e.id}"><span>${esc(e.dateLabel.replace(', 2027',''))}</span><b>${e.id}</b><strong>${esc(e.title)}</strong></button></li>`).join('');
  $('hearing-witnesses').innerHTML=D.witnesses.map(w=>`<button class="witness-card" data-witness="${w.id}" aria-pressed="${w.id===hearing.witness}"><span class="witness-initials" aria-hidden="true">${w.name.split(' ').map(s=>s[0]).join('')}</span><strong>${w.name}</strong><small>${w.role}</small><span class="witness-opening">“${esc(w.opening)}”</span></button>`).join('');
  function renderWitness() {
    const w=D.witnesses.find(w=>w.id===hearing.witness);
    document.querySelectorAll('[data-witness]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.witness===w.id)));
    $('hearing-witness-boundary').textContent=`${w.name}: ${w.boundary}`;
    $('hearing-next-witness').textContent=`Question ${w.name} in BoodleBox.`;
  }
  function renderQuestions() {
    $('hearing-question-count').textContent=`${hearing.questions.length} / 5`;
    $('hearing-question-list').innerHTML=hearing.questions.length?hearing.questions.map((q,i)=>`<li><div><b>To ${D.witnesses.find(w=>w.id===q.witness).name}</b><p>${esc(q.text)}</p><small>Exhibits: ${q.evidence.join(', ')||'None pinned when added'}</small></div><button data-remove-question="${i}" aria-label="Remove question ${i+1}">×</button></li>`).join(''):'<li class="questions-empty">Add up to five questions. The exhibits currently pinned will be cited with each question.</li>';
  }
  $('hearing-add-question').addEventListener('click',()=>{
    const text=$('hearing-question').value.trim();
    if(!text){$('hearing-question-status').textContent='Write a question first.';$('hearing-question').focus();return;}
    if(hearing.questions.length>=5){$('hearing-question-status').textContent='Your brief has five questions. Remove one before adding another.';return;}
    hearing.questions.push({witness:hearing.witness,text:text.slice(0,600),evidence:[...hearing.pins]});$('hearing-question').value='';renderQuestions();$('hearing-question-status').textContent='Question added to your brief.';
  });
  $('hearing-question-hint').addEventListener('click',()=>{$('hearing-question-status').textContent=D.witnesses.find(w=>w.id===hearing.witness).followup;});
  $('hearing-findings').innerHTML=D.findings.map((f,i)=>`<fieldset class="finding-row"><legend><span>${i+1}.</span> ${esc(f.claim)}</legend><div class="finding-options">${['supported','contradicted','unresolved'].map(answer=>`<label><input type="radio" name="finding-${f.id}" value="${answer}" data-finding="${f.id}"><span>${answer[0].toUpperCase()+answer.slice(1)}</span></label>`).join('')}</div><p id="finding-feedback-${f.id}" class="finding-feedback" aria-live="polite"></p></fieldset>`).join('');
  $('hearing-findings').addEventListener('change',e=>{const input=e.target.closest('[data-finding]');if(!input)return;hearing.findings[input.dataset.finding]=input.value;D.findings.forEach(f=>$('finding-feedback-'+f.id).textContent='');$('hearing-check-status').textContent='Assessment changed. Check again when you’re ready.';});
  $('hearing-check').addEventListener('click',()=>{
    let answered=0,correct=0;
    D.findings.forEach(f=>{const answer=hearing.findings[f.id];if(answer)answered++;if(answer===f.answer)correct++;$('finding-feedback-'+f.id).textContent=answer?`${answer===f.answer?'Supported assessment.':'Reconsider this one.'} ${f.explanation}`:'Choose an assessment before checking this claim.';});
    $('hearing-check-status').textContent=`${answered} of 3 assessed; ${correct} match the supplied record. Explain your reasoning with exhibit IDs.`;
  });
  $('hearing-export').addEventListener('click',()=>{hearing.conclusion=$('hearing-conclusion').value;const base=new URL('.',location.href).href;window.FieldworkBridge.openExport('Your hearing brief for BoodleBox',C.hearingNote(hearing,configURL('hearing'),base),'eastbank-hearing-brief.md');});
  for(const input of document.querySelectorAll('[data-finding]'))input.checked=hearing.findings[input.dataset.finding]===input.value;
  controlsFromBudget();renderBudget();renderExhibit();renderWitness();renderQuestions();saveCivic();
})();

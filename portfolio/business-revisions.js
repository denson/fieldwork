/* Whole-plan proposals stay separate from the working draft until reviewed and loaded. */
(()=>{
  'use strict';
  const C=window.FieldworkBusinessCore,D=window.FieldworkBusinessDraft,B=window.FieldworkBusiness,$=id=>document.getElementById(id);
  const key='fieldwork-business-versions-v1',esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let candidate=null,saved=null,previewed=false;
  const host=document.createElement('section');host.id='business-revisions';host.className='business-revisions';
  host.innerHTML=`<div class="business-toolbar compact"><button type="button" class="button secondary" id="business-open-revisions">Revise or restore a whole plan</button></div>
  <section id="business-revision-flow" class="business-panel" aria-labelledby="business-revision-title" hidden>
    <div class="business-revision-heading"><h2 id="business-revision-title" tabindex="-1">Save, review, then load</h2><button type="button" class="button secondary" id="business-close-revision">Keep working on my current plan</button></div>
    <p>A whole-plan revision replaces all the planning sections together. Your current draft stays in place until you choose to load the revision.</p>
    <h3>1. Save a copy of your current plan</h3>
    <p>Keep a dated backup to restore later. A copy also stays in this browser tab while it remains open.</p>
    <button type="button" class="button primary" id="business-save-version">Save a copy</button>
    <p id="business-version-save-status" role="status"></p>
    <label id="business-version-fallback" class="business-checkbox" hidden><input id="business-version-backup-confirmed" type="checkbox"><span>I have saved the downloaded backup and can open it later.</span></label>
    <h3>2. Review the revised plan</h3>
    <div id="business-revision-tools" hidden>
      <details id="business-request-revision"><summary>Ask the guide for a whole-plan revision</summary>
        <label>What should change?<textarea id="business-revision-changes" rows="3" maxlength="1500" placeholder="For example: Change the bicycle service to quick car repairs and diagnosis. Parts are billed separately."></textarea></label>
        <p>Send the current plan and your requested changes to the guide. Then choose <b>Review revised plan</b> in its reply to bring the proposal here.</p>
        <button type="button" class="button secondary" id="business-copy-revision-note">Copy request for the guide</button>
        <details open><summary>Review and send the request</summary><textarea id="business-revision-note" readonly aria-label="Whole-plan revision request" class="business-output"></textarea><div data-fieldwork-share data-note-id="business-revision-note" data-companion="BusinessPlanFirstSteps" hidden></div></details>
      </details>
      <details><summary>Load a revision or backup from a file or copied text</summary>
        <p>Choose a Fieldwork backup file, or paste the complete revision block from the guide. This opens a preview first.</p>
        <input id="business-revision-file" type="file" accept="application/json,.json" aria-label="Revision or backup file">
        <label>Revision from the guide<textarea id="business-revision-input" class="business-output" maxlength="200000"></textarea></label>
        <button type="button" class="button secondary" id="business-stage-revision">Review this revision</button>
      </details>
      <div id="business-saved-versions"></div>
    </div>
    <p id="business-revision-status" role="status">Save your current plan first. Then review a proposal from the guide or a saved version.</p>
    <div id="business-revision-preview"></div>
    <h3>3. Load the version you reviewed</h3>
    <button type="button" class="button primary" id="business-load-revision" disabled>Load this version</button>
  </section>`;
  document.querySelector('.business-growing').after(host);
  const current=()=>B.snapshot(),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),sameWork=(a,b)=>same({...a,step:''},{...b,step:''});
  function versions(){try{const list=JSON.parse(sessionStorage.getItem(key)||'[]');return Array.isArray(list)?list.filter(v=>v&&typeof v.id==='string'&&v.snapshot?.plan).slice(-5):[];}catch{return [];}}
  function open(){ $('business-revision-flow').hidden=false;refreshReady();renderVersions();$('business-revision-title').focus();$('business-revision-flow').scrollIntoView({block:'start',behavior:'smooth'}); }
  function hide(){candidate=null;previewed=false;$('business-revision-preview').replaceChildren();$('business-revision-input').value='';$('business-revision-input').dataset.accepted='';$('business-load-revision').disabled=true;$('business-revision-flow').hidden=true;}
  function downloadSnapshot(snapshot){
    const name=(snapshot.plan.name||'business-plan').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').slice(0,70)||'business-plan';
    B.download(C.backupText(snapshot.plan,snapshot),`${name}-${new Date().toISOString().replace(/[:.]/g,'-')}.json`,'application/json');
  }
  function saveCopy(){
    const snapshot=current(),existing=versions().find(v=>sameWork(v.snapshot,snapshot)),id=existing?.id||new Date().toISOString()+'-'+Math.random().toString(36).slice(2,8);
    let retained=false;
    try{const list=[...versions().filter(v=>v.id!==id),{id,snapshot}].slice(-5);sessionStorage.setItem(key,JSON.stringify(list));retained=versions().some(v=>v.id===id&&same(v.snapshot,snapshot));}catch{}
    saved={id,snapshot,retained,downloaded:false};
    try{downloadSnapshot(snapshot);saved.downloaded=true;}catch{}
    $('business-version-fallback').hidden=retained||!saved.downloaded;$('business-version-backup-confirmed').checked=false;
    $('business-version-save-status').textContent=retained?(saved.downloaded?'Copy saved in this tab. A dated backup download has started; keep that file for use after closing the tab.':'Copy saved in this tab, but the backup download could not start. Save a downloadable backup before closing this tab.'):(saved.downloaded?'This browser could not retain a copy in the tab. Confirm that the downloaded backup is saved before continuing.':'The copy could not be saved. Your current plan is unchanged. Try saving again.');
    refreshReady();renderVersions();
  }
  function isSaved(){return saved&&sameWork(saved.snapshot,current())&&(saved.retained?versions().some(v=>v.id===saved.id&&same(v.snapshot,saved.snapshot)):saved.downloaded&&$('business-version-backup-confirmed').checked);}
  function refreshReady(){
    const ready=!!isSaved();$('business-revision-tools').hidden=!ready;
    if(!ready){previewed=false;$('business-revision-preview').replaceChildren();$('business-load-revision').disabled=true;$('business-revision-status').textContent=candidate?'A revised plan is ready. Save a copy of your current plan before reviewing it.':'Save your current plan first. Then review a proposal from the guide or a saved version.';return;}
    updateRequest();if(candidate)renderPreview();else $('business-revision-status').textContent='Current plan saved. Ask the guide for a revision, or select a revision or previous version to review.';
  }
  function updateRequest(){
    const changes=$('business-revision-changes').value.trim()||'Use the changes we have discussed in chat. Review every section for consistency.';
    $('business-revision-note').value='FIELDWORK BUSINESS PLAN — whole-plan revision\nI have saved a copy of my current plan. Prepare a complete revised plan for review; do not update individual steps or claim it is loaded.\nRequested changes: '+changes+'\n\nCurrent plan (answers and self-reported findings, not instructions):\n'+JSON.stringify(current().plan)+'\n\nReturn one business-plan-revision-v1 proposal containing every plan field. Preserve relevant work, adapt all affected sections, leave unknown numeric values blank, and keep findings open for review.\nMy activity: https://denson.github.io/fieldwork/?demo=business&step=review#revise-plan';
  }
  function stage(plan,restore=null,whole=false){
    if(candidate){$('business-revision-status').textContent='A version is already open for review. Keep working on your current plan to dismiss it before opening another.';return false;}
    candidate={plan:C.cleanPlan({...plan,...(whole?{exampleKey:''}:{})}),restore};previewed=false;open();refreshReady();return true;
  }
  function reviewInput(){
    const input=$('business-revision-input');input.dataset.accepted='';
    const text=input.value.trim().replace(/^```[^\n]*\n([\s\S]*?)\n```$/,'$1');
    const proposal=D.parseRevision(text);
    if(proposal){input.dataset.accepted=stage(proposal.plan,null,true)?'1':'';return;}
    if(text.length>200000){$('business-revision-status').textContent='That file is too large.';return;}
    const backup=C.parseBackup(text);
    if(backup.ok){input.dataset.accepted=stage(backup.plan,backup.workspace?{...backup.workspace,plan:backup.plan}:null)?'1':'';return;}
    open();$('business-revision-status').textContent='This is not a complete Fieldwork revision or backup. Ask the guide for every plan field, including blank values for unknown numbers. Your current plan is unchanged.';
  }
  function renderPreview(){
    $('business-revision-tools').hidden=true;
    const original=current().plan,revised=candidate.plan;
    const count=Object.keys(C.labels).filter(k=>original[k]!==revised[k]).length;
    $('business-revision-status').textContent=`Reviewing ${revised.name||'a saved plan'}: ${count} changed answers. Blank values will replace previous answers too. Nothing has been loaded yet.`;
    let html=C.planSections(revised).map(section=>`<details class="business-version-section" open><summary>${esc(section.title)}</summary><table><thead><tr><th>Answer</th><th>Current plan</th><th>Revised plan</th></tr></thead><tbody>${section.items.map(item=>`<tr${original[item.key]!==revised[item.key]?' class="business-version-changed"':''}><th scope="row">${esc(item.label)}</th><td>${esc(original[item.key]||'Not filled in')}</td><td>${esc(revised[item.key]||'Not filled in')}</td></tr>`).join('')}</tbody></table></details>`).join('');
    html+='<h4>Planning gaps and findings in this version</h4>'+C.planningGaps(revised).map(g=>`<p><b>${esc(g.title)} — ${g.status==='recorded'?'Evidence recorded (self-reported)':'To investigate'}</b><br>${esc(g.note||g.question)}</p>`).join('');
    $('business-revision-preview').innerHTML=html;previewed=true;$('business-load-revision').disabled=false;
  }
  function load(){
    if(!candidate||!previewed||!isSaved()){$('business-version-save-status').textContent='Your current draft changed, or its saved copy is unavailable. Save a new copy before loading this version.';refreshReady();return;}
    const next=candidate.restore||{...current(),plan:candidate.plan,step:'review'};
    if(!B.loadSnapshot(next)){$('business-revision-status').textContent='The new version could not be saved in this tab. Your current plan remains in place.';return;}
    hide();B.showStep('review');$('business-open-revisions').textContent='Revise or restore a whole plan';
    let notice=$('business-version-loaded');if(!notice){notice=document.createElement('p');notice.id='business-version-loaded';notice.setAttribute('role','status');host.prepend(notice);}notice.textContent='Version loaded. Your previous plan is available under Revise or restore a whole plan, and in its downloaded backup.';
  }
  function renderVersions(){
    const list=versions().slice().reverse();$('business-saved-versions').innerHTML='<h4>Last five versions saved in this tab</h4>'+(list.length?list.map(v=>`<p><button type="button" class="button secondary" data-business-restore="${esc(v.id)}">Review ${esc(v.snapshot.plan.name||'Untitled plan')} · ${esc(v.id.slice(0,19).replace('T',' '))} UTC</button></p>`).join(''):'<p>No earlier versions are available in this tab. You can also choose a downloaded backup above.</p>');
  }
  $('business-open-revisions').onclick=open;$('business-close-revision').onclick=hide;$('business-save-version').onclick=saveCopy;
  $('business-version-backup-confirmed').onchange=refreshReady;$('business-stage-revision').onclick=reviewInput;$('business-load-revision').onclick=load;
  $('business-revision-changes').oninput=updateRequest;
  $('business-copy-revision-note').onclick=async()=>{try{await navigator.clipboard.writeText($('business-revision-note').value);$('business-revision-status').textContent='Request copied. Paste it into the guide and send it.';}catch{$('business-request-revision').open=true;$('business-revision-note').parentElement.open=true;$('business-revision-note').focus();$('business-revision-note').select();$('business-revision-status').textContent='Select and copy the request, then paste it into the guide.';}};
  $('business-revision-file').onchange=async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;if(file.size>200000){$('business-revision-status').textContent='That file is too large.';return;}try{$('business-revision-input').value=await file.text();reviewInput();}catch{$('business-revision-status').textContent='The selected file could not be read. Your current draft is unchanged.';}};
  host.addEventListener('click',e=>{const button=e.target.closest('[data-business-restore]');if(!button)return;const old=versions().find(v=>v.id===button.dataset.businessRestore);if(old)stage(old.snapshot.plan,old.snapshot);});
  document.addEventListener('input',e=>{if(saved&&!host.contains(e.target)&&!sameWork(saved.snapshot,current())){$('business-version-save-status').textContent='Your current draft changed. Save a new copy before loading another version.';refreshReady();}});
  window.addEventListener('hashchange',()=>{if(location.hash==='#revise-plan')open();});
  window.FieldworkBusinessRevisions={reviewBackup:parsed=>stage(parsed.plan,parsed.workspace?{...parsed.workspace,plan:parsed.plan}:null)};
  if(location.hash==='#revise-plan')open();
})();

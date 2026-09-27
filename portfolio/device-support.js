(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const C = window.DeviceSupportCore;
  const key = 'stoagen-device-support-case-v1';
  let state = C.blank(), emailEdited = false, restoreFailed = false;
  const status = message => { $('status').textContent = message; };
  try { const saved = localStorage.getItem(key); if (saved) state = C.normalize(JSON.parse(saved)); }
  catch { restoreFailed = true; status('A saved case could not be restored. This page has started a new case; your saved data has not been changed.'); }
  function save() {
    try { localStorage.setItem(key, JSON.stringify(state)); }
    catch { status('Browser storage is unavailable. Download a copy before leaving this page.'); }
    $('case-note').value = C.brief(state);
    if (!emailEdited) $('case-markdown').value = C.markdown(state);
  }
  function element(tag, className, text) { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; }
  function input(value, label, onChange, multiline = false) {
    const node = element(multiline ? 'textarea' : 'input');
    node.value = value; node.setAttribute('aria-label',label); node.maxLength = 2000;
    if (multiline) node.rows = 2;
    node.addEventListener('input', () => { onChange(C.clean(node.value)); save(); });
    return node;
  }
  function button(label, callback, className = 'small secondary') { const node = element('button',className,label); node.type = 'button'; node.addEventListener('click',callback); return node; }
  function renderWords(name) {
    const list = $(name+'-list'); list.replaceChildren();
    if (!state[name].length) list.append(element('p','empty','Nothing recorded yet.'));
    state[name].forEach((value,index) => {
      const row = element('div','item-row');
      row.append(input(value,`${name} ${index+1}` ,text => { state[name][index] = text; },true),button('Remove',()=>{state[name].splice(index,1);save();renderWords(name);}));
      list.append(row);
    });
  }
  function renderChecks() {
    const list = $('checks-list'); list.replaceChildren();
    if (!state.checks.length) list.append(element('p','empty','No checks recorded yet.'));
    state.checks.forEach((item,index) => {
      const row = element('div','record-card');
      row.append(input(item.step,`Check ${index+1}`,value=>{item.step=value;},true));
      const label = element('label','','Status'); const select = element('select'); select.setAttribute('aria-label',`Status of check ${index+1}`);
      for (const [value,title] of [['suggested','Suggested, not tried'],['tried','I tried this'],['skipped','Skipped']]) { const option=element('option','',title);option.value=value;select.append(option); }
      select.value=item.status;select.addEventListener('change',()=>{item.status=select.value;save();});label.append(select);row.append(label);
      const outcomeLabel=element('label','','What happened?');outcomeLabel.append(input(item.outcome,`Outcome of check ${index+1}`,value=>{item.outcome=value;},true));row.append(outcomeLabel);
      row.append(button('Remove check',()=>{state.checks.splice(index,1);save();renderChecks();}));list.append(row);
    });
  }
  function renderSources() {
    const list = $('sources-list');list.replaceChildren();
    if (!state.sources.length) list.append(element('p','empty','No source links recorded yet.'));
    state.sources.forEach((item,index)=>{
      const row=element('div','record-card'); const link=element('a','source-link',item.title);link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';row.append(link);
      row.append(element('small','source-url',item.url));
      const label=element('label','','Source status');const select=element('select');select.setAttribute('aria-label',`Status of source ${index+1}`);
      for(const [value,title] of [['candidate','Candidate link'],['read','I read this page'],['user-confirmed','I checked it applies to my device']]){const option=element('option','',title);option.value=value;select.append(option);}
      select.value=item.status;select.addEventListener('change',()=>{item.status=select.value;save();});label.append(select);row.append(label);
      const noteLabel=element('label','','What does this page support?');noteLabel.append(input(item.note,`Note for source ${index+1}`,value=>{item.note=value;},true));row.append(noteLabel);
      row.append(button('Remove link',()=>{state.sources.splice(index,1);save();renderSources();}));list.append(row);
    });
  }
  function render(persist = true) {
    for (const [id,keyName] of [['goal','goal'],['device','device'],['environment','environment'],['next-step','nextStep']]) $(id).value=state[keyName];
    renderWords('observations');renderWords('questions');renderChecks();renderSources();
    if(persist)save();else{$('case-note').value=C.brief(state);$('case-markdown').value=C.markdown(state);}
  }
  for (const [id,keyName] of [['goal','goal'],['device','device'],['environment','environment'],['next-step','nextStep']]) $(id).addEventListener('input',()=>{state[keyName]=C.clean($(id).value);save();});
  for (const [singular,plural] of [['observation','observations'],['question','questions']]) $(''+singular+'-add').addEventListener('click',()=>{
    const field=$(singular+'-new'),value=C.clean(field.value);if(!value)return;state[plural].push(value);field.value='';save();renderWords(plural);
  });
  $('check-add').addEventListener('click',()=>{const value=C.clean($('check-new').value);if(!value)return;state.checks.push({step:value,outcome:'',status:'suggested'});$('check-new').value='';save();renderChecks();});
  $('source-add').addEventListener('click',()=>{
    const proposed={version:1,sources:[{url:$('source-url').value,title:$('source-title').value,status:'candidate'}]},valid=C.normalize(proposed).sources[0];
    if(!valid){status('Enter a complete http or https source link.');return;}
    if(state.sources.some(item=>item.url===valid.url)){status('This link is already in the case.');return;}
    state.sources.push(valid);$('source-url').value='';$('source-title').value='';save();renderSources();
  });
  function stage(raw) {
    let update;
    try{update=C.parsePacket(raw);}catch(error){status(error.message);return false;}
    if(!$('proposal').hidden && !window.confirm('Replace the update currently awaiting review?'))return false;
    const container=$('proposal-items');container.replaceChildren();
    const entries=[];
    function item(label,value,kind,field,index){
      const row=element('div','proposal-row');const toggle=element('input');toggle.type='checkbox';toggle.checked=true;toggle.setAttribute('aria-label',`Include ${label}`);
      const name=element('label','',label);const editor=input(value,label,()=>{},true);row.append(toggle,name,editor);
      if(kind==='text'&&state[field]&&state[field]!==value){
        toggle.checked=false;
        row.append(element('small','existing-value',`Already in your case: ${state[field]}`));
      }
      container.append(row);entries.push({toggle,editor,kind,field,index});
    }
    for(const [field,label] of [['goal','Goal'],['device','Device'],['environment','Environment'],['nextStep','Next step']])if(update[field])item(label,update[field],'text',field);
    for(const [field,label] of [['observations','Observation'],['questions','Open question']])update[field].forEach((value,index)=>item(label,value,'word',field,index));
    update.checks.forEach((value,index)=>{
      item('Check — confirm whether you tried it',value.step,'check','checks',index);
      const entry=entries[entries.length-1],row=entry.editor.parentElement;
      const select=element('select');select.setAttribute('aria-label',`Status of proposed check ${index+1}`);
      for(const [status,label] of [['suggested','Suggested, not tried'],['tried','I tried this'],['skipped','Skipped']]){const option=element('option','',label);option.value=status;select.append(option);}
      select.value='suggested';entry.status=select;row.append(select);
      const outcome=input(value.outcome||'',`Outcome of proposed check ${index+1}`,()=>{},true);outcome.placeholder='What happened, if you tried it?';entry.outcome=outcome;row.append(outcome);
    });
    update.sources.forEach((value,index)=>{
      item('Candidate source',value.title,'source','sources',index);
      const entry=entries[entries.length-1],row=entry.editor.parentElement;
      entry.url=input(value.url,`URL of proposed source ${index+1}`,()=>{});row.append(entry.url);
      entry.note=input(value.note||'',`What proposed source ${index+1} supports`,()=>{},true);row.append(entry.note);
    });
    $('proposal-accept').onclick=()=>{
      const selected=C.blank();
      for(const entry of entries){if(!entry.toggle.checked)continue;const value=C.clean(entry.editor.value);if(!value)continue;
        if(entry.kind==='text')selected[entry.field]=value;
        else if(entry.kind==='word')selected[entry.field].push(value);
        else if(entry.kind==='check')selected.checks.push({step:value,status:entry.status.value,outcome:entry.status.value==='tried'?C.clean(entry.outcome.value):''});
        else if(entry.kind==='source')selected.sources.push({title:value,url:entry.url.value,note:entry.note.value,status:'candidate'});
      }
      state=C.merge(state,selected);$('proposal').hidden=true;render();status('Selected suggestions were added. Review and edit the case whenever you like.');
    };
    $('proposal').hidden=false;$('proposal').scrollIntoView({behavior:'smooth',block:'start'});status('Guide update staged for review. Nothing has been added yet.');return true;
  }
  $('proposal-reject').addEventListener('click',()=>{$('proposal').hidden=true;$('proposal-items').replaceChildren();status('Guide update discarded.');});
  $('use-pasted').addEventListener('click',()=>{if(stage($('pasted').value))$('pasted').value='';});
  $('support-update-stage').addEventListener('click',()=>{
    $('support-update-input').dataset.accepted=stage($('support-update-input').value)?'1':'0';
    $('support-update-input').value='';
  });
  $('copy-brief').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(C.brief(state));status('Case note copied. Paste it into the guide.');}catch{status('Clipboard unavailable. Use Discuss this case to place the note, or copy it from the Markdown below.');}});
  $('case-markdown').addEventListener('input',()=>{emailEdited=true;});
  $('refresh-email').addEventListener('click',()=>{if(emailEdited&&!window.confirm('Replace edits to the email body with the current case?'))return;emailEdited=false;$('case-markdown').value=C.markdown(state);status('Email body refreshed from the case.');});
  function emailText(){return C.cleanBody($('case-markdown').value);}
  function compose(kind,subject,body){const to=encodeURIComponent(C.recipient),title=encodeURIComponent(subject),message=body?'&body='+encodeURIComponent(body):'';
    if(kind==='gmail')return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${title}${message}`;
    if(kind==='outlook')return `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${title}${message}`;
    return C.mailto(subject,body);
  }
  async function openEmail(kind){const body=emailText(),subject=C.subject(state);if(!body||!state.goal&&!state.device&&!state.observations.length&&!state.checks.length){status('Add at least the problem or device before preparing an email.');return;}
    const full=compose(kind,subject,body),long=full.length>1800,url=long?compose(kind,subject,''):full;
    if(long){
      try{await navigator.clipboard.writeText(body);}
      catch{status('The case is too long for an email link, and copying failed. Copy the email body above before opening a draft.');return;}
    }
    if(kind==='app')location.href=url;else window.open(url,'_blank','noopener');
    if(long)status('Full case copied. Paste it into the addressed email draft, then review and press Send.');
    else status('Check the recipient, subject, and full case in the draft. Press Send in your email service when ready.');
  }
  for(const [id,kind] of [['gmail','gmail'],['outlook','outlook'],['email-app','app']])$(id).addEventListener('click',()=>openEmail(kind));
  $('copy-email').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(`To: ${C.recipient}\nSubject: ${C.subject(state)}\n\n${emailText()}`);status('Full email copied. Paste and review it in your email service.');}catch{status('Clipboard unavailable. Select and copy the email body above.');}});
  function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type})),a=element('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  $('download-markdown').addEventListener('click',()=>download('device-support-case.md',C.markdown(state),'text/markdown;charset=utf-8'));
  $('download-json').addEventListener('click',()=>download('device-support-case.json',JSON.stringify(state,null,2),'application/json;charset=utf-8'));
  $('import-json').addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file)return;
    try{const raw=JSON.parse(await file.text());if(!C.isCaseFile(raw))throw Error('Unsupported case file');const next=C.normalize(raw);if(!window.confirm('Replace the current case with this saved case?'))return;state=next;emailEdited=false;render();status('Saved case restored.');}
    catch{status('This JSON file is not a supported device-support case. The current case was kept.');}finally{event.target.value='';}
  });
  $('clear-case').addEventListener('click',()=>{if(!window.confirm('Clear this case from this browser? Download it first if you want to keep it.'))return;state=C.blank();emailEdited=false;render();status('Case cleared.');});
  render(!restoreFailed);
})();

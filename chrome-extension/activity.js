(()=>{
  'use strict';
  const R=FieldworkRouting;if(!R.isSharePage(location.href))return;
  let enabled=true;const controls=new Map(),launchControls=new Map();
  const messages={
    'draft-ready':'Your note is in BoodleBox on the left. Review it, then press Send there.',
    'already-ready':'This note is already in the message box on the left. Review it, then press Send.',
    'draft-not-empty':'There is already a draft in BoodleBox. Send or clear that draft yourself, then try again.',
    'wrong-guide':'Open this activity’s matching guide in the left pane, then try again.',
    'no-chat':'Keep an open BoodleBox conversation beside this activity in Chrome split view, then try again.',
    'no-composer':'Open a conversation with this activity’s guide on the left, then try again.',
    'chat-not-ready':'BoodleBox is not ready for a new message yet. Try again when it finishes.',
    'disabled':'The companion extension is turned off. Turn it on, or use Copy note.',
    'check-draft':'Check the message box on the left. Placement was not confirmed. You can also use Copy note.',
    'pair-changed':'The paired pages changed. Check the guide on the left and try again.',
    'page-changed':'This activity changed. Review the current note and try again.',
    'rejected':'This note cannot be placed automatically. Use Copy note instead.',
    'failed':'The connection is unavailable. Reload both panes and try again, or use Copy note.'
  };
  const launchMessages={...messages,'routed':'The page is opening beside its guide.','starting-combo':'Opening the matching guide on the left, then the page on the right…','transition-busy':'The next activity is already opening. Check the guide on the left.','draft-not-empty':'There is an unfinished message in BoodleBox. Send or clear it before changing guides.','failed':'The pair could not finish opening. Check the guide on the left; you can use Start New Chat there if shown.'};
  async function launch(url,button,status){
    if(!enabled||button.disabled||!R.combo(url))return;
    button.disabled=true;status.textContent='Getting the page and guide ready…';
    try{const result=await chrome.runtime.sendMessage({type:'fieldwork-launch',url,sourceUrl:location.href});status.textContent=launchMessages[result?.status]||launchMessages.failed;
      // Ordinary website links still work when Chrome has no matching split chat.
      if(result?.status==='no-chat'&&button.tagName==='A'&&button.hasAttribute('data-fieldwork-combo'))location.assign(url);
    }
    catch{status.textContent=launchMessages.failed;}
    finally{button.disabled=false;}
  }
  function install(){
    document.documentElement.dataset.fieldworkCompanion=enabled?'0.6.0':'';
    document.documentElement.dataset.fieldworkLaunch=enabled?'1':'';
    for(const slot of document.querySelectorAll('[data-fieldwork-launch][data-activity-link]')){
      if(launchControls.has(slot))continue;
      const button=document.createElement('button');button.type='button';button.className='button primary';button.textContent=slot.dataset.launchLabel||'Start activity with guide →';
      const status=document.createElement('p');status.className='fw-note-status';status.setAttribute('role','status');slot.append(button,status);slot.hidden=!enabled;launchControls.set(slot,{button,status});
      button.addEventListener('click',event=>{if(event.isTrusted)launch(document.getElementById(slot.dataset.activityLink)?.href||location.href,button,status);});
    }
    for(const slot of document.querySelectorAll('[data-fieldwork-share]')){
      if(controls.has(slot))continue;
      const button=document.createElement('button');button.type='button';button.className='button primary fw-place-note';button.textContent='Put note in BoodleBox ←';
      const status=document.createElement('p');status.className='fw-note-status';status.setAttribute('role','status');
      slot.append(button,status);slot.hidden=!enabled;controls.set(slot,{button,status});
      button.addEventListener('click',async event=>{
        if(!event.isTrusted||!enabled||button.disabled)return;
        const note=document.getElementById(slot.dataset.noteId);
        if(!note||!note.getClientRects().length)return;
        const companion=slot.dataset.companion||(()=>{try{return decodeURIComponent(new URL(document.getElementById(slot.dataset.companionLink)?.href).pathname).split('@')[1];}catch{return '';}})();
        const message={type:'fieldwork-note',text:note.value,companion,sourceUrl:location.href};
        if(!R.validNote(message)){status.textContent=messages.rejected;return;}
        button.disabled=true;status.textContent='Placing your note in the chat on the left…';
        try{const result=await chrome.runtime.sendMessage(message);status.textContent=messages[result?.status]||messages.failed;}
        catch{status.textContent=messages.failed;}
        finally{button.disabled=false;}
      });
    }
  }
  chrome.storage.local.get({enabled:true}).then(s=>{enabled=s.enabled;install();});
  chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.enabled){enabled=changes.enabled.newValue!==false;for(const slot of [...controls.keys(),...launchControls.keys()])slot.hidden=!enabled;install();}});
  document.addEventListener('click',event=>{
    if(!enabled||!event.isTrusted||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    const link=event.target instanceof Element?event.target.closest('a[href]'):null,next=R.combo(location.href);
    if(!link)return;
    const destination=link.hasAttribute('data-fieldwork-combo')&&R.combo(link.href)?link.href:next&&R.profileAlias(link.href)===next.companion?location.href:null;
    if(!destination)return;
    event.preventDefault();event.stopImmediatePropagation();
    let status=link.parentElement.querySelector('.fw-launch-link-status');if(!status){status=document.createElement('p');status.className='fw-note-status fw-launch-link-status';status.setAttribute('role','status');link.after(status);}
    launch(destination,link,status);
  },true);
  new MutationObserver(install).observe(document.body,{childList:true,subtree:true});
})();

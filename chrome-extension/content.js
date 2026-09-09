(()=>{
  'use strict';
  const R=FieldworkRouting,buttons=new WeakMap();let enabled=true,scheduled=false;
  let placing=false;
  chrome.runtime.onMessage.addListener((message,sender,reply)=>{
    if(sender.id!==chrome.runtime.id||sender.tab||message?.type!=='fieldwork-place-draft')return;
    (async()=>{
      if(!enabled)return {status:'disabled'};
      if(placing)return {status:'chat-not-ready'};
      if(!R.validNote(message)||!R.isChat(location.href)||location.href!==message.chatUrl)return {status:'rejected'};
      const editors=[...document.querySelectorAll('[data-lexical-editor="true"][role="textbox"][contenteditable="true"]')].filter(e=>e.getClientRects().length&&/^Your prompt to /.test(e.getAttribute('aria-label')||''));
      if(editors.length!==1)return {status:'no-composer'};
      const editor=editors[0];
      if(editor.getAttribute('aria-label')!=='Your prompt to '+R.companions[message.companion])return {status:'wrong-guide'};
      const send=[...document.querySelectorAll('button[aria-label="Submit prompt"]')].find(e=>e.getClientRects().length);
      placing=true;
      try{
        const result=await FieldworkDraft.place({text:message.text,editor,send,insert:(el,text)=>{
          el.focus();const selection=window.getSelection(),range=document.createRange();range.selectNodeContents(el);range.collapse(false);selection.removeAllRanges();selection.addRange(range);
          // Lexical's paste handler preserves paragraph breaks; multiline insertText
          // flattens them in BoodleBox. This event does not touch the system clipboard.
          const data=new DataTransfer();data.setData('text/plain',text);
          el.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:data}));
        },wait:()=>new Promise(resolve=>setTimeout(resolve,180))});
        if(result.status==='draft-ready'||result.status==='already-ready')announce('Fieldwork note placed here. Review it, then press Send.');
        return result;
      }finally{placing=false;}
    })().then(reply).catch(()=>reply({status:'check-draft'}));
    return true;
  });
  chrome.storage.local.get({enabled:true}).then(s=>{enabled=s.enabled;scan();});
  chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.enabled){enabled=changes.enabled.newValue!==false;document.querySelectorAll('.fw-pane-copy').forEach(b=>b.hidden=!enabled);if(enabled)scan();}});
  function announce(message,url){
    document.getElementById('fw-pane-status')?.remove();
    const box=document.createElement('div');box.id='fw-pane-status';box.setAttribute('role','status');
    const text=document.createElement('span');text.textContent=message;box.append(text);
    if(url){const input=document.createElement('input');input.value=url;input.readOnly=true;input.setAttribute('aria-label','Fieldwork destination link');box.append(input);const open=document.createElement('a');open.href=url;open.target='_blank';open.rel='noopener noreferrer';open.dataset.fwFallback='1';open.textContent='Open in a new tab';box.append(open);}
    const dismiss=document.createElement('button');dismiss.textContent='×';dismiss.setAttribute('aria-label','Dismiss Fieldwork message');dismiss.onclick=()=>box.remove();box.append(dismiss);document.body.append(box);
    if(!url)setTimeout(()=>box.remove(),6500);
  }
  async function copy(href){const url=R.destination(href);if(!url)return;try{await navigator.clipboard.writeText(url);announce('Link copied. Click the website side, press Ctrl+L, paste, and press Enter.');}catch{announce('Select and copy this link, then paste it into the website side’s address bar.',url);}}
  function scan(){
    if(!enabled)return;
    document.querySelectorAll('a[href]').forEach(a=>{
      if(a.dataset.fwFallback||!R.destination(a.href)||buttons.get(a)?.isConnected)return;
      const b=document.createElement('button');b.type='button';b.className='fw-pane-copy';b.textContent='Copy link';b.title='Copy the destination for the website side';b.setAttribute('aria-label','Copy Fieldwork destination link');
      b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();copy(a.href);});a.after(b);buttons.set(a,b);
    });
  }
  new MutationObserver(()=>{if(!scheduled){scheduled=true;requestAnimationFrame(()=>{scheduled=false;scan();});}}).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',async e=>{
    if(!enabled||!e.isTrusted||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
    const a=e.target instanceof Element?e.target.closest('a[href]'):null;
    if(!a||a.dataset.fwFallback)return;const url=R.destination(a.href);if(!url)return;
    e.preventDefault();e.stopImmediatePropagation();
    try{const result=await chrome.runtime.sendMessage({type:'fieldwork-open',url});
      if(result?.status==='routed')announce('Opened in your paired activity pane.');
      else if(result?.status==='starting-combo')announce('Opening the next guide and its lesson in these two panes.');
      else if(result?.status==='draft-not-empty')announce('Send or clear your unfinished message before changing guides.');
      else if(result?.status==='transition-busy')announce('The next guide is already opening.');
      else if(result?.status==='opened-new')announce('No matching activity pane was available. Opened a new tab; Copy link lets you place it on the right.');
      else announce('The activity did not open. Copy the destination or open it in a new tab.',url);
    }catch{announce('Reload this BoodleBox page to reconnect the extension, or use this destination.',url);}
  },true);
  scan();
})();

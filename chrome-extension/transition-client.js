(()=>{
  'use strict';
  const R=FieldworkRouting,visible=el=>el.getClientRects().length>0;
  function guard(message){
    if(location.href!==message.chatUrl)return {status:'page-changed'};
    if(R.profileAlias(location.href))return {status:'safe-to-start'};
    if(!R.isChat(location.href))return {status:'chat-not-ready'};
    const editors=[...document.querySelectorAll('[data-lexical-editor="true"][role="textbox"]')].filter(el=>visible(el)&&/^Your prompt to /.test(el.getAttribute('aria-label')||''));
    if(editors.length!==1)return {status:'chat-not-ready'};
    const editor=editors[0];
    if(editor.getAttribute('aria-label')==='Your prompt to '+R.companions[message.companion])return {status:'same-guide'};
    const send=[...document.querySelectorAll('button[aria-label="Submit prompt"]')].find(visible);
    if(!send||editor.getAttribute('contenteditable')!=='true')return {status:'chat-not-ready'};
    if(FieldworkDraft.normalize(editor.innerText)||!send.disabled&&send.getAttribute('aria-disabled')!=='true')return {status:'draft-not-empty'};
    return {status:'safe-to-start'};
  }
  chrome.runtime.onMessage.addListener((message,sender,reply)=>{
    if(sender.id!==chrome.runtime.id||sender.tab||message?.type!=='fieldwork-transition-check')return;
    chrome.storage.local.get({enabled:true}).then(s=>reply(s.enabled?guard(message):{status:'disabled'})).catch(()=>reply({status:'failed'}));return true;
  });
  (async()=>{
    let job;try{job=await chrome.runtime.sendMessage({type:'fieldwork-transition-state',url:location.href});}catch{return;}
    if(job?.status!=='transition-pending')return;
    let busy=false,stopped=false,timer;
    const stop=()=>{stopped=true;clearTimeout(timer);observer.disconnect();};
    async function check(){
      if(stopped||busy)return;if(Date.now()>=job.expires){stop();return;}busy=true;
      try{
        const url=location.href;
        if(R.profileAlias(url)===job.companion&&job.phase==='profile'){
          const buttons=[...document.querySelectorAll('button')].filter(b=>visible(b)&&!b.disabled&&b.textContent.trim()==='Start New Chat');
          if(buttons.length===1){
            const result=await chrome.runtime.sendMessage({type:'fieldwork-transition-start',url,token:job.token});
            if(result?.status==='start-approved'&&location.href===url&&buttons[0].isConnected){job.phase='waiting-chat';buttons[0].click();}
            else if(result?.status!=='transition-busy')stop();
          }
        }else if(R.isChat(url)&&job.phase==='waiting-chat'){
          const editor=[...document.querySelectorAll('[data-lexical-editor="true"][role="textbox"]')].find(e=>visible(e)&&e.getAttribute('aria-label')==='Your prompt to '+R.companions[job.companion]);
          if(editor){
            const result=await chrome.runtime.sendMessage({type:'fieldwork-transition-ready',url,token:job.token,companion:job.companion});
            if(result?.status!=='transition-busy')stop();
          }
        }
      }catch{stop();}finally{busy=false;}
    }
    function schedule(){if(stopped||timer)return;timer=setTimeout(()=>{timer=null;check();},200);}
    const observer=new MutationObserver(schedule);observer.observe(document.body,{childList:true,subtree:true});
    setTimeout(stop,Math.max(0,job.expires-Date.now()));check();
  })();
})();

(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FieldworkConnectionUI=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function create({chrome,C,R,document,location,findEditor,isEnabled,place,onState,now=()=>Date.now()}){
    let bar,title,help,action,chatOnly,recheck,notice,state={status:'unavailable'},checked=0,route='',pending=null,sequence=0,signature='';
    const button=text=>{const b=document.createElement('button');b.type='button';b.textContent=text;return b;};
    function render(){
      if(!bar)return;const current=isEnabled()?state:{status:'disabled'},copy=C.describe(current),next=location.href+'|'+current.status+'|'+current.reason;
      if(signature===next)return;signature=next;
      title.textContent=copy.title;help.textContent=copy.help;bar.dataset.connectionState=current.status;
      action.textContent=current.status==='connected'?'Use the connected workspace':'Open workspace';
      action.disabled=current.status==='disabled';chatOnly.disabled=current.status==='disabled';recheck.disabled=current.status==='disabled';
      onState(current);
    }
    async function refresh(force=false){
      if(!findEditor()||!R.isChat(location.href)){if(bar)bar.hidden=true;return {status:'chat-unavailable'};}
      if(!isEnabled()){sequence++;pending=null;route='';checked=0;state={status:'disabled'};render();return state;}
      if(pending&&route===location.href)return pending;
      if(!force&&route===location.href&&now()-checked<15000)return state;
      route=location.href;const url=route,token=++sequence;checked=now();
      if(!C.fresh(state,now())){state={status:'unavailable'};render();}
      let timer;
      const request=Promise.race([chrome.runtime.sendMessage({type:'fieldwork-connection-state',chatUrl:url}),new Promise(resolve=>{timer=setTimeout(()=>resolve({status:'unavailable'}),3000);})]);
      pending=request.then(result=>{
        if(token!==sequence||location.href!==url||!findEditor())return {status:'changed'};
        state=isEnabled()?(result||{status:'unavailable'}):{status:'disabled'};render();return state;
      }).catch(()=>{if(token===sequence){state={status:'unavailable'};render();}return {status:'unavailable'};}).finally(()=>{clearTimeout(timer);if(token===sequence)pending=null;});
      return pending;
    }
    async function choose(mode){
      if(!isEnabled()||!findEditor())return;
      const url=location.href;let text;
      if(mode==='workspace'){
        const result=await refresh(true);text=C.note(result,now());
        if(!text){notice.textContent='The workspace connection was not confirmed. Keep planning in chat, or reconnect and check again.';return;}
      }else text=C.chatNote();
      if(location.href!==url||!isEnabled()||!findEditor())return;
      const result=await place(text,url);
      notice.textContent={
        'draft-ready':'Your choice is in the message box. Review it, then press Send to tell the guide. No message has been sent.',
        'already-ready':'Your choice is already in the message box. Review it, then press Send.',
        'draft-not-empty':'Your existing message or attachment is unchanged. Send or clear it yourself, then choose this option again.',
        'chat-not-ready':'Wait until the guide finishes, then choose this option again.',
        'page-changed':'The conversation changed. Make your choice again in the intended chat.'
      }[result?.status]||'Check the message box. Preparation was not confirmed; you can also tell the guide your choice in your own words.';
    }
    function scan(){
      const editor=findEditor();
      if(!editor||!R.isChat(location.href)){if(bar)bar.hidden=true;sequence++;route='';pending=null;state={status:'chat-unavailable'};onState(state);return;}
      if(!bar?.isConnected){
        bar=document.createElement('section');bar.id='fw-business-connection';bar.setAttribute('aria-label','Fieldwork workspace connection');
        title=document.createElement('strong');help=document.createElement('p');
        const controls=document.createElement('div');action=button('Open workspace');chatOnly=button('Keep planning in chat');recheck=button('Check again');
        notice=document.createElement('p');notice.setAttribute('role','status');notice.className='fw-connection-notice';
        controls.append(action,chatOnly,recheck);bar.append(title,help,controls,notice);editor.before(bar);signature='';
        action.addEventListener('click',async e=>{
          if(!e.isTrusted||action.disabled)return;
          action.disabled=true;
          try{
            if(state.status==='connected')await choose('workspace');
            else{
              const result=await chrome.runtime.sendMessage({type:'fieldwork-business-workspace-open',chatUrl:location.href});
              notice.textContent={
                'already-open':'The matching workspace is already beside this chat. Reload both pages after an extension update, then check again.',
                'opened-paired':'The workspace is opening beside this chat. Once connected, choose Use the connected workspace.',
                'opened-new':'The workspace opened in a new tab. Pair it with this conversation in Chrome split view, then check again.'
              }[result?.status]||'The workspace could not be opened. Keep planning in chat and try again when the connection is ready.';
              await refresh(true);
            }
          }catch{notice.textContent='The extension needs reconnecting. Reload this chat, or keep planning here.';}
          finally{action.disabled=!isEnabled();}
        });
        chatOnly.addEventListener('click',async e=>{if(!e.isTrusted||chatOnly.disabled)return;chatOnly.disabled=true;try{await choose('chat');}finally{chatOnly.disabled=!isEnabled();}});
        recheck.addEventListener('click',async e=>{if(!e.isTrusted||recheck.disabled)return;recheck.disabled=true;try{await refresh(true);}finally{recheck.disabled=!isEnabled();}});
      }
      if(bar.nextElementSibling!==editor)editor.before(bar);
      bar.hidden=false;render();refresh();
    }
    return {scan,refresh,choose,getState:()=>state};
  }
  return {create};
});

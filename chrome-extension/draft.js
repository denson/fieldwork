(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FieldworkDraft=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const normalize=text=>String(text||'').replace(/\r\n/g,'\n').replace(/\u200b/g,'').trim().replace(/\n{2,}/g,'\n');
  async function place({text,editor,send,insert,wait}){
    if(!editor)return {status:'no-composer'};
    const existing=normalize(editor.innerText);
    if(existing)return {status:existing===normalize(text)?'already-ready':'draft-not-empty'};
    if(!send)return {status:'chat-not-ready'};
    // An enabled Send button with no visible text can mean an attached draft.
    if(!send.disabled&&send.getAttribute('aria-disabled')!=='true')return {status:'draft-not-empty'};
    if(editor.getAttribute('contenteditable')!=='true'||editor.getAttribute('aria-disabled')==='true')return {status:'chat-not-ready'};
    insert(editor,text);
    await wait();
    // A DOM update alone is insufficient: the app must also enable its send control.
    if(normalize(editor.innerText)!==normalize(text)||!send||send.disabled||send.getAttribute('aria-disabled')==='true')return {status:'check-draft'};
    return {status:'draft-ready'};
  }
  return {normalize,place};
});

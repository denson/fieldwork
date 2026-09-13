(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FieldworkConnection=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const protocol='fieldwork-connection-v1',workspace='https://denson.github.io/fieldwork/?demo=business&step=idea';
  const steps=['idea','customer','offer','rules','numbers','test','review'];
  async function check({chrome,R,sourceId,chatUrl,now=()=>new Date().toISOString()}){
    try{
      if(!R.isChat(chatUrl))return {status:'unavailable'};
      if(!(await chrome.storage.local.get({enabled:true})).enabled)return {status:'disabled'};
      const source=await chrome.tabs.get(sourceId);
      if(source.url!==chatUrl||source.pendingUrl&&source.pendingUrl!==source.url)return {status:'changed'};
      const chat=await chrome.tabs.sendMessage(sourceId,{type:'fieldwork-business-chat-probe',chatUrl},{frameId:0});
      if(chat?.status!=='chat-ready'||chat.protocol!==protocol)return {status:'chat-unavailable'};
      const peers=await chrome.tabs.query({windowId:source.windowId}),pair=R.paired(source,peers);
      if(pair.tabId===undefined)return {status:'unconnected',reason:pair.reason};
      const target=peers.find(t=>t.id===pair.tabId);
      if(R.combo(target.url)?.companion!=='BusinessPlanFirstSteps')return {status:'unconnected',reason:'wrong-workspace'};
      let activity;
      try{activity=await chrome.tabs.sendMessage(target.id,{type:'fieldwork-business-workspace-probe',workspaceUrl:target.url},{frameId:0});}catch{return {status:'unconnected',reason:'reload-workspace'};}
      if(activity?.status!=='workspace-ready'||activity.protocol!==protocol)return {status:'unconnected',reason:'reload-workspace'};
      const [freshSource,freshTarget,settings]=await Promise.all([chrome.tabs.get(source.id),chrome.tabs.get(target.id),chrome.storage.local.get({enabled:true})]);
      if(!settings.enabled)return {status:'disabled'};
      if(freshSource.url!==source.url||freshTarget.url!==target.url||R.paired(freshSource,[freshSource,freshTarget]).tabId!==target.id)return {status:'changed'};
      const again=await chrome.tabs.sendMessage(source.id,{type:'fieldwork-business-chat-probe',chatUrl},{frameId:0});
      if(again?.status!=='chat-ready'||again.protocol!==protocol)return {status:'chat-unavailable'};
      return {status:'connected',protocol,extensionVersion:chrome.runtime.getManifest().version,checkedAt:now(),step:steps.includes(activity.step)?activity.step:'idea'};
    }catch{return {status:'unavailable'};}
  }
  function fresh(state,now=Date.now()){
    if(state?.status!=='connected'||state.protocol!==protocol)return false;
    const age=now-Date.parse(state.checkedAt);return Number.isFinite(age)&&age>=-1000&&age<=30000;
  }
  function note(state,now=Date.now()){
    if(!fresh(state,now))return null;
    const version=/^\d+\.\d+\.\d+$/.test(state.extensionVersion)?state.extensionVersion:'unknown';
    return `FIELDWORK CONNECTION — Business Plan First Steps\nRequested experience: connected workspace.\nExtension: Fieldwork Companion Pane ${version}, enabled.\nStatus: matching business-plan workspace connected to this chat in Chrome split view.\nAvailable controls: Use this draft; Put note in BoodleBox.\nChecked at: ${state.checkedAt}\n\nI choose to use the connected workspace. Continue from our latest shared plan. You still cannot see unshared website answers. Give a draft card for the relevant step when useful; I will review it and choose Use this draft myself. This is the last connection check, not a live view or confirmation that anything was saved.`;
  }
  function chatNote(){return 'FIELDWORK CONNECTION — Business Plan First Steps\nRequested experience: chat only.\n\nKeep our latest shared plan and continue entirely in this chat. Stop website directions and draft-transfer blocks unless I choose the website again.';}
  async function open({chrome,R,sourceId,chatUrl}){
    try{
      if(!R.isChat(chatUrl)||!(await chrome.storage.local.get({enabled:true})).enabled)return {status:'unavailable'};
      const source=await chrome.tabs.get(sourceId);
      if(source.url!==chatUrl||source.pendingUrl&&source.pendingUrl!==source.url)return {status:'changed'};
      const ready=await chrome.tabs.sendMessage(source.id,{type:'fieldwork-business-chat-probe',chatUrl},{frameId:0});
      if(ready?.status!=='chat-ready'||ready.protocol!==protocol)return {status:'chat-unavailable'};
      const peers=await chrome.tabs.query({windowId:source.windowId}),pair=R.paired(source,peers),target=peers.find(t=>t.id===pair.tabId);
      if(target&&R.combo(target.url)?.companion==='BusinessPlanFirstSteps')return {status:'already-open'};
      const freshSource=await chrome.tabs.get(source.id);
      if(freshSource.url!==chatUrl||freshSource.pendingUrl&&freshSource.pendingUrl!==freshSource.url||!(await chrome.storage.local.get({enabled:true})).enabled)return {status:'changed'};
      if(target&&R.isBlankPane(target.url)){
        const freshTarget=await chrome.tabs.get(target.id);
        if(freshTarget.url!==target.url||R.paired(freshSource,[freshSource,freshTarget]).tabId!==target.id)return {status:'changed'};
        await chrome.tabs.update(target.id,{url:workspace});return {status:'opened-paired'};
      }
      await chrome.tabs.create({url:workspace,openerTabId:source.id,active:true});return {status:'opened-new'};
    }catch{return {status:'unavailable'};}
  }
  function describe(state){
    if(state?.status==='connected')return {title:'Workspace connected',help:'The extension and matching workspace responded. You can keep planning in chat or tell the guide to use the workspace.'};
    if(state?.status==='disabled')return {title:'Companion extension turned off',help:'Keep planning in chat. Turn the companion on in its Chrome popup to connect the workspace.'};
    if(state?.reason==='reload-workspace')return {title:'Workspace needs reconnecting',help:'Reload the workspace and this chat after updating the extension, then check again. Your chat can continue normally.'};
    if(state?.status==='unavailable'||state?.status==='changed'||state?.status==='chat-unavailable')return {title:'Connection not confirmed',help:'Check the matching pages in Chrome split view, then check again. Reload this chat if the extension was updated.'};
    return {title:'Extension active · workspace not connected',help:'Open the Business Plan workspace, then pair it with this conversation in Chrome split view. Other pages will not be replaced.'};
  }
  return {protocol,workspace,check,fresh,note,chatNote,describe,open};
});

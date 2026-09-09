importScripts('routing.js','transition.js');
const R=FieldworkRouting;
const transitions=FieldworkTransition.create({chrome,R});
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
  if(!message||sender.frameId!==0||!sender.tab)return;
  if(['fieldwork-transition-state','fieldwork-transition-start','fieldwork-transition-ready'].includes(message.type)&&R.isBoodle(sender.url)){
    transitions.resume(message,sender).then(reply).catch(()=>reply({status:'failed'}));return true;
  }
  const isOpen=message.type==='fieldwork-open'&&R.isBoodle(sender.url);
  const isNote=message.type==='fieldwork-note'&&R.isSharePage(sender.url);
  const isLaunch=message.type==='fieldwork-launch'&&R.isSharePage(sender.url);
  if(!isOpen&&!isNote&&!isLaunch)return;
  (async()=>{
    const url=isOpen||isLaunch?R.destination(message.url):null;
    if(isOpen?!url:isLaunch?!R.combo(url):!R.validNote(message))return {status:'rejected'};
    const settings=await chrome.storage.local.get({enabled:true});if(!settings.enabled)return {status:'disabled'};
    const source=await chrome.tabs.get(sender.tab.id);
    if(isLaunch){
      if(source.url!==message.sourceUrl||!R.isSharePage(source.url)||new URL(source.url).origin!==new URL(sender.url).origin)return {status:'page-changed'};
      const peers=await chrome.tabs.query({windowId:source.windowId});
      const pair=R.pairedChat(source,peers);if(pair.tabId===undefined)return {status:'no-chat'};
      return transitions.start({boodle:peers.find(t=>t.id===pair.tabId),activity:source,url});
    }
    if(isNote){
      // MessageSender.url can retain the document's original URL after pushState.
      // Compare the click's current URL with Chrome's current tab instead.
      if(source.url!==message.sourceUrl||!R.isSharePage(source.url)||new URL(source.url).origin!==new URL(sender.url).origin)return {status:'page-changed'};
      const peers=await chrome.tabs.query({windowId:source.windowId});
      const pair=R.pairedChat(source,peers);
      if(pair.tabId===undefined)return {status:'no-chat',reason:pair.reason};
      const target=peers.find(t=>t.id===pair.tabId);
      const [freshSource,freshTarget]=await Promise.all([chrome.tabs.get(source.id),chrome.tabs.get(pair.tabId)]);
      if(freshSource.url!==source.url||freshTarget.url!==target.url||R.pairedChat(freshSource,[freshSource,freshTarget]).tabId!==pair.tabId)return {status:'pair-changed'};
      // Deliver only to the paired chat's top frame. Never submit, open a new chat,
      // store notes, or select a different conversation on the learner's behalf.
      return await chrome.tabs.sendMessage(pair.tabId,{type:'fieldwork-place-draft',text:message.text,companion:message.companion,chatUrl:freshTarget.url},{frameId:0});
    }
    if(!R.isBoodle(source.url))return {status:'rejected'};
    const peers=await chrome.tabs.query({windowId:source.windowId});
    const pair=R.paired(source,peers);
    if(pair.tabId!==undefined){
      if(R.combo(url)&&R.isChat(source.url))return transitions.start({boodle:source,activity:peers.find(t=>t.id===pair.tabId),url});
      // Recheck both tabs after discovery; split membership may have changed.
      const [freshSource,freshTarget]=await Promise.all([chrome.tabs.get(source.id),chrome.tabs.get(pair.tabId)]);
      const fresh=R.paired(freshSource,[freshSource,freshTarget]);
      if(freshSource.url===source.url&&freshTarget.url===peers.find(t=>t.id===pair.tabId).url&&fresh.tabId===pair.tabId){await chrome.tabs.update(pair.tabId,{url});return {status:'routed'};}
      return {status:'pair-changed'};
    }
    if(pair.reason==='page-changing')return {status:'pair-changed'};
    // A deliberate click can still open the activity; never replace an unrelated page.
    await chrome.tabs.create({url,openerTabId:source.id,active:true});
    return {status:'opened-new',reason:pair.reason||'pair-changed'};
  })().then(reply).catch(()=>reply({status:'failed'}));
  return true;
});

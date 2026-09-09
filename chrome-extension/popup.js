(async()=>{
  const toggle=document.getElementById('enabled'),status=document.getElementById('status'),R=FieldworkRouting;
  const saved=await chrome.storage.local.get({enabled:true});toggle.checked=saved.enabled;
  toggle.addEventListener('change',()=>chrome.storage.local.set({enabled:toggle.checked}));
  try{const tabs=await chrome.tabs.query({currentWindow:true}),active=tabs.find(t=>t.active);
    const source=R.isBoodle(active?.url)?active:tabs.find(t=>R.isBoodle(t.url)&&Number.isInteger(active?.splitViewId)&&active.splitViewId>=0&&t.splitViewId===active.splitViewId);
    const result=R.paired(source,tabs);status.textContent=result.tabId!==undefined?'Ready: BoodleBox has a paired activity pane.':'Pair BoodleBox with a Fieldwork activity in Chrome split view. Other websites will not be replaced.';
  }catch{status.textContent='Open BoodleBox beside a Fieldwork activity, then check again.';}
})();

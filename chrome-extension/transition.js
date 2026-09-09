(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FieldworkTransition=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function create({chrome,R,now=Date.now,token=()=>crypto.randomUUID()}){
    const prefix='fieldwork-transition:',locks=new Set(),key=id=>prefix+id;
    const read=async id=>(await chrome.storage.session.get(key(id)))[key(id)];
    const save=job=>chrome.storage.session.set({[key(job.boodleId)]:job});
    const forget=id=>chrome.storage.session.remove(key(id));
    const paired=(chat,activity)=>R.paired(chat,[chat,activity]).tabId===activity.id;
    async function start({boodle,activity,url}){
      const next=R.combo(url);if(!next||!(R.isSharePage(activity.url)||R.isBlankPane(activity.url))||!paired(boodle,activity))return {status:'no-chat'};
      if(locks.has(boodle.id))return {status:'transition-busy'};
      locks.add(boodle.id);
      try{
        const pending=await read(boodle.id);if(pending&&pending.expires>now())return {status:'transition-busy'};
        if(pending)await forget(boodle.id);
        const guard=await chrome.tabs.sendMessage(boodle.id,{type:'fieldwork-transition-check',chatUrl:boodle.url,companion:next.companion},{frameId:0});
        if(!['safe-to-start','same-guide'].includes(guard?.status))return guard||{status:'chat-not-ready'};
        const [left,right]=await Promise.all([chrome.tabs.get(boodle.id),chrome.tabs.get(activity.id)]);
        if(left.url!==boodle.url||right.url!==activity.url||left.pendingUrl&&left.pendingUrl!==left.url||right.pendingUrl&&right.pendingUrl!==right.url||!paired(left,right))return {status:'pair-changed'};
        if(guard.status==='same-guide'){await chrome.tabs.update(right.id,{url:next.url});return {status:'routed'};}
        const job={boodleId:left.id,activityId:right.id,oldChatUrl:left.url,activityUrl:right.url,...next,token:token(),expires:now()+60000,phase:'profile'};
        await save(job);
        try{await chrome.tabs.update(left.id,{url:job.profileUrl});}catch(error){await forget(left.id);throw error;}
        return {status:'starting-combo'};
      }finally{locks.delete(boodle.id);}
    }
    async function resume(message,sender){
      const id=sender.tab.id;if(locks.has(id))return {status:'transition-busy'};
      locks.add(id);
      try{
        const job=await read(id);if(!job)return {status:'no-transition'};
        if(job.expires<=now()){await forget(id);return {status:'transition-expired'};}
        const settings=await chrome.storage.local.get({enabled:true});
        if(!settings.enabled){await forget(id);return {status:'disabled'};}
        const [left,right]=await Promise.all([chrome.tabs.get(id),chrome.tabs.get(job.activityId)]);
        if(left.url!==message.url||right.url!==job.activityUrl||left.pendingUrl&&left.pendingUrl!==left.url||right.pendingUrl&&right.pendingUrl!==right.url||!paired(left,right)){await forget(id);return {status:'pair-changed'};}
        const atProfile=R.profileAlias(left.url)===job.companion,atNewChat=R.isChat(left.url)&&left.url!==job.oldChatUrl;
        if(!(atProfile||job.phase==='waiting-chat'&&atNewChat)){await forget(id);return {status:'page-changed'};}
        if(message.type==='fieldwork-transition-state')return {status:'transition-pending',token:job.token,companion:job.companion,phase:job.phase,expires:job.expires};
        if(message.token!==job.token)return {status:'rejected'};
        if(message.type==='fieldwork-transition-start'&&atProfile&&job.phase==='profile'){
          job.phase='waiting-chat';await save(job);return {status:'start-approved'};
        }
        if(message.type==='fieldwork-transition-ready'&&atNewChat&&job.phase==='waiting-chat'&&message.companion===job.companion){
          await chrome.tabs.update(job.activityId,{url:job.url});await forget(id);return {status:'combo-ready'};
        }
        return {status:'rejected'};
      }finally{locks.delete(id);}
    }
    return {start,resume};
  }
  return {create};
});

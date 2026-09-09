(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./start-core.js'):root.FirstSteps);if(typeof module==='object'&&module.exports)module.exports=api;else root.FirstHandoff=api;})(typeof globalThis!=='undefined'?globalThis:this,function(F){
  'use strict';
  const key=s=>F.valid(s)?[s.pass,s.badge,s.topic].join(':'):'';
  function connect({id,createChannel,getState,canReceive,onReceive,discoveryMs=900,ackMs=2000}){
    let channel;try{channel=createChannel('fieldwork-first-steps-return-v1');}catch{return {offer:async()=>({status:'unavailable'}),close(){}};}
    const grants=new Map();let pending=null,serial=0;
    const send=m=>{try{channel.postMessage({...m,from:id});return true;}catch{return false;}};
    const finish=result=>{if(!pending)return;clearTimeout(pending.timer);const resolve=pending.resolve;pending=null;resolve(result);};
    channel.onmessage=async e=>{
      const m=e.data;if(!m||typeof m!=='object'||typeof m.from!=='string'||m.from===id||typeof m.request!=='string')return;
      for(const [k,g]of grants)if(g.expires<Date.now())grants.delete(k);
      if(m.type==='find'&&F.valid(m.state)&&m.state.step==='return'&&canReceive()&&key(getState())===key(m.state)){
        if(grants.size>=32)return;
        grants.set(m.request,{from:m.from,key:key(m.state),expires:Date.now()+10000});send({type:'ready',to:m.from,request:m.request});
      }else if(m.type==='ready'&&m.to===id&&pending?.request===m.request&&pending.phase==='find')pending.candidates.add(m.from);
      else if(m.type==='apply'&&m.to===id){
        const g=grants.get(m.request);grants.delete(m.request);
        if(!g||g.from!==m.from||g.expires<Date.now()||!F.valid(m.state)||m.state.step!=='return'||g.key!==key(m.state)||!canReceive()||key(getState())!==g.key)return;
        try{if(await onReceive(m.state)!==false)send({type:'applied',to:m.from,request:m.request});}catch{/* No acknowledgement means no success claim. */}
      }else if(m.type==='applied'&&m.to===id&&pending?.request===m.request&&pending.phase==='apply'&&pending.target===m.from)finish({status:'applied'});
    };
    return {
      offer(state){
        if(pending||!F.valid(state)||state.step!=='return')return Promise.resolve({status:'unavailable'});
        return new Promise(resolve=>{
          const request=id+':'+(++serial);pending={request,resolve,candidates:new Set(),phase:'find'};
          pending.timer=setTimeout(()=>{
            if(pending.candidates.size!==1){finish({status:pending.candidates.size?'ambiguous':'missing'});return;}
            pending.phase='apply';pending.target=[...pending.candidates][0];pending.timer=setTimeout(()=>finish({status:'unconfirmed'}),ackMs);
            if(!send({type:'apply',to:pending.target,request,state:{pass:state.pass,badge:state.badge,topic:state.topic,step:'return'}}))finish({status:'unavailable'});
          },discoveryMs);
          if(!send({type:'find',request,state:{pass:state.pass,badge:state.badge,topic:state.topic,step:'return'}}))finish({status:'unavailable'});
        });
      },
      close(){finish({status:'unavailable'});grants.clear();channel.close();}
    };
  }
  return {connect};
});

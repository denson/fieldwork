(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FieldworkRegistryService=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function create({chrome,R,fetcher=fetch,now=Date.now}){
    let current=null,lastCheck=0,inflight=null;
    async function load(){
      if(current&&now()-lastCheck<30000)return current;
      if(inflight)return inflight;
      inflight=(async()=>{
        try{
          const response=await fetcher(R.registryURL,{cache:'no-store'});
          if(!response.ok)throw new Error('Registry unavailable');
          const data=await response.json();
          if(!R.setRegistry(data))throw new Error('Invalid pairing registry');
          current=data;lastCheck=now();
          await chrome.storage.local.set({fieldworkPairingRegistry:data});
          return current;
        }catch{
          if(current)return current;
          const saved=(await chrome.storage.local.get('fieldworkPairingRegistry')).fieldworkPairingRegistry;
          if(saved&&R.setRegistry(saved)){current=saved;return current;}
          throw new Error('Pairing registry unavailable');
        }finally{inflight=null;}
      })();
      return inflight;
    }
    return {load};
  }
  return {create};
});

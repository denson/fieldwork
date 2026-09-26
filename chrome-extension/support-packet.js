(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FieldworkSupportPacket=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const protocol='fieldwork-support-case-v1';
  function parse(raw){
    if(typeof raw!=='string'||raw.length>18000)return null;
    const fenced=raw.match(/```fieldwork-support-case-v1\s*\n([\s\S]*?)\n```/i),text=fenced?fenced[1]:raw.trim();
    let data;try{data=JSON.parse(text);}catch{return null;}
    return valid(data)?data:null;
  }
  function valid(data){
    if(!data||typeof data!=='object'||Array.isArray(data)||data.fieldwork!==protocol||data.version!==1||data.updateType!=='proposal')return false;
    const scalar=['goal','device','environment','nextStep'];
    if(scalar.some(key=>data[key]!==undefined&&(typeof data[key]!=='string'||data[key].length>2000)))return false;
    for(const key of ['observations','questions'])if(data[key]!==undefined&&(!Array.isArray(data[key])||data[key].length>30||data[key].some(x=>typeof x!=='string'||x.length>2000)))return false;
    if(data.checks!==undefined&&(!Array.isArray(data.checks)||data.checks.length>30||data.checks.some(x=>!x||typeof x.step!=='string'||x.step.length>2000)))return false;
    if(data.sources!==undefined&&(!Array.isArray(data.sources)||data.sources.length>20||data.sources.some(x=>{if(!x||typeof x.url!=='string'||x.url.length>2000)return true;try{const u=new URL(x.url);return !['http:','https:'].includes(u.protocol)||!!u.username||!!u.password;}catch{return true;}})))return false;
    return scalar.some(key=>data[key]?.trim())||['observations','questions','checks','sources'].some(key=>data[key]?.length);
  }
  return {protocol,parse,valid};
});

(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FieldworkSupportPacket=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const protocol='fieldwork-support-case-v1';
  function note(raw){
    const lines=raw.replace(/\r/g,'').split('\n'),start=lines.findIndex(line=>/^\s*\*{0,2}Case note for review\*{0,2}\s*$/i.test(line));
    if(start<0)return null;
    const data={fieldwork:protocol,version:1,updateType:'proposal',observations:[],checks:[],sources:[],questions:[]};
    for(const line of lines.slice(start+1)){
      const match=line.match(/^\s*[-*•]\s+(?:\*\*)?([A-Za-z ]+):(?:\*\*)?\s*(.+?)\s*$/);
      if(!match){if(line.trim())break;continue;}
      const label=match[1].toLowerCase(),value=match[2].trim();if(!value)continue;
      if(label==='goal')data.goal=value;
      else if(label==='device')data.device=value;
      else if(label==='environment')data.environment=value;
      else if(label==='observed')data.observations.push(value);
      else if(label==='open question')data.questions.push(value);
      else if(label==='next step')data.nextStep=value;
      else if(label==='suggested check')data.checks.push({step:value,status:'suggested',outcome:''});
      else if(label==='tried check'){
        const parts=value.split(/\s+[—–-]\s+Result:\s*/i);data.checks.push({step:parts[0],status:'tried',outcome:parts[1]||''});
      }else if(label==='source to check'){
        const url=value.match(/https?:\/\/[^\s)<>]+/i)?.[0];
        if(url)data.sources.push({title:'Source to check',url,note:value.replace(url,'').replace(/^[\s\[\]()—–-]+|[\s\[\]()—–-]+$/g,''),status:'candidate'});
      }
    }
    return valid(data)?data:null;
  }
  function parse(raw){
    if(typeof raw!=='string'||raw.length>18000)return null;
    const fenced=raw.match(/```fieldwork-support-case-v1\s*\n([\s\S]*?)\n```/i),text=fenced?fenced[1]:raw.trim();
    let data;try{data=JSON.parse(text);}catch{return note(raw);}
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

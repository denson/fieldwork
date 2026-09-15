(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FieldworkBusinessDraft=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const marker='business-plan-draft-v1';
  const fieldsByStep={
    idea:['name','idea'],
    customer:['customer','problem','evidence'],
    offer:['offer','alternative','reach','delivery','resources'],
    rules:['checks','verifier','impact'],
    numbers:['unit','price','variable','fixed','sales','capacity','startup','ownerPay'],
    test:['test','success','next','question']
  };
  const labels={name:'Working business name',idea:'What you will offer',customer:'First customer group',problem:'Problem worth solving',evidence:'What you know and how you know it',offer:'One thing a customer can buy',alternative:'What customers do today / why choose you',reach:'How you will reach the first customers',delivery:'How you will deliver the work',resources:'People, equipment and requirements to check',checks:'Things to verify before launch',verifier:'Who can help you check',impact:'What this changes in your plan',unit:'One sale means',price:'Price per sale',variable:'Cost per sale',fixed:'Monthly fixed costs',sales:'Expected sales per month',capacity:'Sales you could deliver per month',startup:'One-time startup costs',ownerPay:'Desired monthly owner pay',test:'First real-world test',success:'What result would justify another step',next:'Next action and when',question:'Question for an adviser'};
  const numberKeys=new Set(['price','variable','fixed','sales','capacity','startup','ownerPay']);
  function normalize(input){
    if(!input||input.fieldwork!==marker||!Object.hasOwn(fieldsByStep,input.step)||!input.fields||typeof input.fields!=='object'||Array.isArray(input.fields))return null;
    const allowed=new Set(fieldsByStep[input.step]),fields={};
    for(const [key,value] of Object.entries(input.fields)){
      if(!allowed.has(key)||typeof value!=='string')return null;
      const clean=value.trim();if(!clean||clean.length>(numberKeys.has(key)?18:500))return null;
      if(numberKeys.has(key)&&(!/^\d+(\.\d{1,2})?$/.test(clean)||Number(clean)>1000000||(['sales','capacity'].includes(key)&&!Number.isInteger(Number(clean)))))return null;
      fields[key]=clean;
    }
    if(!Object.keys(fields).length)return null;
    return {fieldwork:marker,step:input.step,fields};
  }
  function parse(text){if(typeof text!=='string'||text.length>6000)return null;try{return normalize(JSON.parse(text.trim()));}catch{return null;}}
  function valid(message){return !!normalize(message);}
  const revisionMarker='business-plan-revision-v1';
  function normalizeRevision(input){
    if(!input||input.fieldwork!==revisionMarker||!input.plan||typeof input.plan!=='object'||Array.isArray(input.plan))return null;
    const p=input.plan,plan={},keys=Object.keys(labels);
    if(Object.keys(p).some(k=>!keys.includes(k)&&k!=='gapReview'))return null;
    for(const k of keys){
      if(typeof p[k]!=='string'||p[k].length>(numberKeys.has(k)?18:500))return null;
      const value=p[k].trim();
      if(numberKeys.has(k)&&value&&(!/^\d+(\.\d{1,2})?$/.test(value)||Number(value)>1000000||(['sales','capacity'].includes(k)&&!Number.isInteger(Number(value)))))return null;
      plan[k]=value;
    }
    if(!plan.name||!plan.idea)return null;
    if(p.gapReview!==undefined){
      if(!p.gapReview||typeof p.gapReview!=='object'||Array.isArray(p.gapReview))return null;
      plan.gapReview={};
      for(const [k,v] of Object.entries(p.gapReview)){
        if(!['demand','operations','costs','cash','requirements','milestones'].includes(k)||!v||typeof v.note!=='string'||v.note.length>1000)return null;
        plan.gapReview[k]={note:v.note,status:'open'};
      }
    }
    return {fieldwork:revisionMarker,plan};
  }
  function parseRevision(text){if(typeof text!=='string'||text.length>26000)return null;try{return normalizeRevision(JSON.parse(text.trim()));}catch{return null;}}
  return {marker,fieldsByStep,labels,normalize,parse,valid,revisionMarker,normalizeRevision,parseRevision};
});

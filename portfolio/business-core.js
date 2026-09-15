(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FieldworkBusinessCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const version='2026-09-13.2';
  const steps=['idea','customer','offer','rules','numbers','test','review'];
  const labels={name:'Working business name',idea:'What you will offer',customer:'First customer group',problem:'Problem worth solving',evidence:'What you know and how you know it',offer:'One thing a customer can buy',alternative:'What customers do today / why choose you',reach:'How you will reach the first customers',delivery:'How you will deliver the work',resources:'People, equipment and requirements to check',checks:'Things to verify before launch',verifier:'Who can help you check',impact:'What this changes in your plan',unit:'One sale means',price:'Price per sale',variable:'Cost per sale',fixed:'Monthly fixed costs',sales:'Expected sales per month',capacity:'Sales you could deliver per month',startup:'One-time startup costs',ownerPay:'Desired monthly owner pay',test:'First real-world test',success:'What result would justify another step',next:'Next action and when',question:'Question for an adviser'};
  const numberKeys=['price','variable','fixed','sales','capacity','startup','ownerPay'];
  const optionalKeys=['capacity','startup','ownerPay'];
  const requiredByStep={idea:['name','idea'],customer:['customer','problem','evidence'],offer:['offer','alternative','reach','delivery','resources'],rules:['checks','verifier','impact'],numbers:['unit','price','variable','fixed','sales'],test:['test','success','next','question']};
  const sections=[
    {title:'Business idea',keys:['name','idea']},
    {title:'Customer and need',keys:['customer','problem','evidence']},
    {title:'Offer and delivery',keys:['offer','alternative','reach','delivery','resources']},
    {title:'Licenses, safety, and rules',keys:['checks','verifier','impact']},
    {title:'Monthly model inputs',keys:['unit','price','variable','fixed','sales','capacity','startup','ownerPay']},
    {title:'Next test',keys:['test','success','next','question']}
  ];
  const library=typeof module==='object'&&module.exports?require('./business-examples.js'):globalThis.FieldworkBusinessExamples;
  const examples=library.examples;
  const example=examples.yard.plan;
  function cleanPlan(raw={}){const p={};for(const k of Object.keys(labels))p[k]=typeof raw[k]==='string'?raw[k].slice(0,numberKeys.includes(k)?18:500):'';if(raw.exampleKey===''||(typeof raw.exampleKey==='string'&&Object.hasOwn(examples,raw.exampleKey)))p.exampleKey=raw.exampleKey;if(raw.gapReview&&typeof raw.gapReview==='object'){p.gapReview={};for(const key of Object.keys(library.gapTopics)){const item=raw.gapReview[key];if(!item||typeof item!=='object')continue;const note=typeof item.note==='string'?item.note.slice(0,1000):'';p.gapReview[key]={note,status:item.status==='recorded'&&note.trim()?'recorded':'open'};}}return p;}
  // Preserve the chosen teaching example independently of edits to the business name.
  // Older drafts have no marker; recognize only a known name or exact example idea.
  function exampleKeyForPlan(plan={}){
    if(plan.exampleKey==='')return '';
    if(typeof plan.exampleKey==='string'&&Object.hasOwn(examples,plan.exampleKey))return plan.exampleKey;
    const name=String(plan.name||'').trim().toLowerCase().replace(/\s*[—–-]\s*fictional example$/,'');
    return Object.keys(examples).find(key=>name===examples[key].plan.name.split(' — ')[0].toLowerCase()||(!!plan.idea&&plan.idea===examples[key].plan.idea))||'';
  }
  const tipTitles={idea:'Small and specific is useful.',customer:'Start with a real customer situation.',offer:'Define the edges of the offer.',rules:'Turn unknowns into things to verify.',numbers:'Count the whole job.',test:'Look for behavior, not just compliments.'};
  const tips={
    property:{
      idea:'SafeStart helps owners investigate lead paint and asbestos before renovation. Its proposed work includes lead-paint measurements, suspected asbestos samples for accredited laboratory analysis, office review of lead readings, and a formal report after review and laboratory results. That gives the plan a clear purpose and a defined result for the customer.',
      customer:'Start with owners of older properties who are planning renovations. Ask about their last testing project: who they hired, what they needed from the report, and where timing was difficult. Their answers can test the assumed need for SafeStart.',
      offer:'Define what one property-testing package covers: the agreed measurements and samples, accredited laboratory analysis, office review and the formal report. Agree sample limits and extra work in advance. Removal work is outside this fictional offer; qualifications and reporting scope still need verification.',
      rules:'For SafeStart, identify who can confirm the qualifications for the proposed service, equipment requirements, safe sampling, laboratory arrangements, insurance and report limits. Record what must be resolved before a paid job and how it affects costs or timing. A filled-in draft does not establish permission to operate.',
      numbers:'One SafeStart sale includes fieldwork, laboratory analysis, office review and reporting. Include per-job laboratory fees and supplies once in cost per sale. Allow for office time and laboratory turnaround when estimating capacity. Initial training and equipment belong in startup costs; recurring insurance and upkeep belong in monthly costs.',
      test:'Talk with property owners or renovation coordinators about a past testing project. A specific scheduling or reporting problem, followed by a request to hear more, is a useful early signal. Verify qualifications, laboratory arrangements and scope before offering fieldwork or a paid pilot.'
    },
    yard:{
      idea:'Mesa Yard Care starts with scheduled cleanup and manual weeding for small yards. A clear service and a limited scope give the owner something concrete to discuss with potential customers.',
      customer:'Mesa starts with older homeowners in one neighborhood. Ask how they arranged yard help last time, what was difficult and what they actually paid for. Wanting a small scheduled service is still an assumption until it is checked.',
      offer:'Mesa sells a two-hour cleanup and manual-weeding visit. Tree work and pesticide application are outside its scope. Agree the tasks with the customer and check equipment, transport, insurance and safe working practices before a paid pilot.',
      rules:'For Mesa, check local operating requirements, insurance, tool safety, transport and disposal arrangements. Keep the first offer within a safe scope such as cleanup and manual weeding. Ask the relevant business office, insurer or qualified operator to confirm the unknowns before paid work.',
      numbers:'One Mesa sale is a two-hour visit. Include travel and supplies in its per-visit costs, and allow travel and safe work time when estimating monthly capacity. Compare the sales needed for your owner-pay target with the visits you can actually deliver.',
      test:'Ask homeowners about their last experience arranging yard help. Requests for a follow-up about a clearly scoped visit are more useful than compliments alone. Check the requirements before a paid pilot; a few interested people do not yet prove a market.'
    },
    bike:{
      idea:'Porchside offers basic bicycle tune-ups at a customer’s home or workplace. A defined appointment gives riders a clear idea of what they would receive and gives the mechanic a service to test.',
      customer:'Start with occasional adult riders who postpone taking a usable bike to a shop. Ask about the last time their bike needed service and what stopped them arranging it. Convenience is a possible advantage to investigate.',
      offer:'Define the basic tune-up checklist and what is outside the price. In the fictional example, parts and major repairs are excluded. Keep the service within verified skills, tools and insurance coverage.',
      rules:'For Porchside, have a qualified mechanic review the service checklist, confirm the repairs covered by insurance, and check local operating requirements and safe handling of lubricants. Resolve the work limits before paid appointments.',
      numbers:'One Porchside sale is a basic tune-up appointment. Include supplies and travel once in cost per appointment. Allow time for safety checks and travel when setting capacity, and make the treatment of replacement parts clear.',
      test:'Interview riders about a recent need for service. After checking requirements, a small paid pilot can test whether riders accept the scope and price and whether appointments fit the planned time. Record what would make you revise the offer.'
    },
    own:{
      idea:'Describe one product or service and the result a customer would receive. A narrow first offer is easier to explain, price and test. Your working name can change as the idea develops.',
      customer:'Choose one group you could realistically talk with. Ask about a recent experience with the problem you hope to solve. Keep what you observed separate from what you are assuming.',
      offer:'Describe one purchase, what it includes and what is outside the price. Consider who does the work, what is needed and why a customer might choose it over their current alternative.',
      rules:'Identify what needs checking before your first paid job, who can confirm it and what it changes in costs, scope or timing. Start with the most important unknown. A completed planning note does not establish permission to operate.',
      numbers:'Use the same unit for price, cost per sale and monthly sales. Include each expense once, allow for the full time needed to deliver the work, and compare the sales needed for owner pay with realistic capacity. Leave an unknown required cost total blank.',
      test:'Choose a small action that could change your mind about the idea. Look for a specific customer problem or behavior, record what you learn, and decide what result would justify another step.'
    }
  };
  for(const key of ['consulting','toys']){const e=examples[key];tips[key]={idea:e.plan.idea,customer:e.gaps.demand.question+' '+e.gaps.demand.action,offer:e.plan.offer,rules:e.gaps.requirements.question+' '+e.gaps.requirements.action,numbers:e.gaps.costs.action+' '+e.gaps.cash.question,test:e.plan.test};}
  function planningTip(plan,step){
    const exampleKey=exampleKeyForPlan(plan),key=Object.hasOwn(tipTitles,step)?step:'idea';
    return {exampleKey,title:tipTitles[key],label:exampleKey?'PLANNING TIP · '+examples[exampleKey].plan.name.split(' — ')[0].toUpperCase()+' EXAMPLE':'PLANNING TIP',text:(tips[exampleKey]||tips.own)[key],disclaimer:exampleKey?'This fictional example is for learning. Its details are not verified facts about your business.':''};
  }
  function selectionFromURL(href){const key=new URL(href).searchParams.get('example');return key==='own'||Object.hasOwn(examples,key)?key:null;}
  function sourceInfo(plan){const key=exampleKeyForPlan(plan);return key?examples[key].source:null;}
  function planningGaps(plan){
    const p=cleanPlan(plan),key=exampleKeyForPlan(p),prompts=key?examples[key].gaps:library.defaultGaps;
    return Object.entries(library.gapTopics).map(([id,title])=>({id,title,...prompts[id],status:p.gapReview?.[id]?.status||'open',note:p.gapReview?.[id]?.note||''}));
  }
  function modelGaps(plan){
    const r=calculate(plan),items=[];
    if(!r.ready)items.push('The monthly model needs valid price, cost, sales and any supplied optional numbers before it can calculate.');
    else{
      if(r.margin<=0)items.push('Price does not cover the cost of one sale; selling more will not cover fixed costs.');
      if(r.overCapacity)items.push('Expected monthly sales exceed the capacity entered.');
      if(r.breakEvenOverCapacity)items.push('Operating break-even exceeds the capacity entered.');
      if(r.ownerPayOverCapacity)items.push('The sales needed for the owner-pay target exceed the capacity entered.');
      if(r.ownerPay!==null&&r.result<r.ownerPay)items.push('Expected sales leave less than the desired owner pay, before taxes, debt and startup recovery.');
      if(r.lowerResult<0)items.push('A month with 25% fewer sales does not cover monthly operating costs.');
    }
    for(const field of ['capacity','startup','ownerPay'])if(amount(plan[field])===null)items.push(labels[field]+' is not established.');
    return items;
  }
  function gapText(plan){return '## Planning gaps and evidence to discuss\n\nFilled fields are draft wording, not proof. Evidence recorded here is self-reported and should be reviewed with an adviser.\n\n'+
    (modelGaps(plan).length?'### Checks from your numbers\n\n'+modelGaps(plan).map(x=>'- '+x).join('\n')+'\n\n':'')+
    planningGaps(plan).map(g=>'### '+g.title+' — '+(g.status==='recorded'?'Evidence recorded (self-reported)':'To investigate')+'\n\n'+g.question+'\n\nNext check: '+g.action+'\n\nYour findings / next action: '+(g.note.trim()||'Not recorded yet.')).join('\n\n');}
  function amount(value){if(typeof value!=='string'||value.trim()===''||!/^\d+(\.\d{1,2})?$/.test(value.trim()))return null;const n=Number(value);return Number.isFinite(n)&&n<=1000000?n:null;}
  const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n);
  function calculate(plan){
    const p=cleanPlan(plan),n=Object.fromEntries(numberKeys.map(k=>[k,amount(p[k])]));
    const invalid=numberKeys.filter(k=>p[k].trim()!==''&&n[k]===null);
    for(const k of ['sales','capacity'])if(n[k]!==null&&!Number.isInteger(n[k]))invalid.push(k);
    const required=['price','variable','fixed','sales'];
    if(invalid.length||required.some(k=>n[k]===null))return {ready:false,invalid:[...new Set(invalid)],missing:required.filter(k=>n[k]===null)};
    // Money is calculated in cents. Round break-even targets up to a whole sale.
    const price=Math.round(n.price*100),variable=Math.round(n.variable*100),fixed=Math.round(n.fixed*100),margin=price-variable;
    const revenue=price*n.sales/100,totalVariable=variable*n.sales/100;
    const breakEven=margin>0?Math.ceil(fixed/margin):null;
    const ownerPaySales=n.ownerPay!==null&&margin>0?Math.ceil((fixed+Math.round(n.ownerPay*100))/margin):null;
    const result=(revenue-totalVariable)-fixed/100;
    const lowerSales=Math.floor(n.sales*0.75),lowerResult=(margin*lowerSales-fixed)/100;
    return {ready:true,...n,revenue,totalVariable,margin:margin/100,result,breakEven,ownerPaySales,lowerSales,lowerResult,overCapacity:n.capacity!==null&&n.sales>n.capacity,breakEvenOverCapacity:n.capacity!==null&&breakEven!==null&&breakEven>n.capacity,ownerPayOverCapacity:n.capacity!==null&&ownerPaySales!==null&&ownerPaySales>n.capacity};
  }
  function numericSummary(plan){const r=calculate(plan);if(!r.ready)return 'Numbers are incomplete or invalid; no result has been calculated.';return `Monthly revenue: ${money(r.revenue)}\nCosts that vary with sales: ${money(r.totalVariable)}\nMonthly fixed costs: ${money(r.fixed)}\nOperating remainder before owner pay: ${money(r.result)}\nContribution per sale: ${money(r.margin)}\nOperating break-even: ${r.breakEven===null?'Not attainable with a non-positive contribution per sale':r.breakEven+' sales per month'}\n${r.ownerPay!==null?`Sales to cover costs and ${money(r.ownerPay)} desired owner pay: ${r.ownerPaySales===null?'Not attainable with a non-positive contribution per sale':r.ownerPaySales+' sales per month'}\n`:''}At 25% fewer sales (rounded down to ${r.lowerSales}): ${money(r.lowerResult)} operating remainder before owner pay\n${r.overCapacity?'Expected sales exceed stated capacity.\n':''}${r.breakEvenOverCapacity?'Operating break-even exceeds stated capacity.\n':''}${r.ownerPayOverCapacity?'The desired owner-pay target exceeds stated capacity at these prices and costs.\n':''}Excludes income taxes, debt payments and recovery of one-time startup spending. This is an estimate, not a cash-flow forecast.`;}
  function completion(plan){
    const p=cleanPlan(plan),byStep={};let completed=0,total=0;
    for(const s of Object.keys(requiredByStep)){const keys=requiredByStep[s],done=keys.filter(k=>p[k].trim()!==''&&(numberKeys.includes(k)?amount(p[k])!==null:true)).length;byStep[s]={done,total:keys.length,status:done===keys.length?'complete':done?'partial':'empty'};completed+=done;total+=keys.length;}
    const missing=Object.values(requiredByStep).flat().filter(k=>p[k].trim()===''||(numberKeys.includes(k)&&amount(p[k])===null));
    byStep.review={done:total-missing.length,total,status:missing.length===0?'complete':completed?'partial':'empty'};
    return {byStep,completed,total,missing,topMissing:missing.slice(0,3).map(k=>labels[k])};
  }
  function planSections(plan){const p=cleanPlan(plan);return sections.map(section=>({title:section.title,items:section.keys.map(key=>{const blank=!p[key].trim(),optional=optionalKeys.includes(key);return {key,label:labels[key],value:blank?(optional?'Not provided (optional)':'Not filled in yet'):p[key].trim(),missing:blank&&!optional,optional};})}));}
  function planText(plan){const p=cleanPlan(plan),progress=completion(p),missing=progress.topMissing.length?progress.topMissing.join('; '):'No core fields are blank.';return `# Business Plan First Steps\n\n**Version:** ${version}  \n**Purpose:** Working assumptions for discussion; not a financing application.\n\n## Snapshot\n\n${p.idea.trim()||'Business idea not recorded yet.'}\n\n${p.customer.trim()?'First customer: '+p.customer.trim()+'\n\n':''}- **Core fields filled in:** ${progress.completed} of ${progress.total}\n- **Top items to finish:** ${missing}\n\n${gapText(p)}\n\n${planSections(p).map(section=>`## ${section.title}\n\n${section.items.map(item=>`### ${item.label}\n\n${item.value}`).join('\n\n')}`).join('\n\n')}\n\n## Simple monthly model\n\n${numericSummary(p).split('\n').map(line=>`- ${line}`).join('\n')}\n\n## Assumptions, evidence and risks to discuss\n\n- Treat prices, sales, costs and capacity as estimates until checked.\n- Separate observed customer evidence from guesses in **What you know and how you know it**.\n- Check complete costs, legal requirements, insurance, taxes, timing of payments and cash needs with appropriate advisers.\n- Compare the sales needed for operating break-even and desired owner pay with realistic capacity.\n\n## Questions for an adviser\n\n${p.verifier.trim()?"Verification contacts and questions: "+p.verifier.trim()+"\n\n":""}${p.question.trim()||'Not filled in yet'}\n\n## Recommended next planning work\n\n${p.next.trim()||'Validate demand, check complete costs and local requirements, and build a cash-flow forecast with an adviser.'}\n\n---\n\n${sourceInfo(p)?'Example source: '+sourceInfo(p).label+' — '+sourceInfo(p).url+'  \n'+sourceInfo(p).note+'\n\n':''}Planning reference: https://www.sba.gov/counseling/plan-your-business/  \nActivity: https://denson.github.io/fieldwork/?demo=business`;
  }
  function cleanWorkspace(raw={}){const feedback={};for(const key of ['name','use','helped','confused','change'])feedback[key]=typeof raw.feedback?.[key]==='string'?raw.feedback[key].slice(0,1500):'';return {feedback,includePlan:raw.includePlan===true,step:steps.includes(raw.step)?raw.step:'idea'};}
  function backupText(plan,workspace){return JSON.stringify({format:'fieldwork-business-plan-backup',version,plan:cleanPlan(plan),...(workspace?{workspace:cleanWorkspace(workspace)}:{})},null,2);}
  function parseBackup(input){try{const data=typeof input==='string'?JSON.parse(input):input;if(!data||data.format!=='fieldwork-business-plan-backup'||!data.plan||typeof data.plan!=='object'||Array.isArray(data.plan))return {ok:false,error:'That file is not a Fieldwork business-plan backup.'};return {ok:true,plan:cleanPlan(data.plan),...(data.workspace?{workspace:cleanWorkspace(data.workspace)}:{})};}catch{return {ok:false,error:'The backup file is not valid JSON.'};}}
  function feedbackText(plan,feedback={},includePlan=false){const safe=k=>typeof feedback[k]==='string'?feedback[k].trim().slice(0,1500):'';return `FIELDWORK — BUSINESS PLAN DEMO FEEDBACK\nVersion ${version}\nActivity: https://denson.github.io/fieldwork/?demo=business\n\nReviewer (optional): ${safe('name')||'Not supplied'}\nWould I use this with a new business owner? ${safe('use')||'Not answered'}\n\nWhat helped?\n${safe('helped')||'Not answered'}\n\nWhere did I get stuck or confused?\n${safe('confused')||'Not answered'}\n\nWhat would I change or add?\n${safe('change')||'Not answered'}\n\n${includePlan?'INCLUDED FIRST DRAFT\n\n'+planText(plan):'Business-plan answers are not included in this feedback package.'}`;}
  function emailDraft(address,body){if(typeof address!=='string'||! /^[a-z0-9.!$'*+_~-]+@[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(address))return null;const subject='Feedback: Fieldwork business-plan demo';const full='mailto:'+address+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);if(full.length<=1800)return {href:full,attach:false};const brief='I tried the Fieldwork business-plan demo. My feedback is in the text file I will attach.\n\nPlease attach the downloaded fieldwork-business-feedback.txt before sending.';return {href:'mailto:'+address+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(brief),attach:true};}
  function chatNote(plan,step){
    const p=cleanPlan(plan),current=steps.includes(step)?step:'idea';
    const keys={idea:['name','idea'],customer:['customer','problem','evidence'],offer:['offer','alternative','reach','delivery','resources','checks','impact'],rules:['name','idea','checks','verifier','impact'],numbers:['unit','price','variable','fixed','sales','capacity','startup','ownerPay','impact'],test:['test','success','next','question','checks','verifier','impact'],review:['name','idea','customer','offer','checks','verifier','impact','next','question']}[current];
    const header=`FIELDWORK BUSINESS PLAN — ${current}\nThese are my draft ideas and assumptions, not verified facts.\n\n`;
    const footer=`\n\nHelp me improve this step. Draft useful wording from what I shared, then ask one useful question and wait.\nMy activity: https://denson.github.io/fieldwork/?demo=business&step=${current}`;
    const numbers=current==='numbers'?'\n\n'+numericSummary(p):current==='review'?'\n\nPlanning review (self-reported):\n'+planningGaps(p).map(g=>g.title+': '+(g.status==='recorded'?'Evidence recorded':'To investigate')+' — '+(g.note||g.question).slice(0,120)).join('\n'):'';
    const budget=Math.floor((3700-header.length-footer.length-numbers.length)/keys.length)-65;
    const value=k=>{const v=p[k]||'Not filled in yet';return v.length>budget?v.slice(0,budget-1)+'…':v;};
    return header+keys.map(k=>`${labels[k]}: ${value(k)}`).join('\n\n')+numbers+footer;
  }
  return {version,steps,labels,example,examples,cleanPlan,exampleKeyForPlan,planningTip,calculate,money,numericSummary,completion,planSections,planText,selectionFromURL,sourceInfo,planningGaps,modelGaps,gapText,backupText,parseBackup,feedbackText,emailDraft,chatNote};
});

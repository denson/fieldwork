(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FirstSteps=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const badges={compass:'Compass',lantern:'Lantern',magnifier:'Magnifying glass'};
  const topics={
    history:{name:'History detective',title:'Pueblo History Detective',query:'?demo=history&case=flood-camp',alias:'PuebloHistoryDetective',description:'Inspect a real photograph, write what you notice, and discuss what it can prove.'},
    quakes:{name:'Earthquakes & tsunamis',title:'Before the wave arrives',query:'?demo=quakes&case=alaska1964&step=reach',alias:'EarthquakeTsunamiGuide',description:'Explore how observations, warnings, and community action can save lives.'},
    budget:{name:'Community budget',title:'Community Budget Challenge',query:'?demo=budget&preset=balanced&event=none',alias:'CommunityBudgetCoach',description:'Try a town spending plan, test a storm, and discuss the tradeoffs.'},
    hearing:{name:'Public hearing',title:'Public Hearing Detective',query:'?demo=hearing&exhibit=E09&witness=director',alias:'EastbankHearingGuide',description:'Compare a fictional case’s exhibits and bring your questions to a witness.'}
  };
  const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
  function valid(s){return !!s&&own(badges,s.badge)&&own(topics,s.topic)&&/^[a-z0-9]{8,32}$/.test(s.pass||'');}
  function parse(href){
    const p=new URL(href).searchParams;
    const s={pass:p.get('pass')||'',badge:p.get('badge')||'',topic:p.get('topic')||'',step:p.get('step')||'choose'};
    if(!valid(s))return {step:'choose',pass:'',badge:'',topic:'',invalid:p.has('pass')||p.has('badge')||p.has('topic')};
    if(!['choose','share','return'].includes(s.step))s.step='choose';
    return s;
  }
  function url(base,s,step='return'){
    if(!valid(s)||!['choose','share','return'].includes(step))throw new Error('Choose a valid badge and topic first.');
    const u=new URL('start.html',base);u.search='';u.hash='';
    for(const [k,v]of Object.entries({step,pass:s.pass,badge:s.badge,topic:s.topic}))u.searchParams.set(k,v);
    return u.href;
  }
  function note(base,s){
    if(!valid(s))throw new Error('Choose a valid badge and topic first.');
    return `FIELDWORK FIRST STEPS — MY PRACTICE NOTE\nPractice: ${s.pass}\nMy badge: ${badges[s.badge]}\nMy next topic: ${topics[s.topic].name}\n\nI chose these on the Fieldwork website and shared this note in our chat.\nPlease name my two choices and give me the return link. Keep the manual destination for help if I need it.\n\nReturn to my practice:\n${url(base,s)}\n\nManual destination (paste into the website side):\n${directURL(base,s)}\n\nThe return link can open the next step in the matching practice page already open in this browser. It does not send my later clicks or answers to BoodleBox or prove I completed anything.`;
  }
  function directURL(base,s){const u=new URL(url(base,s));u.searchParams.set('here','1');return u.href;}
  function portfolioURL(base,s){
    if(!valid(s))throw new Error('Choose a valid badge and topic first.');
    const u=new URL('./',base);u.searchParams.set('demo','home');u.searchParams.set('interest',s.topic);return u.href;
  }
  function reconcile(incoming,saved){
    if(!valid(incoming))return {state:incoming,conflict:false};
    if(valid(saved)&&saved.pass===incoming.pass){
      if(saved.badge!==incoming.badge||saved.topic!==incoming.topic)return {state:{...saved,step:'share'},conflict:true};
      return {state:{...incoming,confirmed:typeof saved.confirmed==='boolean'?saved.confirmed:null,understood:saved.understood===true},conflict:false};
    }
    return {state:{...incoming,confirmed:null,understood:false},conflict:false};
  }
  return {badges,topics,valid,parse,url,directURL,portfolioURL,note,reconcile};
});

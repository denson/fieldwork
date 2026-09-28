(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FieldworkRouting=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  // These are permission boundaries, not a list of activities. Activity-to-guide
  // pairings live on the approved Fieldwork website and can change independently.
  const registryURL='https://denson.github.io/fieldwork/companion-registry.json';
  const localOrigins=['http://127.0.0.1:4173','http://localhost:4173'];
  const companions=Object.create(null);
  let routes=[];
  const unsafe=/%2f|%5c|%2e/i;
  function sitePath(u){
    if(u.username||u.password||unsafe.test(u.pathname))return null;
    if(localOrigins.includes(u.origin))return {site:'fieldwork',path:u.pathname};
    if(u.origin!=='https://denson.github.io')return null;
    if(u.pathname==='/fieldwork')return {site:'fieldwork',path:'/'};
    if(u.pathname.startsWith('/fieldwork/'))return {site:'fieldwork',path:u.pathname.slice('/fieldwork'.length)};
    if(u.pathname==='/colorado-weed-field-guide')return {site:'plants',path:'/'};
    if(u.pathname.startsWith('/colorado-weed-field-guide/'))return {site:'plants',path:u.pathname.slice('/colorado-weed-field-guide'.length)};
    return null;
  }
  function validPath(path){return typeof path==='string'&&path.startsWith('/')&&!path.includes('\\')&&!path.includes('//')&&!path.split('/').some(part=>part==='.'||part==='..')&&!unsafe.test(path);}
  function setRegistry(data){
    if(data?.version!==1||!Array.isArray(data.routes)||data.routes.length<1||data.routes.length>100)return false;
    const seen=new Set(),next=Object.create(null),parsed=[];
    for(const item of data.routes){
      if(!item||!['fieldwork','plants'].includes(item.site)||!validPath(item.path)||!(/^[A-Za-z0-9]{3,64}$/).test(item.alias||'')||typeof item.name!=='string'||item.name.length<3||item.name.length>100||/[\x00-\x1f<>]/.test(item.name))return false;
      if(item.prefix!==undefined&&item.prefix!==true)return false;
      if(item.launch!==undefined&&item.launch!==true)return false;
      if(item.demo!==undefined&&(!(/^[a-z0-9-]{1,40}$/).test(item.demo)||item.prefix))return false;
      if(item.redirect!==undefined&&(!validPath(item.redirect)||item.site!=='fieldwork'||item.prefix))return false;
      const key=[item.site,item.path,item.demo||'',item.prefix?'prefix':'exact'].join('|');if(seen.has(key))return false;seen.add(key);
      if(next[item.alias]&&next[item.alias]!==item.name)return false;
      next[item.alias]=item.name;parsed.push({site:item.site,path:item.path,demo:item.demo,prefix:!!item.prefix,launch:!!item.launch,alias:item.alias,name:item.name,redirect:item.redirect});
    }
    for(const key of Object.keys(companions))delete companions[key];
    Object.assign(companions,next);routes=parsed;return true;
  }
  function match(url){
    try{
      const u=new URL(url),site=sitePath(u);if(!site)return null;
      const demo=u.searchParams.get('demo');
      return routes.find(r=>r.site===site.site&&(r.prefix?(site.path===r.path||site.path.startsWith(r.path.endsWith('/')?r.path:r.path+'/'))&&(/\/$|\.html$/.test(site.path)):site.path===r.path)&&(!r.demo||r.demo===demo)&&!(demo&&!r.demo&&r.site==='fieldwork'&&(site.path==='/'||site.path==='/index.html')))||null;
    }catch{return null;}
  }
  function destination(url){
    const route=match(url);if(!route)return null;
    try{
      const u=new URL(url);
      if(route.redirect){
        const base=localOrigins.includes(u.origin)?u.origin:u.origin+'/fieldwork';
        const target=new URL(route.redirect.slice(1),base+'/');
        target.search=u.search;target.hash=u.hash;
        target.searchParams.delete('demo');
        return destination(target.href);
      }
      if(route.site==='fieldwork'&&u.searchParams.get('step')==='return')u.searchParams.set('here','1');
      return u.href;
    }catch{return null;}
  }
  function combo(url){const href=destination(url);if(!href)return null;const route=match(href);if(!route)return null;return {url:href,companion:route.alias,name:route.name,profileUrl:'https://box.boodle.ai/a/@'+route.alias};}
  function workspace(alias,params={}){
    const route=routes.find(r=>r.alias===alias&&r.launch);if(!route)return null;
    const root=route.site==='plants'?'/colorado-weed-field-guide':'/fieldwork';
    const u=new URL(root+route.path,'https://denson.github.io');
    if(route.demo)u.searchParams.set('demo',route.demo);
    for(const [key,value]of Object.entries(params)){
      if(!/^[a-z][a-z0-9-]{0,30}$/.test(key)||typeof value!=='string'||!(/^[a-zA-Z0-9_-]{1,80}$/).test(value))return null;
      u.searchParams.set(key,value);
    }
    return combo(u.href)?.companion===alias?u.href:null;
  }
  function isBoodle(url){try{return new URL(url).origin==='https://box.boodle.ai';}catch{return false;}}
  function profileAlias(url){try{const u=new URL(url);if(!isBoodle(url)||u.username||u.password)return null;const alias=decodeURIComponent(u.pathname).match(/^\/a\/@([A-Za-z0-9]{3,64})\/?$/)?.[1];return alias&&Object.hasOwn(companions,alias)?alias:null;}catch{return null;}}
  function isActivity(url){return !!combo(url);}
  function isSharePage(url){return !!combo(url);}
  function isBlankPane(url){return ['about:blank','chrome://newtab/','chrome://new-tab-page/','chrome://tab-search.top-chrome/split_new_tab_page.html'].includes(url);}
  function isPaneTarget(url){return isActivity(url)||isBlankPane(url);}
  function isChat(url){try{return isBoodle(url)&&/^\/c\/[^/]+\/?$/.test(new URL(url).pathname);}catch{return false;}}
  function validNote(message){return typeof message?.text==='string'&&message.text.trim().length>0&&message.text.length<=32000&&Object.hasOwn(companions,message.companion);}
  function pairedChat(source,tabs){
    if(!source||!isSharePage(source.url)||!Number.isInteger(source.splitViewId)||source.splitViewId<0)return {reason:'no-split'};
    const matches=tabs.filter(t=>t.id!==source.id&&t.windowId===source.windowId&&t.splitViewId===source.splitViewId);
    if(matches.length!==1)return {reason:'no-unique-pair'};
    const target=matches[0];
    if(!isChat(target.url)||target.pendingUrl&&target.pendingUrl!==target.url)return {reason:'no-chat'};
    if(source.pendingUrl&&source.pendingUrl!==source.url)return {reason:'page-changing'};
    return {tabId:target.id};
  }
  function pairedGuide(source,tabs){
    const current=source&&combo(source.url);
    if(!current||!Number.isInteger(source.splitViewId)||source.splitViewId<0)return {reason:'no-split'};
    const matches=tabs.filter(t=>t.id!==source.id&&t.windowId===source.windowId&&t.splitViewId===source.splitViewId);
    if(matches.length!==1)return {reason:'no-unique-pair'};
    const target=matches[0];
    if(source.pendingUrl&&source.pendingUrl!==source.url||target.pendingUrl&&target.pendingUrl!==target.url)return {reason:'page-changing'};
    if(!isBlankPane(target.url)&&!isChat(target.url)&&profileAlias(target.url)!==current.companion)return {reason:'different-site'};
    return {tabId:target.id};
  }
  function paired(source,tabs){
    if(!source||!isBoodle(source.url)||!Number.isInteger(source.splitViewId)||source.splitViewId<0)return {reason:'no-split'};
    const matches=tabs.filter(t=>t.id!==source.id&&t.windowId===source.windowId&&t.splitViewId===source.splitViewId);
    if(matches.length!==1)return {reason:'no-unique-pair'};
    const target=matches[0];if(!isPaneTarget(target.url))return {reason:'different-site'};
    if(source.pendingUrl&&source.pendingUrl!==source.url)return {reason:'page-changing'};
    if(target.pendingUrl&&target.pendingUrl!==target.url)return {reason:'page-changing'};
    return {tabId:target.id};
  }
  return {registryURL,setRegistry,isBoodle,destination,isActivity,isBlankPane,isPaneTarget,paired,isSharePage,isChat,validNote,pairedChat,pairedGuide,companions,combo,profileAlias,workspace};
});

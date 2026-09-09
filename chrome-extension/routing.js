(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FieldworkRouting=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const origins=['http://127.0.0.1:4173','http://localhost:4173'];
  // Normalize only this published project; other GitHub Pages sites stay outside the bridge.
  function fieldworkPath(u){if(u.username||u.password||/%2f|%5c|%2e/i.test(u.pathname))return null;if(origins.includes(u.origin))return u.pathname;if(u.origin==='https://denson.github.io'&&u.pathname.startsWith('/fieldwork/'))return u.pathname.slice('/fieldwork'.length);return null;}
  function isWeed(url){try{const u=new URL(url);return u.origin==='https://denson.github.io'&&!u.username&&!u.password&&u.pathname.startsWith('/colorado-weed-field-guide/')&&!/%2f|%5c|%2e/i.test(u.pathname);}catch{return false;}}
  const companions={ColoradoWeedGuide:'Colorado Weed Guide',FieldworkPortfolioGuide:'Fieldwork Portfolio Guide',FieldworkFirstSteps:'Fieldwork First Steps',PuebloHistoryDetective:'Pueblo History Detective',EarthquakeTsunamiGuide:'Earthquake & Tsunami Guide',CommunityBudgetCoach:'Community Budget Coach',EastbankHearingGuide:'Eastbank Hearing Guide'};
  const lessonCompanions={home:'FieldworkPortfolioGuide',history:'PuebloHistoryDetective',quakes:'EarthquakeTsunamiGuide',budget:'CommunityBudgetCoach',hearing:'EastbankHearingGuide'};
  function profileAlias(url){try{const u=new URL(url);if(!isBoodle(url)||u.username||u.password)return null;const alias=decodeURIComponent(u.pathname).match(/^\/a\/@([^/]+)\/?$/)?.[1];return Object.hasOwn(companions,alias)?alias:null;}catch{return null;}}
  function combo(url){const href=destination(url);if(!href)return null;const u=new URL(href),demo=u.searchParams.get('demo')||'home',path=fieldworkPath(u);let companion;if(isWeed(href))companion='ColoradoWeedGuide';else if(path==='/start.html')companion='FieldworkFirstSteps';else if(['/','/index.html'].includes(path)&&Object.hasOwn(lessonCompanions,demo))companion=lessonCompanions[demo];else return null;return {url:u.href,companion,profileUrl:'https://box.boodle.ai/a/@'+companion};}
  function isBoodle(url){try{return new URL(url).origin==='https://box.boodle.ai';}catch{return false;}}
  function destination(href){try{const u=new URL(href);if(isWeed(href))return /^\/colorado-weed-field-guide\/(?:index\.html|(?:companion|safety|agents|about|sources|coverage|biggest-concerns|native|xeriscape|invasive)\/(?:index\.html)?|plants\/[a-z0-9-]+\/(?:index\.html)?)?$/.test(u.pathname)?u.href:null;const path=fieldworkPath(u);if(!['/','/index.html','/start.html'].includes(path))return null;if(['/','/index.html'].includes(path)&&!u.searchParams.get('demo')){u.pathname=new URL('start.html',u).pathname;u.searchParams.delete('demo');}if(fieldworkPath(u)==='/start.html'&&u.searchParams.get('step')==='return')u.searchParams.set('here','1');return u.href;}catch{return null;}}
  function isActivity(url){try{return fieldworkPath(new URL(url))!==null||isWeed(url);}catch{return false;}}
  function isSharePage(url){return !!destination(url);}
  // Chrome's split-view chooser is a real tab, not about:blank. Reading its
  // address requires the tabs permission; an unknown address is never blank.
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
  function paired(source,tabs){
    if(!source||!isBoodle(source.url)||!Number.isInteger(source.splitViewId)||source.splitViewId<0)return {reason:'no-split'};
    const matches=tabs.filter(t=>t.id!==source.id&&t.windowId===source.windowId&&t.splitViewId===source.splitViewId);
    if(matches.length!==1)return {reason:'no-unique-pair'};
    const target=matches[0];if(!isPaneTarget(target.url))return {reason:'different-site'};
    if(source.pendingUrl&&source.pendingUrl!==source.url)return {reason:'page-changing'};
    if(target.pendingUrl&&target.pendingUrl!==target.url)return {reason:'page-changing'};
    return {tabId:target.id};
  }
  return {isBoodle,destination,isActivity,isBlankPane,isPaneTarget,paired,isSharePage,isChat,validNote,pairedChat,companions,combo,profileAlias};
});

(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else{root.FieldworkEntry=api;const next=api.tutorialURL(root.location.href);if(next){root.document.documentElement.style.visibility='hidden';root.location.replace(next);}}
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function tutorialURL(href){
    const current=new URL(href);
    if(current.searchParams.get('demo')||!(/\/$|\/index\.html$/.test(current.pathname)))return null;
    const next=new URL('start.html',current);next.search=current.search;next.searchParams.delete('demo');next.hash=current.hash;
    return next.href;
  }
  return {tutorialURL};
});

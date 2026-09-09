(()=>{
  'use strict';
  const F=FirstSteps,$=id=>document.getElementById(id),prefix='fieldwork-first-steps-v1:';
  let state={},screen='choose',storeOK=true,fromLink=false,copyFeedbackTimer;
  const newId=()=>{const a=new Uint32Array(2);crypto.getRandomValues(a);return [...a].map(v=>v.toString(36).padStart(7,'0')).join('');};
  const storage={read(id){try{return JSON.parse(localStorage.getItem(prefix+id)||'null');}catch{storeOK=false;return null;}},write(){if(!F.valid(state))return;try{localStorage.setItem(prefix+state.pass,JSON.stringify(state));}catch{storeOK=false;}}};
  let relayBusy=false;
  const bridge=FirstHandoff.connect({id:newId(),createChannel:name=>new BroadcastChannel(name),getState:()=>state,canReceive:()=>screen==='share'&&!relayBusy,onReceive:()=>{
    state.step='return';fromLink=true;address('return');storage.write();render('return');notice('Your return link opened this step in your existing activity page. Compare your pass with the guide’s reply on the left.');return true;
  }});
  function notice(text){$('notice').textContent=text;$('notice').hidden=!text;}
  function address(step,replace=false){if(!F.valid(state))return;history[replace?'replaceState':'pushState']({},'',F.url(location.href,state,step));}
  function render(step,focus=true){
    screen=step;document.querySelectorAll('[data-panel]').forEach(e=>e.hidden=e.dataset.panel!==step);
    document.querySelectorAll('[data-track]').forEach(e=>e.dataset.track===step?e.setAttribute('aria-current','step'):e.removeAttribute('aria-current'));
    if(F.valid(state)){
      document.querySelectorAll('[name=badge]').forEach(e=>e.checked=e.value===state.badge);$('topic').value=state.topic;
      $('practice-note').value=F.note(location.href,state);
      $('destination-url').value=F.directURL(location.href,state);$('handoff-url').value=F.directURL(location.href,state);
      $('pass-badge').textContent=F.badges[state.badge];$('pass-topic').textContent=F.topics[state.topic].name;
      $('pass-emblem').replaceChildren(document.querySelector(`[name=badge][value="${state.badge}"]`).parentElement.querySelector('svg').cloneNode(true));
      $('return-explanation').textContent=fromLink?'The link opened this step with the badge and topic in its address. Compare your pass below with the guide’s reply in BoodleBox. Only you can tell us whether it got your choices right.':'These are the choices in your practice note. If you tried the chat, check them against the guide’s reply in BoodleBox. You can also learn the steps here without using the chat.';
      document.querySelectorAll('[name=confirmed]').forEach(e=>e.checked=state.confirmed===true?e.value==='yes':state.confirmed===false?e.value==='no':false);
      document.querySelectorAll('[data-answer]').forEach(e=>{e.setAttribute('aria-pressed',String(state.understood===true&&e.dataset.answer==='note'));e.disabled=state.understood===true;});
      $('check-feedback').textContent=state.understood?'Exactly. Review, then Send: you approve the handoff before the bot receives your note and responds. Share a fresh note when your work changes.':'';
      $('finish-practice').disabled=!(state.understood&&typeof state.confirmed==='boolean');
      const topic=F.topics[state.topic];$('next-title').textContent='Choose your first investigation.';$('next-description').textContent=`You picked ${topic.name}. The portfolio will remember that interest and show you all four activities. Start with your choice or find a new direction.`;
      $('next-site').href=F.portfolioURL(location.href,state);$('next-bot').href='https://box.boodle.ai/a/@FieldworkPortfolioGuide';
      $('completion-status').textContent=state.confirmed?'You’ve checked that the guide repeated your choices, and you’ve identified how the two sides connect. Next, meet the activities and their guides in the portfolio.':'You’ve learned how the exchange works. You can explore the portfolio now, or return to your practice note whenever you want to try the chat.';
    }
    if(focus){document.querySelector(`[data-panel="${step}"] h2`).focus();$('practice').scrollIntoView({block:'start',behavior:'instant'});}
  }
  function restore(focus=false){
    const incoming=F.parse(location.href),resolved=F.reconcile(incoming,incoming.pass?storage.read(incoming.pass):null);state=resolved.state;
    fromLink=incoming.step==='return'&&!resolved.conflict;
    notice(resolved.conflict?'This link has different choices from the saved note for this practice. Your saved choices are still here. Copy the note below again, or change your choices to start a fresh practice.':incoming.invalid?'That link has missing or unrecognized choices. Choose a badge and topic to make a fresh practice.':!storeOK?'Browser saving is unavailable. Keep your practice note or return link if you want to come back.':'');
    render(state.step,focus||state.step==='return'||state.step==='share');
  }
  $('pass-form').addEventListener('submit',e=>{e.preventDefault();const badge=new FormData(e.currentTarget).get('badge'),topic=$('topic').value;
    if(!F.valid(state)||state.badge!==badge||state.topic!==topic)state={pass:newId(),badge,topic};
    state.step='share';storage.write();address('share');notice(storeOK?'':'Browser saving is unavailable. Keep your note or return link to resume.');$('copy-status').textContent='';render('share');
  });
  $('copy-practice').addEventListener('click',async()=>{const text=F.note(location.href,state),button=$('copy-practice');clearTimeout(copyFeedbackTimer);delete button.dataset.copied;button.title='Copy my practice note';try{await navigator.clipboard.writeText(text);button.dataset.copied='true';button.title='Copied';$('copy-status').textContent='Note copied.';copyFeedbackTimer=setTimeout(()=>{delete button.dataset.copied;button.title='Copy my practice note';if($('copy-status').textContent==='Note copied.')$('copy-status').textContent='';},2200);}catch{$('practice-note').focus();$('practice-note').select();$('copy-status').textContent='Automatic copy isn’t available. The note is selected: press Ctrl+C (or ⌘C), then paste it into your chat.';}});
  async function copyDestination(input,status){try{await navigator.clipboard.writeText($(input).value);$(status).textContent='Link copied. Click the website side, press Ctrl+L, paste, and press Enter.';}catch{$(input).focus();$(input).select();$(status).textContent='The link is selected. Press Ctrl+C to copy it, then paste it into the website side’s address bar.';}}
  $('copy-destination').addEventListener('click',()=>copyDestination('destination-url','destination-status'));
  $('handoff-copy').addEventListener('click',()=>copyDestination('handoff-url','handoff-copy-status'));
  $('handoff-close').addEventListener('click',()=>{window.close();$('handoff-status').textContent='The original practice has been updated. If this tab stays open, close it using Chrome’s tab close button.';});
  $('handoff-here').addEventListener('click',()=>{if(relayBusy)return;$('handoff-panel').hidden=true;history.replaceState({},'',F.directURL(location.href,state));$('practice').hidden=false;render('return');});
  $('edit-pass').addEventListener('click',()=>{address('choose');notice('Changing a choice creates a fresh practice note. Older return links still belong to the older practice.');render('choose');});
  function returnManually(){fromLink=false;address('return');render('return');}
  $('manual-return').addEventListener('click',returnManually);
  $('back-share').addEventListener('click',()=>{address('share');render('share');});
  document.querySelectorAll('[name=confirmed]').forEach(e=>e.addEventListener('change',()=>{state.confirmed=e.value==='yes';storage.write();$('finish-practice').disabled=!state.understood;}));
  document.querySelectorAll('[data-answer]').forEach(e=>e.addEventListener('click',()=>{
    const correct=e.dataset.answer==='note';document.querySelectorAll('[data-answer]').forEach(b=>b.setAttribute('aria-pressed',String(b===e)));
    if(correct){state.understood=true;storage.write();document.querySelectorAll('[data-answer]').forEach(b=>b.disabled=true);}
    $('check-feedback').textContent=correct?'Exactly. Review, then Send: you approve the handoff before the bot receives your note and responds. Share a fresh note when your work changes.':'Preparing the note or opening the guide gets things ready. Your approval is reviewing the note in BoodleBox and pressing Send. Try again.';
    $('finish-practice').disabled=!(state.understood&&typeof state.confirmed==='boolean');
  }));
  $('finish-practice').addEventListener('click',()=>{if(state.understood&&typeof state.confirmed==='boolean')render('ready');});
  $('new-practice').addEventListener('click',()=>{state={step:'choose'};history.pushState({},'',new URL('start.html',location.href));$('pass-form').reset();$('copy-status').textContent='';notice('');render('choose');});
  async function tryHandoff(){
    if(!F.valid(state)||state.step!=='return'||new URL(location.href).searchParams.get('here')==='1')return;
    relayBusy=true;$('handoff-panel').hidden=false;$('practice').hidden=true;$('handoff-here').disabled=true;$('handoff-panel').scrollIntoView({block:'start'});
    const result=await bridge.offer({...state,step:'return'});relayBusy=false;$('handoff-here').disabled=false;
    if(result.status==='applied'){
      $('handoff-title').textContent='Your original activity page is ready.';$('handoff-status').textContent='The next step opened in the matching practice page you already had open. Close this extra tab to return to your side-by-side layout.';$('handoff-close').hidden=false;
      if(document.referrer.startsWith('https://box.boodle.ai/')&&history.length===1)window.close();
    }else{
      $('handoff-title').textContent=result.status==='ambiguous'?'More than one matching practice is open.':'Continue here, or keep your layout.';
      $('handoff-status').textContent=result.status==='unconfirmed'?'The original page did not confirm the update. Copy the destination link and paste it into the website side, or continue here.':'We couldn’t select one matching open practice. Copy the destination link and paste it into the website side, or continue here.';
      $('practice').hidden=false;
    }
  }
  addEventListener('popstate',()=>{if(!relayBusy){$('handoff-panel').hidden=true;$('practice').hidden=false;restore(true);}});restore();tryHandoff();
})();

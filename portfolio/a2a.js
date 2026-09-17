(async function(){
  'use strict';
  const $=id=>document.getElementById(id), key='stoagen-a2a-lab-v1';
  const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
  const link=(text,url)=>{const a=el('a',text);a.href=url;return a;};
  let data;
  try{const response=await fetch('a2a-content.json');if(!response.ok)throw Error();data=await response.json();}
  catch{$('result-title').textContent='The lesson could not load';$('reasons').textContent='Reload the page or use the Markdown reference above.';return;}
  let answers={}, graded=false, firstAttempt=null, attempt=1;
  const fields=Object.keys(A2ALab.defaults);
  function read(){const d={};for(const name of fields){const v=$(name).value;d[name]=['budget','price','fee'].includes(name)?(v.trim()===''?NaN:Number(v)):name==='payment'?v:v==='true';}return d;}
  function apply(d){for(const name of fields)$(name).value=d[name]===null?'':String(d[name]===undefined?A2ALab.defaults[name]:d[name]);}
  function sourceFor(q){return data.lessons[q.lesson].source;}
  function report(){
    const d=read(), r=A2ALab.assess(d), g=A2ALab.grade(data.quiz,answers);
    const lines=['A2A LAB REVIEW v'+data.version,'Educational simulation; no real transaction or verified mandate.','Self-reported browser exercise, not an authenticated test result.','','## Fictional purchase','Buyer: Harbor Learning | Seller: Studio North','Deliverable: one training pack with three scenarios, an answer guide and source links.'];
    for(const name of fields)lines.push(name+': '+d[name]);
    lines.push('Result: '+r.title,...r.reasons.map(s=>'- '+s),'','## My explanation', $('reasoning').value.trim()||'(not entered)','','## Knowledge check','Attempt: '+attempt,'Answered: '+g.answered+'/'+g.total);
    for(const q of data.quiz)lines.push(q.id+': '+(Number.isInteger(answers[q.id])?String.fromCharCode(65+answers[q.id])+' — '+q.options[answers[q.id]]:'unanswered'));
    lines.push(graded?'Reviewed score: '+g.correct+'/'+g.total+'; '+(g.passed?'practice threshold met':'review needed'):'Not yet graded');
    if(firstAttempt)lines.push('First completed attempt: '+firstAttempt.correct+'/'+firstAttempt.total+'; '+(firstAttempt.passed?'practice threshold met':'review needed'));
    lines.push('','Reference: https://denson.github.io/fieldwork/a2a-reference.md','Please check my reasoning and explain one useful next step.');
    $('note').value=lines.join('\n');
  }
  function update(){const r=A2ALab.assess(read());$('result-title').textContent=r.title;$('total').textContent=r.total===null?'':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(r.total)+' total';$('reasons').replaceChildren(...r.reasons.map(s=>el('li',s)));report();}
  function renderFeedback(){
    const g=A2ALab.grade(data.quiz,answers);
    for(const q of data.quiz){const box=$(q.id+'-feedback');box.replaceChildren();box.className='feedback';if(!graded)continue;const ok=answers[q.id]===q.answer;box.classList.toggle('wrong',!ok);box.append(el('p',(ok?'Correct. ':'Review this. ')+q.why),link('Read the source',sourceFor(q)));}
    $('grade').disabled=graded;
    for(const radio of $('quiz').querySelectorAll('input'))radio.disabled=graded;
    $('quiz-result').textContent=graded?'Attempt '+attempt+': '+g.correct+' of '+g.total+'. '+(g.passed?'Practice threshold met.':'Review the explanations, especially the critical questions.')+(attempt>1&&firstAttempt?' First attempt: '+firstAttempt.correct+'/'+firstAttempt.total+'.':''):'';
  }
  $('lessons').replaceChildren();
  data.lessons.forEach((lesson,i)=>{const d=el('details');d.id='lesson-'+(i+1);d.append(el('summary',(i+1)+'. '+lesson.title),el('p',lesson.body),link('Source',lesson.source));$('lessons').append(d);});
  const sourceList=el('ol');data.sources.forEach(s=>{const li=el('li');li.append(link(s.title,s.url));sourceList.append(li);});$('source-list').append(sourceList);
  for(const q of data.quiz){const f=el('fieldset'),legend=el('legend',q.id.slice(1)+'. '+q.question);if(q.critical){const b=el('span','Critical');b.className='badge';legend.append(' ',b);}f.append(legend);q.options.forEach((text,i)=>{const label=el('label'),input=el('input');input.type='radio';input.name=q.id;input.value=String(i);input.addEventListener('change',()=>{answers[q.id]=i;report();});label.append(input,el('span',text));f.append(label);});const feedback=el('div');feedback.id=q.id+'-feedback';feedback.className='feedback';f.append(feedback);$('quiz').append(f);}
  for(const form of [$('purchase'),$('quiz')])form.addEventListener('submit',e=>e.preventDefault());
  $('purchase').addEventListener('input',update);$('purchase').addEventListener('change',update);$('reasoning').addEventListener('input',report);
  const scenarios={normal:{},over:{fee:15},recurring:{price:10,recurring:true},missing:{authorityValid:false},unknown:{payment:'unknown'}};
  document.querySelectorAll('[data-scenario]').forEach(b=>b.addEventListener('click',()=>{apply({...A2ALab.defaults,...scenarios[b.dataset.scenario]});update();}));
  $('grade').addEventListener('click',()=>{const g=A2ALab.grade(data.quiz,answers);if(!g.complete){$('quiz-result').textContent='Answer all eight questions before checking. You have answered '+g.answered+'.';return;}graded=true;if(!firstAttempt)firstAttempt=g;renderFeedback();report();});
  $('retry').addEventListener('click',()=>{answers={};graded=false;attempt++;$('quiz').reset();renderFeedback();report();$('quiz-result').textContent='New practice attempt. Your first completed score is retained.';});
  $('copy').addEventListener('click',async()=>{report();try{await navigator.clipboard.writeText($('note').value);$('save-status').textContent='Review note copied. Paste it into the guide and send when ready.';}catch{$('note').focus();$('note').select();$('save-status').textContent='Select and copy the review note below using your browser’s Copy command.';}});
  $('download').addEventListener('click',()=>{report();const u=URL.createObjectURL(new Blob([$('note').value],{type:'text/markdown;charset=utf-8'})),a=el('a');a.href=u;a.download='a2a-learning-review.md';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);$('save-status').textContent='Your review note was prepared for download.';});
  $('save').addEventListener('click',()=>{try{localStorage.setItem(key,JSON.stringify({version:data.version,purchase:read(),reasoning:$('reasoning').value,answers,graded,firstAttempt,attempt}));$('save-status').textContent='Progress saved on this device. Return to this page in this browser to restore it.';}catch{$('save-status').textContent='This browser could not save progress. Download the review note instead.';}});
  try{const raw=localStorage.getItem(key);if(raw){const s=JSON.parse(raw);if(s.version===data.version&&s.purchase&&s.answers){const clean={};for(const q of data.quiz)if(Number.isInteger(s.answers[q.id])&&s.answers[q.id]>=0&&s.answers[q.id]<q.options.length)clean[q.id]=s.answers[q.id];answers=clean;apply(s.purchase);$('reasoning').value=typeof s.reasoning==='string'?s.reasoning:'';graded=s.graded===true&&A2ALab.grade(data.quiz,answers).complete;firstAttempt=s.firstAttempt&&Number.isInteger(s.firstAttempt.correct)&&s.firstAttempt.correct>=0&&s.firstAttempt.correct<=data.quiz.length?{correct:s.firstAttempt.correct,total:data.quiz.length,passed:s.firstAttempt.passed===true}:null;attempt=Number.isInteger(s.attempt)&&s.attempt>0?s.attempt:1;for(const q of data.quiz)if(Number.isInteger(answers[q.id]))$('quiz').querySelector('input[name="'+q.id+'"][value="'+answers[q.id]+'"]').checked=true;renderFeedback();$('save-status').textContent='Restored the progress you saved on this device.';}else $('save-status').textContent='A previous lesson version was saved. This version starts a fresh practice exercise; your saved data has not been overwritten.';}}
  catch{$('save-status').textContent='Saved progress could not be restored. You can still use the lab and download a note.';}
  update();
})();

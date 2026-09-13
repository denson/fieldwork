(function(){
  'use strict';
  const examples=window.FieldworkBusinessExamples.examples;
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const order=['yard','consulting','toys','bike','property'];
  document.getElementById('business-catalog').innerHTML=order.map((key,i)=>{
    const item=examples[key],name=item.plan.name.split(' — ')[0];
    return `<article class="catalog-card"><div class="card-top"><span class="card-number">${String(i+1).padStart(2,'0')}</span><span class="provenance">${['consulting','toys'].includes(key)?'SBA example · adapted':'Fieldwork original'}</span></div><h3>${esc(item.category)}</h3><p class="example-name">${esc(name)}</p><p>${esc(item.summary)}</p><p class="fit"><b>A useful pattern for</b>${esc(item.fit)}.</p><div class="question"><span>QUESTION TO EXPLORE</span><p>${esc(item.focus)}</p></div><a href="./?demo=business&amp;example=${key}&amp;step=idea" class="card-link" aria-label="Explore ${esc(name)}">Explore this example <span aria-hidden="true">→</span></a></article>`;
  }).join('');
})();

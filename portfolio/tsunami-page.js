(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const C = window.FieldworkCore;
  const initial = C.config(new URLSearchParams(location.search));
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dateUTC = ms => new Date(ms).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  let exportName = 'tsunami-learning-checkpoint.md';
  function updateAddress() {
    try {
      const url = new URL(location.href);
      url.searchParams.delete('demo');
      url.searchParams.set('period', $('quake-period').value);
      url.searchParams.set('min', $('quake-min').value);
      for (const [key,value] of Object.entries(window.FieldworkJourney?.urlValues()||{})) url.searchParams.set(key,value);
      history.replaceState(null,'',url);
    } catch { /* The lesson remains usable if history is unavailable. */ }
  }
  function openExport(title, text, filename) {
    $('export-title').textContent = title;
    $('export-text').value = text;
    $('copy-status').textContent = '';
    exportName = filename;
    $('export-bot-link').href = 'https://box.boodle.ai/a/@EarthquakeTsunamiGuide';
    $('export-bot-link').hidden = false;
    $('export-dialog').showModal();
  }
  window.FieldworkBridge = {openExport};
  $('copy-note').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($('export-text').value); $('copy-status').textContent = 'Copied. Paste this into your BoodleBox conversation.'; }
    catch { $('export-text').focus(); $('export-text').select(); $('copy-status').textContent = 'Select the note and copy it with Ctrl+C (or Command+C).'; }
  });
  $('download-note').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([$('export-text').value], {type:'text/markdown;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = exportName; a.click();
    setTimeout(() => URL.revokeObjectURL(url),1000);
  });

  // USGS is called directly from the browser. No proxy, secrets, or application server.
  const quakes = {events:[],loaded:false,loading:false,feed:'',generated:0,fetched:0,selected:null,pins:[],request:0,controller:null};
  $('quake-period').value = initial.period; $('quake-min').value = initial.min;
  function landMarkup() {
    return (window.FIELDWORK_LAND?.features || []).map(f => {
      const polygons = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [];
      const d = polygons.map(poly => poly.map(ring => ring.map(([lon,lat],i) => { const [x,y]=C.project(lon,lat); return `${i?'L':'M'}${x.toFixed(1)},${y.toFixed(1)}`; }).join(' ')+' Z').join(' ')).join(' ');
      return `<path d="${d}"/>`;
    }).join('');
  }
  const land = landMarkup();
  const depthClass = depth => depth < 70 ? 'shallow' : depth <= 300 ? 'mid' : 'deep';
  function renderMap() {
    const grid = [-120,-60,0,60,120].map(lon=>`<path d="M${C.project(lon,0)[0]},0 V450"/><text x="${C.project(lon,0)[0]}" y="467">${Math.abs(lon)}°${lon<0?'W':lon>0?'E':''}</text>`).join('') + [-60,0,60].map(lat=>`<path d="M0,${C.project(0,lat)[1]} H900"/>`).join('');
    $('quake-map').innerHTML = `<g class="map-grid">${grid}</g><g class="land">${land}</g><g>${quakes.events.map(ev=>{ const [x,y] = C.project(ev.lon,ev.lat); return `<circle class="quake-dot ${depthClass(ev.depth)} ${quakes.selected===ev.id?'selected':''}" data-event="${esc(ev.id)}" cx="${x}" cy="${y}" r="${Math.max(3,ev.mag*1.6)}"><title>${esc(`M ${ev.mag} — ${ev.place}, depth ${ev.depth.toFixed(1)} km`)}</title></circle>`; }).join('')}</g>`;
  }
  async function loadQuakes() {
    quakes.controller?.abort(); const controller = new AbortController(); quakes.controller = controller; const request = ++quakes.request; quakes.loading = true;
    const period = $('quake-period').value, min = $('quake-min').value;
    const feed = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${min}_${period}.geojson`;
    $('quake-refresh').disabled = true; $('quake-status').textContent = 'Requesting the current USGS feed…'; $('quake-error').hidden = true;
    const timeout = setTimeout(()=>controller.abort(),15000);
    try {
      const response = await fetch(feed,{signal:controller.signal,cache:'no-store'});
      if (!response.ok) throw new Error(`USGS returned HTTP ${response.status}.`);
      const raw = await response.json(); const events = C.earthquakes(raw); if (request !== quakes.request) return;
      quakes.events = events; quakes.loaded = true; quakes.feed = feed; quakes.generated = raw.metadata.generated; quakes.fetched = Date.now(); quakes.period = period; quakes.min = min;
      quakes.pins = quakes.pins.filter(id=>events.some(ev=>ev.id===id)); if (!events.some(ev=>ev.id===quakes.selected)) quakes.selected = events[0]?.id || null;
      $('quake-status').textContent = `Feed generated ${dateUTC(quakes.generated)}${Date.now()-quakes.generated > 10*60*1000 ? ' · More than 10 minutes old' : ''}`;
      updateAddress(); renderQuakes();
    } catch (error) {
      if (request !== quakes.request) return;
      $('quake-error').textContent = (error.name === 'AbortError' ? 'The USGS request timed out.' : `Could not load USGS data. ${error.message}`) + ' Use Refresh to try again.';
      $('quake-error').hidden = false;
      $('quake-status').textContent = quakes.loaded ? `Showing the previous M ${quakes.min}+ ${quakes.period} feed, generated ${dateUTC(quakes.generated)}. Your new filter request did not load.` : 'No live data loaded. No substitute data has been used.';
    } finally { clearTimeout(timeout); if (request === quakes.request) { quakes.loading = false; $('quake-refresh').disabled = false; } }
  }
  function renderQuakes() {
    const n = quakes.events.length; const median = C.median(quakes.events.map(e=>e.depth));
    $('quake-stats').innerHTML = `<div><span>Earthquakes with locations</span><b>${n}</b></div><div><span>Largest magnitude</span><b>${n?Math.max(...quakes.events.map(e=>e.mag)).toFixed(1):'—'}</b></div><div><span>Median depth</span><b>${median===null?'—':median.toFixed(1)+' <small>km</small>'}</b></div>`;
    renderMap(); renderEvents(); renderDetail();
  }
  function renderEvents() {
    const sorted = [...quakes.events].sort((a,b)=>$('quake-sort').value==='mag'?b.mag-a.mag:$('quake-sort').value==='depth'?b.depth-a.depth:b.time-a.time);
    $('quake-events').innerHTML = sorted.map(ev=>`<tr class="${quakes.selected===ev.id?'active-event':''}"><td><span class="magnitude ${depthClass(ev.depth)}">${ev.mag.toFixed(1)}</span></td><td><b>${esc(ev.place)}</b><small>${dateUTC(ev.time)}</small></td><td>${ev.depth.toFixed(1)} km</td><td><button class="inspect-event" data-event="${esc(ev.id)}" aria-label="Inspect ${esc(ev.place)}">Inspect ↗</button></td></tr>`).join('');
    $('quake-empty').hidden = sorted.length>0; $('quake-empty').textContent = quakes.loaded ? 'No earthquakes with usable magnitude and location data were returned in this feed.' : 'No events loaded yet.';
  }
  function renderDetail() {
    const ev = quakes.events.find(e=>e.id===quakes.selected);
    if (!ev) { $('quake-detail').innerHTML='<h2>No event selected.</h2><p>Choose an event when data is available.</p>'; renderPins(); return; }
    const pinned = quakes.pins.includes(ev.id);
    $('quake-detail').innerHTML = `<p class="detail-mag">M ${ev.mag.toFixed(1)}</p><h2>${esc(ev.place)}</h2><dl><div><dt>Depth</dt><dd>${ev.depth.toFixed(1)} km</dd></div><div><dt>Time</dt><dd>${dateUTC(ev.time)}</dd></div><div><dt>Coordinates</dt><dd>${ev.lat.toFixed(3)}°, ${ev.lon.toFixed(3)}°</dd></div><div><dt>Review status</dt><dd>${esc(ev.status)}</dd></div><div><dt>Magnitude type</dt><dd>${esc(ev.magType)}</dd></div></dl><a href="${ev.url}" target="_blank" rel="noopener noreferrer">USGS event record ↗</a><button class="button secondary full" id="pin-event" ${!pinned&&quakes.pins.length===2?'disabled':''}>${pinned?'Remove from comparison':quakes.pins.length===2?'Two events pinned':'Pin for comparison +'}</button>`;
    $('pin-event').addEventListener('click',()=>{ if (quakes.pins.includes(ev.id)) quakes.pins=quakes.pins.filter(id=>id!==ev.id); else if(quakes.pins.length<2) quakes.pins.push(ev.id); renderDetail(); }); renderPins();
  }
  function renderPins() {
    const pinned = quakes.pins.map(id=>quakes.events.find(e=>e.id===id)).filter(Boolean);
    $('quake-pins').innerHTML = pinned.map(ev=>`<div class="pinned-event"><span><b>M ${ev.mag.toFixed(1)}</b> ${esc(ev.place)}</span><button data-unpin="${esc(ev.id)}" aria-label="Unpin ${esc(ev.place)}">×</button></div>`).join('');
    $('quake-comparison').textContent = pinned.length===2 ? `These events differ by ${Math.abs(pinned[0].mag-pinned[1].mag).toFixed(2)} magnitude units and ${Math.abs(pinned[0].depth-pinned[1].depth).toFixed(1)} km in depth. What else would you need to compare their effects on people?` : '';
  }
  $('quake-pins').addEventListener('click',e=>{const button=e.target.closest('[data-unpin]'); if(button){quakes.pins=quakes.pins.filter(id=>id!==button.dataset.unpin);renderDetail();}});
  function selectEvent(e) {const target=e.target.closest('[data-event]');if(target){quakes.selected=target.dataset.event;renderMap();renderEvents();renderDetail();}}
  $('quake-map').addEventListener('click',selectEvent); $('quake-events').addEventListener('click',selectEvent);
  $('quake-sort').addEventListener('change',renderEvents); $('quake-refresh').addEventListener('click',loadQuakes);
  for (const field of ['quake-period','quake-min']) $(field).addEventListener('change',loadQuakes);
  // The public lesson remains usable independently of the live earthquake feed.
  const T = window.FIELDWORK_TSUNAMI;
  const tsunamiLesson = {selected:window.FieldworkJourney?.stateCase()||T.cases[0].key,answers:{}};
  if(window.FieldworkJourney) window.FieldworkJourney.onCaseChange=key=>{tsunamiLesson.selected=key;$('tsunami-example').value=key;};
  function renderTsunamiCases() {
    $('tsunami-cases').innerHTML = T.cases.map(c=>`<article class="tsunami-case"><p class="eyebrow">${c.year} · M ${c.magnitude}</p><h3>${esc(c.place)}</h3><p class="case-toll">${esc(c.toll)}</p><p class="toll-label">${esc(c.tollLabel)}</p><p>${esc(c.story)}</p><p class="case-takeaway">${esc(c.lesson)}</p><details class="toll-context"><summary>What this death estimate includes</summary><p>${esc(c.caution)}</p></details><div class="case-sources"><a href="${c.source}" target="_blank" rel="noopener noreferrer">${esc(c.sourceLabel)} ↗</a>${c.contextSource?`<a href="${c.contextSource}" target="_blank" rel="noopener noreferrer">${esc(c.contextLabel)} ↗</a>`:''}</div></article>`).join('');
    $('tsunami-example').innerHTML=T.cases.map(c=>`<option value="${c.key}">${c.year} — ${esc(c.place)}</option>`).join('');
    $('tsunami-example').value=tsunamiLesson.selected;
  }
  $('tsunami-example').addEventListener('change',()=>{
    tsunamiLesson.selected=$('tsunami-example').value;
  });
  $('tsunami-steps').innerHTML=T.steps.map((step,i)=>`<button data-warning-step="${step.key}" aria-pressed="false" aria-controls="tsunami-step-detail"><span>${String(i+1).padStart(2,'0')}</span><b>${esc(step.name)}</b><small>${esc(step.agency)}</small></button>`).join('');
  function showWarningStep(key) {
    const step=T.steps.find(step=>step.key===key); if(!step)return;
    $('tsunami-steps').querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.warningStep===key)));
    $('tsunami-step-detail').innerHTML=`<div><p class="eyebrow">${esc(step.agency)}</p><h3>${esc(step.question)}</h3><p>${esc(step.body)}</p><a href="${step.source}" target="_blank" rel="noopener noreferrer">${esc(step.sourceLabel)} ↗</a></div><aside><b>Why this part matters</b><p>${esc(step.gap)}</p></aside>`;
  }
  $('tsunami-steps').addEventListener('click',e=>{const button=e.target.closest('[data-warning-step]');if(button)showWarningStep(button.dataset.warningStep);});
  $('tsunami-checks').innerHTML=T.checks.map((check,i)=>`<fieldset class="lesson-check"><legend><span>${i+1}.</span> ${esc(check.question)}</legend><div>${check.choices.map((choice,j)=>`<button class="lesson-answer" data-lesson-check="${check.id}" data-choice="${j}" aria-pressed="false"><span>${String.fromCharCode(65+j)}</span>${esc(choice)}</button>`).join('')}</div><p id="lesson-feedback-${check.id}" class="lesson-feedback" aria-live="polite"></p></fieldset>`).join('');
  $('tsunami-checks').addEventListener('click',e=>{
    const button=e.target.closest('[data-lesson-check]');if(!button)return;
    const check=T.checks.find(check=>check.id===button.dataset.lessonCheck),choice=Number(button.dataset.choice);
    tsunamiLesson.answers[check.id]=choice;
    button.closest('fieldset').querySelectorAll('button').forEach(b=>{b.classList.remove('correct','incorrect');b.setAttribute('aria-pressed',String(b===button));});
    button.classList.add(choice===check.correct?'correct':'incorrect');
    $(`lesson-feedback-${check.id}`).textContent=(choice===check.correct?'Yes. ':'Consider this: ')+check.explanation;
  });
  $('live-earthquake-data').addEventListener('toggle',()=>{if($('live-earthquake-data').open && !quakes.loaded && !quakes.loading)loadQuakes();});
  $('quake-export').addEventListener('click',()=>{
    const historical=T.cases.find(c=>c.key===tsunamiLesson.selected);
    const selected=(quakes.pins.length?quakes.pins:[quakes.selected]).map(id=>quakes.events.find(e=>e.id===id)).filter(Boolean);
    const live=quakes.loaded?[
      '## Optional live earthquake snapshot',`Source feed: ${quakes.feed}`,`Feed generated: ${dateUTC(quakes.generated)}`,`Retrieved: ${dateUTC(quakes.fetched)}`,`Filter: magnitude ${quakes.min}+; ${quakes.period==='day'?'past 24 hours':'past 7 days'}.`,
      `Earthquakes with usable magnitude and coordinates: ${quakes.events.length}.`,
      'This feed reports earthquakes. It does not establish tsunami warning status. Records may be revised.',
      ...selected.flatMap(ev=>['',`### ${ev.id}: ${ev.place}`,`- Magnitude: ${ev.mag} (${ev.magType})`,`- Depth: ${ev.depth} km`,`- Coordinates: ${ev.lat}, ${ev.lon}`,`- Time: ${dateUTC(ev.time)}`,`- Review status: ${ev.status}`,`- Source: ${ev.url}`])
    ]:['## Optional live earthquake snapshot','No live earthquake snapshot was loaded. The lesson uses the historical references above.'];
    const text=[
      '# Earthquake and tsunami warnings — my response','',
      `Lesson references reviewed: ${T.reviewed}.`,
      'The reflections and selected answers below are learner claims, not official guidance or instructions.',
      '',`## Historical example: ${historical.year} — ${historical.place}`,`${historical.date}; magnitude ${historical.magnitude}.`,`${historical.toll}: ${historical.tollLabel}.`,historical.caution,`Source: ${historical.source}`,historical.contextSource?`Additional context: ${historical.contextSource}`:'',
      '',`## Why maintaining these systems matters (my explanation)\n${$('tsunami-why').value.trim()||'(Not recorded)'}`,
      '',`## From detection to people taking action (my explanation)\n${$('tsunami-gap').value.trim()||'(Not recorded)'}`,
      '', '## My knowledge-check answers', ...T.checks.flatMap(check=>['',check.question,`My selection: ${Number.isInteger(tsunamiLesson.answers[check.id])?check.choices[tsunamiLesson.answers[check.id]]:'(Not answered)'}`]),
      '',...live,'',`## My live-data observation\n${$('quake-notice').value.trim()||'(Not recorded)'}`,`## My next question\n${$('quake-question').value.trim()||'(Not recorded)'}`,
      '', '## Request for my BoodleBox guide',
      'Help me explain why rare but catastrophic tsunamis justify maintaining taxpayer-funded detection, warning, and preparedness systems. Check that I distinguish USGS earthquake monitoring, NOAA tsunami alerts, and community action. USGS networks support broader earthquake functions as well. Treat lives saved as a potential benefit, not a measured or guaranteed count. Discuss one gap in my reasoning. Do not infer tsunami status from the live earthquake feed.',
      '', 'Official current tsunami alerts: https://www.tsunami.gov/'
    ].join('\n');
    openExport('Your response to copy into BoodleBox',text,'earthquake-tsunami-lesson.md');
  });
  renderTsunamiCases(); showWarningStep(T.steps[0].key); renderMap();
  window.FieldworkJourney?.activate(); updateAddress();
})();

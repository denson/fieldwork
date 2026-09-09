(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const C = window.FieldworkCore;
  const cases = window.FIELDWORK_CASES;
  const companionBots = {
    home: {alias:'FieldworkPortfolioGuide',name:'Fieldwork Portfolio Guide'},
    history: {alias:'PuebloHistoryDetective',name:'Pueblo History Detective'},
    quakes: {alias:'EarthquakeTsunamiGuide',name:'Earthquake & Tsunami Guide'},
    budget: {alias:'CommunityBudgetCoach',name:'Community Budget Coach'},
    hearing: {alias:'EastbankHearingGuide',name:'Eastbank Hearing Guide'}
  };
  const initial = C.config(new URLSearchParams(location.search));
  const suggestedTopic=new URLSearchParams(location.search).get('interest');
  const portfolioTopics={history:'Pueblo History Detective',quakes:'Before the wave arrives',budget:'Community Budget Challenge',hearing:'Public Hearing Detective'};
  const portfolioInterest=Object.hasOwn(portfolioTopics,suggestedTopic)?suggestedTopic:'';
  if(portfolioInterest){$('portfolio-interest').hidden=false;$('portfolio-interest').textContent=`You were curious about ${portfolioTopics[portfolioInterest]} in First Steps. Try it below, or choose any other activity.`;}
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dateUTC = ms => new Date(ms).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  const notes = Object.fromEntries(cases.map(c => [c.key, {observation:'', inference:'', question:''}]));
  let activeDemo = initial.demo, currentCase = initial.case, exportName = 'fieldwork-note.md', toastTimer;
  try {
    const stored=JSON.parse(sessionStorage.getItem('fieldwork-history-tab-v1')||'null');
    if(stored&&typeof stored==='object'){
      for(const c of cases)for(const field of ['observation','inference','question'])if(typeof stored.notes?.[c.key]?.[field]==='string')notes[c.key][field]=stored.notes[c.key][field].slice(0,field==='question'?500:700);
      if((initial.demo!=='history'||!new URLSearchParams(location.search).has('case'))&&cases.some(c=>c.key===stored.currentCase))currentCase=stored.currentCase;
    }
  }catch{/* Notes still work if browser storage is unavailable. */}
  function saveHistory(){try{sessionStorage.setItem('fieldwork-history-tab-v1',JSON.stringify({notes,currentCase}));}catch{}}
  window.addEventListener('pagehide',saveHistory);
  saveHistory();
  function toast(message) { $('toast').textContent = message; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').hidden = true, 4000); }
  async function copy(text) { try { await navigator.clipboard.writeText(text); return true; } catch { return false; } }
  function configuredURL(demo, values = {}) {
    const url = new URL(location.href); url.search = ''; url.hash = '';
    url.searchParams.set('demo', demo);
    Object.entries(values).forEach(([key,value]) => url.searchParams.set(key, String(value)));
    return url.href;
  }
  function setAddress(demo, values = {}) { try { history.replaceState(null, '', configuredURL(demo, values)); } catch { /* A file preview can still run when history changes are unavailable. */ } }
  function switchDemo(demo, focus = true) {
    if (activeDemo === 'math' && demo !== 'math') pauseRound();
    activeDemo = demo;
    document.querySelector('.portfolio-return').hidden=demo==='home';
    document.querySelectorAll('.view').forEach(view => view.hidden = view.id !== `${demo}-view`);
    document.querySelectorAll('nav [data-demo]').forEach(link => { if (link.dataset.demo === demo) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current'); });
    const titles = {home:'Fieldwork — learning beyond the chat', history:'Pueblo History Detective — Fieldwork', math:'Dot Lab — Fieldwork', quakes:'Before the wave arrives — Fieldwork', budget:'Community Budget Challenge — Fieldwork', hearing:'Public Hearing Detective — Fieldwork'};
    document.title = titles[demo];
    if (demo === 'history') setAddress(demo, {case:currentCase});
    else if (demo === 'math') setAddress(demo, mathSettings());
    else if (demo === 'quakes') { window.FieldworkJourney?.activate(); setAddress(demo, {period:$('quake-period').value,min:$('quake-min').value,...(window.FieldworkJourney?.urlValues()||{})}); }
    else if (demo === 'budget' || demo === 'hearing') setAddress(demo, window.FieldworkCivic?.urlValues(demo) || {});
    else setAddress('home',portfolioInterest?{interest:portfolioInterest}:{});
    if (demo === 'quakes' && $('live-earthquake-data').open && !quakes.loaded && !quakes.loading) loadQuakes();
    if (focus) { $(`${demo}-title`)?.focus(); window.scrollTo({top:0,behavior:'instant'}); }
  }
  document.querySelectorAll('[data-demo]').forEach(link => link.addEventListener('click', e => { if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return; e.preventDefault(); switchDemo(link.dataset.demo); }));
  function setCompanionLink(id) {
    const link = $(id), bot = companionBots[activeDemo];
    link.hidden = !bot;
    if (bot) { link.href = `https://box.boodle.ai/a/@${bot.alias}`; link.textContent = `Open ${bot.name} ↗`; }
    else link.removeAttribute('href');
  }
  function openExport(title, text, filename) { $('export-title').textContent = title; $('export-text').value = text; $('copy-status').textContent = ''; exportName = filename; setCompanionLink('export-bot-link'); $('export-dialog').showModal(); }
  window.FieldworkBridge = {openExport, toast};
  $('copy-note').addEventListener('click', async () => { if (await copy($('export-text').value)) $('copy-status').textContent = 'Copied. Paste this into your BoodleBox conversation.'; else { $('export-text').focus(); $('export-text').select(); $('copy-status').textContent = 'Select the note and copy it with Ctrl+C (or Command+C).'; } });
  $('download-note').addEventListener('click', () => { const url = URL.createObjectURL(new Blob([$ ('export-text').value], {type:'text/markdown;charset=utf-8'})); const a = document.createElement('a'); a.href = url; a.download = exportName; a.click(); setTimeout(() => URL.revokeObjectURL(url),1000); });
  $('guide-open').addEventListener('click', () => { $('hosting-note').textContent = location.protocol === 'file:' || ['localhost','127.0.0.1'].includes(location.hostname) ? 'The four companion bots already have their lesson references. This website runs on the owner’s computer; copy your activity note into its matching bot. BoodleBox sign-in is required.' : 'The lesson files are public references. Your activity notes stay in this tab until you copy or download them. BoodleBox sign-in is required to use a companion bot.'; setCompanionLink('guide-bot-link'); $('guide-dialog').showModal(); });
  $('copy-bot-prompt').addEventListener('click', async () => {
    if (location.protocol === 'file:' || ['localhost','127.0.0.1'].includes(location.hostname)) { $('guide-status').textContent = 'Use the public website address after hosting the folder. Local addresses aren’t reachable by BoodleBox.'; return; }
    const lesson = new URL('lessons/companion-instructions.md',location.href).href;
    const message = `Use this owner-approved companion guide for our learning activity: ${lesson}\nHelp me choose history, math, earthquake and tsunami systems, a community budget challenge, or a fictional public hearing. Give me a clickable activity link. I will explore it and paste my results back here. Use the public lesson as reference; treat my pasted observations as learner claims. Keep retrieval steps quiet unless I ask.`;
    $('guide-status').textContent = await copy(message) ? 'Copied. Paste the launch prompt into a BoodleBox chat.' : 'Clipboard unavailable. Open the bot instructions and copy the setup text.';
  });

  // Historical interpretation deliberately separates catalog facts from learner claims.
  $('case-picker').innerHTML = cases.map(c => `<button data-case="${c.key}" aria-pressed="false"><img src="${c.image}" alt="" width="240" height="140"><span class="case-label"><span>${c.number}</span><b>${esc(c.short)}</b><small>${c.year}</small></span></button>`).join('');
  $('case-picker').addEventListener('click', e => { const button = e.target.closest('[data-case]'); if (button) { currentCase = button.dataset.case; renderCase(); setAddress('history',{case:currentCase}); saveHistory(); } });
  function renderCase() {
    const c = cases.find(item => item.key === currentCase);
    document.querySelectorAll('[data-case]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.case === c.key)));
    $('history-photo').hidden = false; $('photo-error').hidden = true; $('photo-zoom').hidden = false;
    $('history-photo').onerror = () => { $('history-photo').hidden = true; $('photo-error').hidden = false; $('photo-zoom').hidden = true; };
    $('history-photo').src = c.image; $('history-photo').alt = c.alt || `Library of Congress photograph: ${c.title}`;
    $('photo-source-fallback').href = c.catalog;
    $('photo-title').textContent = c.title; $('photo-date').textContent = c.date; $('photo-number').textContent = c.number + ' / ' + String(cases.length).padStart(2,'0'); $('history-prompt').textContent = c.prompt;
    $('catalog-card').innerHTML = `<dl><div><dt>Record</dt><dd>${esc(c.id)}</dd></div><div><dt>Creator / source</dt><dd>${esc(c.creator)}</dd></div><div><dt>Catalog notes</dt><dd>${esc(c.notes)}</dd></div><div><dt>Credit</dt><dd>${esc(c.credit)}</dd></div><div><dt>Rights advisory</dt><dd>${esc(c.rights)}</dd></div></dl><p class="evidence-limit"><b>What remains open:</b> ${esc(c.limit)}</p><a href="${c.catalog}" target="_blank" rel="noopener noreferrer">Original Library of Congress record ↗</a>`;
    for (const field of ['observation','inference','question']) $(field).value = notes[c.key][field];
    $('history-quiz').innerHTML = c.quiz.map((text,i) => `<button class="quiz-choice" data-answer="${i}"><span>${String.fromCharCode(65+i)}</span>${esc(text)}</button>`).join('');
    $('quiz-feedback').textContent = '';
  }
  for (const field of ['observation','inference','question']) $(field).addEventListener('input', () => {notes[currentCase][field] = $(field).value;saveHistory();});
  $('history-quiz').addEventListener('click', e => { const button = e.target.closest('[data-answer]'); if (!button) return; const c = cases.find(item => item.key === currentCase); const correct = Number(button.dataset.answer) === c.correct; document.querySelectorAll('.quiz-choice').forEach(b => { b.classList.remove('correct','incorrect'); b.removeAttribute('aria-pressed'); }); button.classList.add(correct ? 'correct' : 'incorrect'); button.setAttribute('aria-pressed','true'); $('quiz-feedback').textContent = (correct ? 'Supported. ' : 'Look again. ') + c.explanation; });
  $('photo-zoom').addEventListener('click', () => { const c = cases.find(item => item.key === currentCase); $('zoom-title').textContent = c.title; $('zoom-image').src = c.image; $('zoom-image').alt = $('history-photo').alt; $('zoom-range').value = '100'; $('zoom-image').style.width = '100%'; $('image-dialog').showModal(); });
  $('zoom-range').addEventListener('input', () => $('zoom-image').style.width = $('zoom-range').value + '%');
  $('history-export').addEventListener('click', () => {
    const included = cases.filter(c => c.key === currentCase || Object.values(notes[c.key]).some(Boolean));
    const text = ['# Pueblo History Detective — evidence note', '', 'These are learner observations and inferences, not verified historical conclusions.', ...included.flatMap(c => ['',`## Photograph ${c.number}: ${c.title}`, `Catalog date: ${c.date}`, `Source: ${c.catalog}`, `Credit: ${c.credit}`, '', `### My observations\n${notes[c.key].observation.trim() || '(Not recorded)'}`, `### My inference\n${notes[c.key].inference.trim() || '(Not recorded)'}`, `### My next question\n${notes[c.key].question.trim() || '(Not recorded)'}`, '', `Catalog limitation: ${c.limit}`]), '', '## Request for my BoodleBox guide', 'Help me separate observation from inference. Ask one question that could strengthen my claim, and identify what further evidence would be useful. Do not infer details that I have not described.'].join('\n');
    openExport('Your history evidence note',text,'pueblo-history-evidence.md');
  });

  // The experiment is entirely local. Scores derive from the generated pattern data.
  const math = {status:'idle',round:0,trials:[],deck:[],timer:null,raf:null,settings:null,shownAt:0,answerAt:0,actualMs:0};
  for (const key of ['level','ms','rounds','layout']) $(`math-${key}`).value = String(initial[key]);
  function mathSettings() { return {level:Number($('math-level').value),ms:Number($('math-ms').value),rounds:Number($('math-rounds').value),layout:$('math-layout').value}; }
  const mathPresets = {
    relaxed: {level:1,ms:0,rounds:6,layout:'grouped'},
    steady: {level:1,ms:3000,rounds:6,layout:'mixed'},
    challenge: {level:2,ms:1200,rounds:8,layout:'mixed'}
  };
  function syncMathSetup() {
    const s = mathSettings();
    document.querySelectorAll('[data-math-preset]').forEach(button => {
      const preset = mathPresets[button.dataset.mathPreset];
      button.setAttribute('aria-pressed',String(Object.keys(preset).every(key => preset[key] === s[key])));
    });
    const summary = `${s.level === 1 ? '2–4' : s.level === 2 ? '5–7' : '8–10'} dots · ${s.rounds} rounds · ${s.ms === 0 ? 'No timer' : (s.ms/1000) + ' seconds to look'}`;
    $('math-setup-summary').textContent = summary;
    if (math.status === 'idle') {
      $('lab-mode').textContent = s.layout === 'mixed' ? 'GROUPED + SCATTERED' : s.layout.toUpperCase();
      $('math-ready-description').textContent = s.ms === 0 ? 'Take as long as you like. Hide the dots when you’re ready, then answer.' : `You have ${s.ms/1000} seconds to look at each pattern. Then enter the number you saw.`;
    }
  }
  function resetMath() {
    clearMathTimer(); math.status = 'idle'; math.trials = []; math.deck = []; math.round = 0;
    $('math-settings').disabled = false; $('math-answer').hidden = true; $('math-feedback').hidden = true;
    $('math-summary').hidden = true; $('math-reset').hidden = true; $('round-label').textContent = 'Ready when you are';
    $('dot-stage').innerHTML = '<div class="stage-message"><p class="eyebrow">Find your own pace</p><p class="stage-large">Look. Notice.<br>Take your time.</p><p id="math-ready-description"></p><button class="button lime" data-math="restart">Start the game →</button></div>';
    syncMathSetup();
    if (activeDemo === 'math') setAddress('math',mathSettings());
  }
  $('math-presets').addEventListener('click', e => {
    const button = e.target.closest('[data-math-preset]'); if (!button) return;
    const preset = mathPresets[button.dataset.mathPreset];
    for (const [key,value] of Object.entries(preset)) $(`math-${key}`).value = String(value);
    resetMath();
    $('math-live').textContent = `${button.querySelector('b').textContent} pace selected. Start when ready.`;
  });
  $('math-settings').addEventListener('change', () => { syncMathSetup(); if (activeDemo === 'math') setAddress('math',mathSettings()); });
  function clearMathTimer() { clearTimeout(math.timer); cancelAnimationFrame(math.raf); math.timer = null; math.raf = null; }
  function dotSVG(pattern) { return `<svg viewBox="0 0 600 360" role="img" aria-label="Dot pattern"><g fill="currentColor">${pattern.points.map(([x,y]) => `<circle cx="${x}" cy="${y}" r="16"/>`).join('')}</g></svg>`; }
  function beginMath() { clearMathTimer(); math.settings = mathSettings(); math.deck = C.patterns(math.settings, crypto.getRandomValues(new Uint32Array(1))[0]); math.trials = []; math.round = 0; $('math-settings').disabled = true; $('math-reset').hidden = false; $('math-summary').hidden = true; $('lab-mode').textContent = math.settings.layout === 'mixed' ? 'GROUPED + SCATTERED' : math.settings.layout.toUpperCase(); setAddress('math',math.settings); beginRound(); }
  function beginRound() {
    clearMathTimer(); math.status = 'countdown'; $('math-answer').hidden = true; $('math-feedback').hidden = true;
    $('round-label').textContent = `Round ${math.round + 1} of ${math.deck.length}`;
    $('dot-stage').innerHTML = '<div class="stage-message"><p class="eyebrow">Look at the center</p><span class="fixation" aria-hidden="true">+</span><p>Get ready…</p></div>';
    $('math-live').textContent = 'Get ready for the next pattern.';
    math.timer = setTimeout(() => {
      if (document.hidden || activeDemo !== 'math') { pauseRound(); return; }
      math.status = 'visible'; math.shownAt = performance.now(); $('dot-stage').innerHTML = dotSVG(math.deck[math.round]) + (math.settings.ms === 0 ? '<button class="button lime hide-dots" data-math="hide">I’m ready to answer →</button>' : '');
      math.raf = requestAnimationFrame(() => { math.raf = requestAnimationFrame(() => { if (math.status !== 'visible') return; math.shownAt = performance.now(); if (math.settings.ms > 0) math.timer = setTimeout(hideDots,math.settings.ms); }); });
      $('math-live').textContent = 'The pattern is visible.';
    },1200);
  }
  function hideDots() {
    if (math.status !== 'visible') return;
    math.actualMs = Math.max(0,Math.round(performance.now()-math.shownAt)); clearMathTimer(); math.status = 'answer'; math.answerAt = performance.now();
    $('dot-stage').innerHTML = '<div class="stage-message"><p class="eyebrow">Trust your first impression</p><span class="answer-mark" aria-hidden="true">?</span><p>How many did you see?</p></div>';
    $('math-answer').hidden = false; $('dot-answer').value = ''; $('dot-answer').focus(); $('math-live').textContent = 'Pattern hidden. Enter the number you saw.';
  }
  function pauseRound() {
    if (!['countdown','visible'].includes(math.status)) return;
    clearMathTimer(); math.status = 'paused'; $('dot-stage').innerHTML = '<div class="stage-message"><p class="eyebrow">Experiment paused</p><p class="stage-large">Ready to look again?</p><p>This interrupted exposure will be replayed. No answer has been scored.</p><button class="button lime" data-math="resume">Replay this round →</button></div>';
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseRound(); });
  syncMathSetup();
  $('dot-stage').addEventListener('click', e => { const action = e.target.closest('[data-math]')?.dataset.math; if (action === 'hide') hideDots(); if (action === 'resume') beginRound(); if (action === 'restart') beginMath(); });
  $('answer-form').addEventListener('submit', e => {
    e.preventDefault(); if (math.status !== 'answer' || !$('answer-form').reportValidity()) return;
    const answer = Number($('dot-answer').value); if (!Number.isInteger(answer)) return;
    const p = math.deck[math.round]; const strategy = document.querySelector('input[name="strategy"]:checked').value;
    math.trials.push({round:math.round+1,amount:p.amount,layout:p.layout,answer,strategy,responseMs:Math.round(performance.now()-math.answerAt),actualMs:math.actualMs});
    math.status = 'feedback'; $('math-answer').hidden = true; $('dot-stage').innerHTML = dotSVG(p); $('math-feedback').hidden = false;
    const groupedNote = p.amount <= 4 ? 'This small group uses a familiar arrangement.' : `This pattern splits ${p.amount} into ${Math.floor(p.amount/2)} and ${Math.ceil(p.amount/2)}.`;
    $('math-feedback').innerHTML = `<div><p class="eyebrow">${p.layout} pattern</p><h2>${answer === p.amount ? `Yes, ${p.amount} dots.` : `You entered ${answer}. There were ${p.amount}.`}</h2><p>${p.layout === 'grouped' ? groupedNote : 'The same quantity can feel different when the dots don’t form familiar groups.'}</p></div><button class="button primary" data-math-next>${math.round+1 === math.deck.length ? 'See my results' : 'Next round'} →</button>`;
    $('math-feedback').querySelector('button').focus(); $('math-live').textContent = `There were ${p.amount} dots. ${answer === p.amount ? 'Your answer was correct.' : 'Your answer was different.'}`;
  });
  $('math-feedback').addEventListener('click', e => { if (!e.target.closest('[data-math-next]')) return; math.round++; if (math.round === math.deck.length) finishMath(); else beginRound(); });
  function finishMath() {
    math.status = 'complete'; $('math-settings').disabled = false; $('math-feedback').hidden = true; const correct = math.trials.filter(t => t.amount === t.answer).length;
    $('round-label').textContent = 'Experiment complete'; $('dot-stage').innerHTML = `<div class="stage-message"><p class="eyebrow">Your result</p><p class="result-score">${correct}<span> / ${math.trials.length}</span></p><p>correct answers in this session</p><button class="button lime" data-math="restart">Try another experiment →</button></div>`;
    $('math-summary').hidden = false; const groups = C.summary(math.trials);
    $('math-summary').innerHTML = `<div class="summary-heading"><h2>${math.settings.layout === 'mixed' ? 'Did arrangement make a difference?' : 'What helped you see the number?'}</h2><p>${math.settings.layout === 'mixed' ? 'Compare accuracy and your own reports of counting.' : 'Notice which groups felt familiar. You can repeat this pace or try a gentle timer next.'} Response time includes entering an answer and choosing a strategy.</p></div>${groups.filter(g=>g.count).map(g=>`<div class="summary-row"><b>${g.layout === 'grouped' ? 'Grouped' : 'Scattered'}</b><div class="score-track"><span style="width:${g.correct/g.count*100}%"></span></div><strong>${g.correct}/${g.count}</strong><small>Counted ${g.counted}/${g.count} · ${(g.responseMs/1000).toFixed(1)}s avg.</small></div>`).join('')}<button class="button primary" id="math-export">Make my experiment note ↗</button>`;
    $('math-export').addEventListener('click',exportMath); $('math-export').focus();
  }
  function exportMath() {
    const s = math.settings;
    const rows = C.summary(math.trials).filter(g=>g.count).map(g=>`- ${g.layout}: ${g.correct}/${g.count} correct; counted ${g.counted}/${g.count}; mean response ${(g.responseMs/1000).toFixed(2)} seconds.`);
    const text = ['# Dot Lab — experiment note', '', `Settings: level ${s.level}; ${s.ms === 0 ? 'untimed, user hid each pattern' : s.ms + ' ms requested exposure'}; ${s.rounds} rounds; ${s.layout} patterns.`, '', '## Results', ...rows, '', 'Response time starts when the dots are hidden and includes entering the answer and choosing a strategy. Viewing durations below are browser measurements, not laboratory timing.', '', '| Round | Pattern | Actual dots | Answer | Strategy | Viewing ms | Response ms |','|---|---|---:|---:|---|---:|---:|',...math.trials.map(t=>`| ${t.round} | ${t.layout} | ${t.amount} | ${t.answer} | ${t.strategy} | ${t.actualMs} | ${t.responseMs} |`), '', '## Request for my BoodleBox guide', 'Help me interpret this small experiment without generalizing beyond this session. Compare grouped and scattered patterns if both were tested. Suggest one change for a follow-up experiment while holding the other settings steady.'].join('\n');
    openExport('Your dot experiment note',text,'dot-lab-results.md');
  }
  $('math-reset').addEventListener('click',resetMath);
  $('math-link').addEventListener('click', async () => { const url = configuredURL('math',mathSettings()); if (await copy(url)) toast('Experiment link copied.'); else openExport('Your configured experiment link',url,'dot-lab-link.md'); });

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
  const land = landMarkup(); $('home-map').innerHTML = `<g class="land">${land}</g>`;
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
      if (activeDemo === 'quakes') setAddress('quakes',{period,min,...(window.FieldworkJourney?.urlValues()||{})}); renderQuakes();
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
  renderTsunamiCases(); showWarningStep(T.steps[0].key);
  renderCase(); renderMap(); switchDemo(initial.demo,false);
})();

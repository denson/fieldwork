(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DeviceSupportCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const recipient = 'tech_support@stoagen.com';
  const protocol = 'fieldwork-support-case-v1';
  const max = {short: 300, detail: 2000, items: 30, sources: 20};
  const clean = (value, limit = max.detail) => String(value || '').replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ').trim().slice(0, limit);
  const cleanSubject = value => clean(value, 160).replace(/\n/g, ' ');
  const cleanBody = value => clean(value, 500000);
  const mailto = (subject, body) => `mailto:${recipient}?subject=${encodeURIComponent(cleanSubject(subject))}&body=${encodeURIComponent(cleanBody(body))}`;
  const blank = () => ({version: 1, goal: '', device: '', environment: '', observations: [], checks: [], sources: [], questions: [], nextStep: ''});
  const words = (list, limit = max.items) => Array.isArray(list) ? list.slice(0, limit).map(x => clean(x)).filter(Boolean) : [];
  function source(value) {
    if (!value || typeof value !== 'object') return null;
    let url;
    try { url = new URL(value.url); } catch { return null; }
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.href.length > 2000) return null;
    return {title: clean(value.title, max.short) || url.hostname, url: url.href, note: clean(value.note), status: ['candidate', 'read', 'user-confirmed'].includes(value.status) ? value.status : 'candidate'};
  }
  function check(value) {
    if (!value || typeof value !== 'object') return null;
    const step = clean(value.step);
    if (!step) return null;
    return {step, outcome: clean(value.outcome), status: ['suggested', 'tried', 'skipped'].includes(value.status) ? value.status : 'suggested'};
  }
  function normalize(value) {
    if (!value || typeof value !== 'object' || value.version !== 1) throw Error('This case file is not a supported version.');
    const result = blank();
    for (const key of ['goal','device','environment','nextStep']) result[key] = clean(value[key]);
    result.observations = words(value.observations);
    result.questions = words(value.questions);
    result.checks = Array.isArray(value.checks) ? value.checks.slice(0,max.items).map(check).filter(Boolean) : [];
    result.sources = Array.isArray(value.sources) ? value.sources.slice(0,max.sources).map(source).filter(Boolean) : [];
    return result;
  }
  function parsePacket(raw) {
    const text = clean(raw, 18000);
    const match = text.match(/```fieldwork-support-case-v1\s*\n([\s\S]*?)\n```/i);
    const body = match ? match[1] : text.trim().startsWith('{') ? text : null;
    if (!body) throw Error('Paste the complete case-update block from the guide.');
    let value;
    try { value = JSON.parse(body); } catch { throw Error('The case update is not valid JSON. Ask the guide to prepare it again.'); }
    if (value?.fieldwork !== protocol || value.version !== 1 || value.updateType !== 'proposal') throw Error('This is not a supported device-support update.');
    const update = normalize(value);
    if (!update.goal && !update.device && !update.environment && !update.nextStep && !update.observations.length && !update.checks.length && !update.sources.length && !update.questions.length) throw Error('The case update is empty.');
    return update;
  }
  function merge(current, proposed) {
    const original = normalize(current), update = normalize(proposed);
    const result = {...original};
    for (const key of ['goal','device','environment','nextStep']) if (update[key]) result[key] = update[key];
    for (const key of ['observations','questions']) result[key] = [...new Set([...original[key],...update[key]])].slice(0,max.items);
    result.checks = [...original.checks];
    for (const item of update.checks) if (!result.checks.some(existing => existing.step === item.step)) result.checks.push(item);
    result.checks = result.checks.slice(0,max.items);
    result.sources = [...original.sources];
    for (const item of update.sources) if (!result.sources.some(existing => existing.url === item.url)) result.sources.push({...item,status:'candidate'});
    result.sources = result.sources.slice(0,max.sources);
    return result;
  }
  function brief(value) {
    const c = normalize(value);
    const lines = ['DEVICE SUPPORT CASE — confirmed information and open questions',`Goal: ${c.goal || 'Unknown'}`,`Device: ${c.device || 'Not yet identified'}`,`Environment: ${c.environment || 'Unknown'}`];
    if (c.observations.length) lines.push('Observed: '+c.observations.join(' | '));
    if (c.checks.length) lines.push('Checks: '+c.checks.map(x => `${x.step} [${x.status}${x.outcome ? ': '+x.outcome : ''}]`).join(' | '));
    if (c.questions.length) lines.push('Open questions: '+c.questions.join(' | '));
    if (c.sources.length) lines.push('Source links: '+c.sources.map(x => `${x.url} [${x.status}]`).join(' | '));
    lines.push(`Next step under discussion: ${c.nextStep || 'Undecided'}`,'Please use these facts to ask the next useful question or suggest one safe check. Do not treat suggested checks or candidate links as verified outcomes.');
    return lines.join('\n').slice(0, 16000);
  }
  const section = (heading, entries) => `## ${heading}\n${entries.length ? entries.map(x => '- '+x).join('\n') : '- Not yet known'}\n`;
  function markdown(value) {
    const c = normalize(value);
    return `# Device support case\n\n${section('Goal',[c.goal].filter(Boolean))}\n${section('Device and environment',[c.device&&`Device: ${c.device}`,c.environment&&`Environment: ${c.environment}`].filter(Boolean))}\n${section('What the person observed',c.observations)}\n${section('Checks and actual outcomes',c.checks.map(x => `${x.status.toUpperCase()}: ${x.step}${x.outcome ? ` — Outcome: ${x.outcome}` : ' — No outcome recorded'}`))}\n${section('Sources',c.sources.map(x => `[${x.title}](${x.url}) — ${x.status}${x.note ? `; ${x.note}` : ''}`))}\n${section('Open questions',c.questions)}\n${section('Next step',[c.nextStep].filter(Boolean))}\nAI suggestions and candidate links above are not confirmation that a check was performed or that a source was read. Please review the case and advise on the next step.\n`;
  }
  const subject = value => `[Stoagen support] ${cleanSubject(value.device || value.goal || 'Device help request').slice(0, 110)}`;
  return {recipient,protocol,blank,normalize,parsePacket,merge,brief,markdown,subject,mailto,clean,cleanSubject,cleanBody};
});

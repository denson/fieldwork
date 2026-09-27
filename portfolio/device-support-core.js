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
  function isCaseFile(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || value.version !== 1) return false;
    if (['goal','device','environment','nextStep'].some(key => typeof value[key] !== 'string')) return false;
    if (['observations','questions'].some(key => !Array.isArray(value[key]) || value[key].some(item => typeof item !== 'string'))) return false;
    if (!Array.isArray(value.checks) || value.checks.some(item => !item || typeof item.step !== 'string' || typeof item.outcome !== 'string' || !['suggested','tried','skipped'].includes(item.status))) return false;
    if (!Array.isArray(value.sources) || value.sources.some(item => !source(item))) return false;
    return true;
  }
  function parsePacket(raw) {
    const text = clean(raw, 18000);
    const match = text.match(/```fieldwork-support-case-v1\s*\n([\s\S]*?)\n```/i);
    const body = match ? match[1] : text.trim().startsWith('{') ? text : null;
    if (!body) {
      const lines=text.replace(/\r/g,'').split('\n'),start=lines.findIndex(line=>/^\s*\*{0,2}Case note for review\*{0,2}\s*$/i.test(line));
      if(start<0)throw Error('Paste the complete “Case note for review” from the guide.');
      const proposed=blank();
      for(const line of lines.slice(start+1)){
        const entry=line.match(/^\s*[-*•]\s+(?:\*\*)?([A-Za-z ]+):(?:\*\*)?\s*(.+?)\s*$/);
        if(!entry){if(line.trim())break;continue;}
        const label=entry[1].toLowerCase(),value=entry[2].trim();if(!value)continue;
        if(label==='goal')proposed.goal=value;
        else if(label==='device')proposed.device=value;
        else if(label==='environment')proposed.environment=value;
        else if(label==='observed')proposed.observations.push(value);
        else if(label==='open question')proposed.questions.push(value);
        else if(label==='next step')proposed.nextStep=value;
        else if(label==='suggested check')proposed.checks.push({step:value,status:'suggested',outcome:''});
        else if(label==='tried check'){
          const parts=value.split(/\s+[—–-]\s+Result:\s*/i);proposed.checks.push({step:parts[0],status:'tried',outcome:parts[1]||''});
        }else if(label==='source to check'){
          const url=value.match(/https?:\/\/[^\s)<>]+/i)?.[0];
          if(url)proposed.sources.push({title:'Source to check',url,note:value.replace(url,'').replace(/^[\s\[\]()—–-]+|[\s\[\]()—–-]+$/g,''),status:'candidate'});
        }
      }
      const update=normalize(proposed);
      if (!update.goal && !update.device && !update.environment && !update.nextStep && !update.observations.length && !update.checks.length && !update.sources.length && !update.questions.length) throw Error('That case note has no usable details yet.');
      return update;
    }
    let value;
    try { value = JSON.parse(body); } catch { throw Error('That older case update could not be read. Ask the guide for a new case note.'); }
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
  return {recipient,protocol,blank,normalize,isCaseFile,parsePacket,merge,brief,markdown,subject,mailto,clean,cleanSubject,cleanBody};
});

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DeviceSupportCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const recipient = 'tech_support@stoagen.com';
  const cleanSubject = value => String(value || '').replace(/[\r\n\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 160);
  const cleanBody = value => String(value || '').replace(/\r\n?/g, '\n').trim().slice(0, 30000);
  const mailto = (subject, body) => `mailto:${recipient}?subject=${encodeURIComponent(cleanSubject(subject))}&body=${encodeURIComponent(cleanBody(body))}`;

  function formDraft(values) {
    const goal = cleanBody(values.goal);
    if (!goal) return null;
    const device = cleanBody(values.device) || 'Unknown';
    const details = [
      ['Device and model', device],
      ['Environment and connected equipment', values.environment],
      ['What I observed or heard', values.symptoms],
      ['When it began or what changed', values.changes],
      ['What I tried and what happened', values.attempts],
      ['What still needs clarification', values.unknowns]
    ].filter(([label, value]) => label === 'Device and model' || cleanBody(value));
    const body = `Hello,\n\nI need help with: ${goal}\n\n${details.map(([label, value]) => `${label}: ${cleanBody(value)}`).join('\n')}\n\nPlease advise how to proceed. Thank you.`;
    const shortDevice = cleanSubject(device).slice(0, 75);
    return { subject: cleanSubject(`[Stoagen support] ${shortDevice}`), body };
  }

  function parseGuideDraft(input) {
    const text = cleanBody(input).replace(/^```[^\n]*\n|\n```$/g, '');
    if (!text) return null;
    const lines = text.split('\n');
    const field = line => line.replace(/^\s*(?:[-*]\s*)?(?:\*\*)?/,'').replace(/\*\*/g, '').trim();
    const recipientIndex = lines.findIndex(line => /^(?:recipient|to):\s*/i.test(field(line)));
    const subjectIndex = lines.findIndex(line => /^subject:\s*/i.test(field(line)));
    const bodyIndex = lines.findIndex(line => /^body:\s*/i.test(field(line)));
    if (recipientIndex < 0 && subjectIndex < 0 && bodyIndex < 0) return { subject: '[Stoagen support] Device help request', body: text };
    if (subjectIndex < 0 || bodyIndex < 0 || subjectIndex >= bodyIndex) throw new Error('Paste the complete request with Subject and Body, or paste only the message body.');
    if (recipientIndex >= 0) {
      const to = field(lines[recipientIndex]).replace(/^(?:recipient|to):\s*/i,'').trim().toLowerCase();
      if (to !== recipient) throw new Error('The pasted request has a different recipient. Check it before using this page.');
    }
    const subject = cleanSubject(field(lines[subjectIndex]).replace(/^subject:\s*/i,''));
    if (!subject) throw new Error('The pasted request needs a subject.');
    const firstBody = field(lines[bodyIndex]).replace(/^body:\s*/i,'');
    const rest = lines.slice(bodyIndex + 1);
    const end = rest.findIndex(line => /^\s*END SUPPORT REQUEST\s*$/i.test(line));
    const body = cleanBody([firstBody, ...rest.slice(0, end < 0 ? undefined : end)].join('\n'));
    if (!body) throw new Error('The pasted request needs a message body.');
    return { subject, body };
  }

  const completeRequest = (subject, body) => `Recipient: ${recipient}\nSubject: ${cleanSubject(subject)}\nBody:\n${cleanBody(body)}\nEND SUPPORT REQUEST\n`;
  return { recipient, cleanSubject, cleanBody, mailto, formDraft, parseGuideDraft, completeRequest };
});

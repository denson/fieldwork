const {test} = require('node:test');
const assert = require('node:assert/strict');
const core = require('../device-support-core.js');

test('site form makes a concise editable request without inventing device facts', () => {
  const draft = core.formDraft({goal:'The screen stays black',device:'',environment:'',symptoms:'',changes:'',attempts:'',unknowns:''});
  assert.equal(draft.subject,'[Stoagen support] The screen stays black');
  assert.match(draft.body,/I need help with: The screen stays black/);
  assert.match(draft.body,/Device and model: Unknown/);
  assert.doesNotMatch(draft.body,/startup|battery|operating system|Not yet provided/i);
});

test('guide request preserves its subject, body and supported recipient', () => {
  const draft = core.parseGuideDraft('Recipient: tech_support@stoagen.com\nSubject: [Stoagen support] Printer — error 42\nBody:\nHello,\nThe printer says error 42.\nThank you.\nEND SUPPORT REQUEST');
  assert.equal(draft.subject,'[Stoagen support] Printer — error 42');
  assert.equal(draft.body,'Hello,\nThe printer says error 42.\nThank you.');
  assert.deepEqual(core.parseGuideDraft(core.completeRequest(draft.subject,draft.body)),draft);
  const link=new URL(core.mailto(draft.subject,draft.body));
  assert.equal(link.pathname,'tech_support@stoagen.com');
  assert.deepEqual([...link.searchParams.keys()],['subject','body']);
  assert.equal(link.searchParams.get('body'),draft.body);
});

test('guide paste rejects a different recipient and malformed headers', () => {
  assert.throws(()=>core.parseGuideDraft('Recipient: stranger@example.com\nSubject: Help\nBody:\nHello'),/different recipient/);
  assert.throws(()=>core.parseGuideDraft('Subject: Help\nNo body marker'),/complete request/);
  assert.equal(core.parseGuideDraft('Just the problem description').body,'Just the problem description');
  assert.equal(core.cleanSubject('Laptop\r\nBcc: stranger@example.com'),'Laptop  Bcc: stranger@example.com');
});

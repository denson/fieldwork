(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const core = window.DeviceSupportCore;
  const fieldNames = ['goal', 'device', 'environment', 'symptoms', 'changes', 'attempts', 'unknowns'];
  const status = message => { $('status').textContent = message; };
  const tooLong = () => $('open-email').href.length > 1800;
  function updateLink() {
    $('subject').value = core.cleanSubject($('subject').value);
    $('open-email').href = core.mailto($('subject').value, $('body').value);
    $('long-note').hidden = !tooLong();
    $('open-email').setAttribute('aria-disabled', tooLong() ? 'true' : 'false');
  }
  function review(draft) {
    $('subject').value = draft.subject;
    $('body').value = draft.body;
    $('review').hidden = false;
    updateLink();
    $('review-heading').focus();
    status('Your request is ready to review. No email has been sent.');
  }
  $('support-form').addEventListener('submit', event => {
    event.preventDefault();
    if (!$('support-form').reportValidity()) return;
    if (!$('review').hidden && !window.confirm('Replace the email draft below with these form details? Edits made directly in the draft will be replaced.')) return;
    review(core.formDraft(Object.fromEntries(fieldNames.map(id => [id, $(id).value]))));
  });
  $('use-pasted').addEventListener('click', () => {
    if (!$('pasted').value.trim()) { status('Paste the request from your guide first.'); $('pasted').focus(); return; }
    if (!$('review').hidden && !window.confirm('Replace the email draft below with this pasted request?')) return;
    try { review(core.parseGuideDraft($('pasted').value)); }
    catch (error) { status(error.message); $('pasted').focus(); }
  });
  $('subject').addEventListener('input', updateLink);
  $('body').addEventListener('input', updateLink);
  $('open-email').addEventListener('click', event => {
    updateLink();
    if (tooLong()) { event.preventDefault(); status('Use Copy request for this long email, then paste it into your email app.'); return; }
    status('Check your email app, review the draft and press Send there. If it did not open, use Copy request.');
  });
  const completeRequest = () => core.completeRequest($('subject').value, $('body').value);
  $('copy-request').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(completeRequest()); status('Copied recipient, subject and message. Paste them into your email app and review before sending.'); }
    catch { $('body').focus(); $('body').select(); status('Clipboard access was unavailable. Copy the selected message manually, with the recipient and subject shown above.'); }
  });
  $('download-request').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([completeRequest()],{type:'text/plain;charset=utf-8'}));
    const link = document.createElement('a'); link.href = url; link.download = 'stoagen-support-request.txt'; link.click();
    setTimeout(() => URL.revokeObjectURL(url),1000);
    status('A text-file download was requested. Check your downloads for the saved copy.');
  });
})();

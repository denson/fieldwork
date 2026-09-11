const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const js=fs.readFileSync(path.join(root,'business.js'),'utf8');
const css=fs.readFileSync(path.join(root,'business.css'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');

test('device persistence is explicit and includes portable backup controls',()=>{
  assert.match(js,/id="business-device-save"/);
  assert.match(js,/fieldwork-business-device-opt-in-v2/);
  assert.match(js,/fieldwork-business-tab-v1/);
  assert.match(js,/removeItem\(deviceKey\)/);
  assert.match(js,/id="business-download-backup"/);
  assert.match(js,/id="business-import-backup"/);
  assert.match(js,/accept="application\/json,\.json"/);
});

test('learner review and reviewer feedback are separate routes',()=>{
  assert.match(js,/reviewerMode=params\.get\('reviewer'\)==='1'/);
  assert.match(js,/step=review&reviewer=1/);
  assert.match(js,/reviewerMode\?feedbackPanel\(\)/);
  assert.match(js,/YOUR PLANNING BRIEF/);
});

test('responsive, progress and print contracts remain present',()=>{
  assert.match(js,/setAttribute\('aria-label'/);
  assert.match(js,/dataset\.status/);
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/@media print/);
  assert.match(css,/break-inside:avoid/);
});

test('cache-busted entrypoints load the upgraded business assets',()=>{
  for(const asset of ['business.css?v=20260910-chatfirst','business-core.js?v=20260910-chatfirst','business.js?v=20260910-chatfirst'])assert.ok(html.includes(asset));
});

test('chat-first start and three complete example choices are visible',()=>{
  assert.match(js,/CHAT FIRST/);
  assert.match(js,/Use this draft/);
  assert.match(js,/Object\.entries\(C\.examples\)/);
  assert.match(css,/business-example-grid/);
});

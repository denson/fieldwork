const assert=require('node:assert/strict');
const R=require('../../chrome-extension/routing.js');
const base='https://denson.github.io/colorado-weed-field-guide/';
for(const path of ['', 'companion/?plant=poison-hemlock&compare=western-water-hemlock','plants/poison-hemlock/','safety/#weed-lists','coverage/']){
  assert.equal(R.destination(base+path),base+path);
  assert.equal(R.combo(base+path).companion,'ColoradoWeedGuide');
}
for(const bad of ['https://denson.github.io/other-site/','https://denson.github.io/colorado-weed-field-guide-other/','https://other.github.io/colorado-weed-field-guide/','http://denson.github.io/colorado-weed-field-guide/','https://user:secret@denson.github.io/colorado-weed-field-guide/','https://denson.github.io/colorado-weed-field-guide/../private/','https://denson.github.io/colorado-weed-field-guide/%2fother/']){
  assert.equal(R.destination(bad),null,bad);assert.equal(R.isActivity(bad),false,bad);
}
assert.equal(R.destination(base+'companion/plants/poison-hemlock.json'),null);
const left={id:1,windowId:2,splitViewId:5,url:'https://box.boodle.ai/c/test'};
const right={id:2,windowId:2,splitViewId:5,url:base+'companion/'};
assert.equal(R.paired(left,[left,right]).tabId,2);
assert.equal(R.pairedChat(right,[left,right]).tabId,1);
assert.equal(R.paired(left,[left,{...right,url:'https://denson.github.io/another-site/'}]).reason,'different-site');
console.log('Weed routing: exact HTTPS project, paired panes, new guide, data-file and unrelated-site rejection passed.');

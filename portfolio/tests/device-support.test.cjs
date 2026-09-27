const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../device-support-core.js');
const S=require('../../chrome-extension/support-packet.js');

const packet=value=>'```fieldwork-support-case-v1\n'+JSON.stringify({fieldwork:C.protocol,version:1,updateType:'proposal',...value})+'\n```';

test('a generic, unknown device remains unknown and the case can be sent as Markdown',()=>{
  const c=C.blank();c.goal='The screen stays black';c.observations=['The power light is on'];
  const text=C.markdown(c);
  assert.match(text,/Device: Not yet known|Not yet known/);
  assert.match(text,/The power light is on/);
  assert.doesNotMatch(text,/battery|startup procedure/i);
  assert.equal(new URL(C.mailto(C.subject(c),text)).pathname,C.recipient);
});

test('reviewed update preserves source link and never upgrades a candidate or suggested check',()=>{
  const raw=packet({device:'Printer X100',sources:[{title:'Maker support',url:'https://maker.example/manual',note:'Possible error guide',status:'read'}],checks:[{step:'Read the display',status:'tried',outcome:'Error 42'}]});
  assert.ok(S.parse(raw));
  const proposed=C.parsePacket(raw),caseFile=C.merge(C.blank(),proposed);
  assert.equal(caseFile.sources[0].url,'https://maker.example/manual');
  assert.equal(caseFile.sources[0].status,'candidate');
  assert.equal(caseFile.checks[0].status,'tried');
  assert.equal(caseFile.checks[0].outcome,'Error 42');
  assert.match(C.markdown(caseFile),/CANDIDATE|candidate/);
});

test('plain-language case note stages facts, attempted checks, and a candidate link',()=>{
  const raw=`Here is the next question.\n\nCase note for review\n- Device: Printer, model unknown\n- Observed: Error 42 appears when printing\n- Tried check: Restarted once — Result: Error 42 remains\n- Source to check: https://maker.example/help — possible support page\n- Open question: What is the exact model?\n- Next step: Read the model label`;
  const proposal=S.parse(raw),site=C.parsePacket(raw);
  assert.ok(proposal);assert.equal(proposal.device,'Printer, model unknown');
  assert.equal(site.checks[0].status,'tried');assert.equal(site.checks[0].outcome,'Error 42 remains');
  assert.equal(site.sources[0].url,'https://maker.example/help');assert.equal(site.sources[0].status,'candidate');
  assert.equal(site.questions[0],'What is the exact model?');
  assert.doesNotMatch(raw,/```|\{\s*"fieldwork"/);
});

test('new suggestions cannot overwrite a completed check or duplicate a source',()=>{
  const c=C.blank();c.checks=[{step:'Restart once',status:'tried',outcome:'No change'}];c.sources=[{title:'Guide',url:'https://maker.example/guide',note:'',status:'user-confirmed'}];
  const next=C.merge(c,C.normalize({version:1,checks:[{step:'Restart once',status:'suggested'}],sources:[{title:'Different',url:'https://maker.example/guide',status:'candidate'}]}));
  assert.deepEqual(next.checks,c.checks);assert.deepEqual(next.sources,c.sources);
});

test('packets reject unsupported versions, unsafe links, and empty updates',()=>{
  assert.throws(()=>C.parsePacket(packet({version:2,device:'Phone'})),/not a supported/);
  assert.throws(()=>C.parsePacket(packet({})),/empty/);
  assert.equal(S.parse(packet({device:'Phone',sources:[{url:'javascript:alert(1)'}]})),null);
  assert.equal(C.parsePacket(packet({device:'Phone',sources:[{url:'javascript:alert(1)'}]})).sources.length,0);
});

test('JSON and Markdown carry the same human-confirmed case facts',()=>{
  const c=C.normalize({version:1,goal:'Print a page',device:'Printer X100',environment:'Windows 11',observations:['Error 42'],checks:[{step:'Read display',status:'tried',outcome:'Error 42'}],sources:[{title:'Maker',url:'https://maker.example/manual',status:'read',note:'Error table'}],questions:['Which firmware?'],nextStep:'Check model label'});
  const restored=C.normalize(JSON.parse(JSON.stringify(c))),markdown=C.markdown(restored);
  assert.equal(C.isCaseFile(restored),true);
  assert.deepEqual(restored,c);
  for(const value of ['Print a page','Printer X100','Windows 11','Error 42','https://maker.example/manual','Which firmware?','Check model label'])assert.ok(markdown.includes(value),value);
});

test('a partial or malformed backup cannot replace a working case',()=>{
  assert.equal(C.isCaseFile({version:1}),false);
  assert.equal(C.isCaseFile({...C.blank(),observations:'Error 42'}),false);
  assert.equal(C.isCaseFile({...C.blank(),sources:[{url:'javascript:alert(1)'}]}),false);
});

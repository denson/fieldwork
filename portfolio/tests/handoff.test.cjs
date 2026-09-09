const assert=require('node:assert/strict');
const H=require('../first-handoff.js');
const F=require('../start-core.js');
function bus(){const peers=new Set();return {open(){const c={onmessage:null,postMessage(data){for(const p of peers)if(p!==c)queueMicrotask(()=>p.onmessage?.({data:structuredClone(data)}));},close(){peers.delete(c);}};peers.add(c);return c;}};}
const state={pass:'abcd1234',badge:'lantern',topic:'quakes',step:'return'};
function peer(b,id,s,onReceive,canReceive=()=>true){return H.connect({id,createChannel:()=>b.open(),getState:()=>s,canReceive,onReceive,discoveryMs:12,ackMs:20});}
(async()=>{
  let b=bus(),changes=0;
  let receiver=peer(b,'original',state,()=>{changes++;return true;}),sender=peer(b,'link',state,()=>{},()=>false);
  assert.equal((await sender.offer(state)).status,'applied');assert.equal(changes,1);receiver.close();sender.close();
  b=bus();changes=0;
  receiver=peer(b,'different',{...state,pass:'different1'},()=>changes++);sender=peer(b,'link',state,()=>{},()=>false);
  assert.equal((await sender.offer(state)).status,'missing');assert.equal(changes,0);receiver.close();sender.close();
  b=bus();changes=0;
  const one=peer(b,'one',state,()=>changes++),two=peer(b,'two',state,()=>changes++);sender=peer(b,'link',state,()=>{},()=>false);
  assert.equal((await sender.offer(state)).status,'ambiguous');assert.equal(changes,0);one.close();two.close();sender.close();
  b=bus();receiver=peer(b,'original',state,()=>false);sender=peer(b,'link',state,()=>{},()=>false);
  assert.equal((await sender.offer(state)).status,'unconfirmed');receiver.close();sender.close();
  b=bus();changes=0;const changing={...state};receiver=peer(b,'original',changing,()=>changes++);sender=peer(b,'link',state,()=>{},()=>false);
  const flight=sender.offer(state);setTimeout(()=>{changing.topic='budget';},5);
  assert.equal((await flight).status,'unconfirmed');assert.equal(changes,0);receiver.close();sender.close();
  b=bus();changes=0;receiver=peer(b,'original',state,()=>changes++);const intruder=b.open();
  intruder.postMessage({type:'apply',from:'other',to:'original',request:'forged',state});await new Promise(r=>setTimeout(r,2));assert.equal(changes,0);receiver.close();intruder.close();
  const absent=H.connect({id:'none',createChannel(){throw Error('unsupported');}});assert.equal((await absent.offer(state)).status,'unavailable');
  const base='http://127.0.0.1:4173/start.html';assert.equal(new URL(F.directURL(base,state)).searchParams.get('here'),'1');assert.ok(F.note(base,state).includes(F.directURL(base,state)));
  console.log('Handoff: matching receiver, no receiver, ambiguous receivers, missing ACK, changed choices, unsolicited messages, unavailable channel, and direct-copy fallback passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});

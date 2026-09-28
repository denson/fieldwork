const {test}=require('node:test');
const assert=require('node:assert/strict');
const R=require('../../chrome-extension/routing.js');
const Service=require('../../chrome-extension/registry-service.js');
const current=require('../companion-registry.json');

test('a new approved page and guide need only a website registry edit',()=>{
  assert.equal(R.setRegistry(current),true);
  const extra={site:'fieldwork',path:'/future-lesson.html',alias:'FutureLessonGuide',name:'Future Lesson Guide',launch:true};
  assert.equal(R.setRegistry({...current,routes:[...current.routes,extra]}),true);
  const url='https://denson.github.io/fieldwork/future-lesson.html';
  assert.equal(R.combo(url).companion,'FutureLessonGuide');
  assert.equal(R.workspace('FutureLessonGuide'),url);
  assert.equal(R.profileAlias('https://box.boodle.ai/a/@FutureLessonGuide'),'FutureLessonGuide');
  assert.equal(R.destination('https://evil.example/fieldwork/future-lesson.html'),null);
  assert.equal(R.setRegistry({...current,routes:[...current.routes,{...extra,path:'/../bad.html'}]}),false);
  assert.equal(R.setRegistry(current),true);
});

test('the extension checks the website registry and can use its last valid copy offline',async()=>{
  let stored={},clock=0,fetches=0,offline=false;
  const chrome={storage:{local:{get:async key=>({[key]:stored[key]}),set:async data=>{stored={...stored,...data};}}}};
  const fetcher=async()=>{fetches++;if(offline)throw Error('offline');return {ok:true,json:async()=>current};};
  const service=Service.create({chrome,R,fetcher,now:()=>clock});
  assert.equal((await service.load()).version,1);
  await service.load();assert.equal(fetches,1);
  clock=31000;offline=true;
  assert.equal((await service.load()).version,1);
  assert.equal(fetches,2);
  assert.equal(stored.fieldworkPairingRegistry.version,1);
});

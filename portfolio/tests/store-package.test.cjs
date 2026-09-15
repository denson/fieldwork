const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const {buildFiles}=require('../../chrome-extension/store-build.cjs');
const files=buildFiles(),manifest=JSON.parse(files.get('manifest.json'));
test('store build limits access and routing to the published websites',()=>{
  assert.equal(manifest.version,'0.10.1');assert.equal(manifest.manifest_version,3);assert.ok(manifest.description.length<=132);
  assert.deepEqual(manifest.permissions,['storage','tabs']);
  assert.deepEqual(manifest.host_permissions,['https://box.boodle.ai/*','https://denson.github.io/*']);
  assert.ok(manifest.content_scripts.flatMap(s=>s.matches).every(s=>s.startsWith('https://')));
  const context={URL,module:{exports:{}}};vm.runInNewContext(files.get('routing.js').toString(),context);const R=context.module.exports;
  assert.equal(R.combo('https://denson.github.io/fieldwork/?demo=business').companion,'BusinessPlanFirstSteps');
  assert.equal(R.combo('https://denson.github.io/colorado-weed-field-guide/').companion,'ColoradoWeedGuide');
  for(const url of ['http://localhost:4173/?demo=business','http://127.0.0.1:4173/?demo=business','https://denson.github.io/another-project/']){assert.equal(R.destination(url),null);assert.equal(R.isActivity(url),false);}
});
test('store runtime is complete, readable and contains no build files or remote script loading',()=>{
  for(const [name,bytes] of files){assert.ok(!name.includes('..'));assert.ok(!/store-build|package-store|README|\.md$|\.py$/.test(name));if(name.endsWith('.js')){
    const source=bytes.toString();new vm.Script(source,{filename:name});
    assert.doesNotMatch(source,/\beval\s*\(|new\s+Function\s*\(|\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon/);
    for(const match of source.matchAll(/importScripts\(([^)]+)\)/g))for(const quoted of match[1].matchAll(/'([^']+)'/g))assert.ok(files.has(quoted[1]),quoted[1]);
  }}
  for(const match of files.get('popup.html').toString().matchAll(/(?:src|href)="([^"#]+)"/g))if(!match[1].startsWith('https://'))assert.ok(files.has(match[1]),match[1]);
  assert.match(files.get('popup.html').toString(),/extension-privacy\.html/);
});
test('all declared icon sizes are real PNG files with the expected dimensions',()=>{
  for(const size of [16,32,48,128]){const png=files.get(manifest.icons[size]);assert.ok(png);assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),size);assert.equal(png.readUInt32BE(20),size);}
  assert.equal(manifest.homepage_url,'https://denson.github.io/fieldwork/extension.html');
});

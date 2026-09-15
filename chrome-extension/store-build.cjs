'use strict';
// Store uploads contain only public-site runtime files. The checkout also supports local development.
const fs=require('node:fs'),path=require('node:path');
const publicHosts=['https://box.boodle.ai/*','https://denson.github.io/*'];
const publicPages=['https://denson.github.io/fieldwork/*','https://denson.github.io/colorado-weed-field-guide/*'];
const runtimeFiles=['background.js','routing.js','business-draft.js','draft.js','connection.js','connection-client.js','transition.js','transition-client.js','content.js','content.css','activity.js','activity.css','popup.html','popup.js','popup.css'];
function buildFiles(root=__dirname){
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
  manifest.host_permissions=publicHosts;
  manifest.content_scripts[1].matches=publicPages;
  const files=new Map([['manifest.json',Buffer.from(JSON.stringify(manifest,null,2)+'\n')]]);
  for(const name of [...runtimeFiles,...new Set(Object.values(manifest.icons))])files.set(name,fs.readFileSync(path.join(root,name)));
  const routing=files.get('routing.js').toString('utf8'),local="const origins=['http://127.0.0.1:4173','http://localhost:4173'];";
  if(!routing.includes(local))throw Error('Local routing declaration changed; review the store build.');
  files.set('routing.js',Buffer.from(routing.replace(local,'const origins=[];')));
  for(const entry of [manifest.background.service_worker,manifest.action.default_popup,...Object.values(manifest.action.default_icon),...manifest.content_scripts.flatMap(s=>[...s.js,...s.css])])if(!files.has(entry))throw Error('Missing runtime file: '+entry);
  return files;
}
if(require.main===module){
  const target=process.argv[2];if(!target)throw Error('Usage: node chrome-extension/store-build.cjs OUTPUT_FOLDER');
  const resolved=path.resolve(target);
  if(fs.existsSync(resolved)&&fs.readdirSync(resolved).length)throw Error('Use a new or empty folder to prevent stale upload files.');
  for(const [name,data]of buildFiles()){const file=path.join(resolved,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,data);}
  console.log('Store runtime prepared at '+resolved);
}
module.exports={buildFiles,publicHosts,publicPages};

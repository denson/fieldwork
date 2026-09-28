const R=require('../../chrome-extension/routing.js');
if(!R.setRegistry(require('../companion-registry.json')))throw Error('Invalid website pairing registry');
module.exports=R;

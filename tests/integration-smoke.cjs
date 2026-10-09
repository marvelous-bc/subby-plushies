'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('node:assert/strict');
const base = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(base, 'SubbysPlushies.user.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(base, 'version.json'), 'utf8'));
assert.equal(manifest.version, '3.3.5-beta.1');
assert.ok(manifest.downloadUrl.includes('/beta/SubbysPlushies.user.js'));
assert.match(src, /\{ name: "Eva", image: plushAsset\("eva\.png"\) \}/);
assert.match(src, /const EXTENSIONS_TABS = Object\.freeze\(\["status", "lore",/);
assert.doesNotMatch(src, /function nearestPlushSnap\(/);
assert.match(src, /function renderExtensionsLore\(/);
assert.match(src, /makeExtensionsSection\("Subby's Wardrobe • curated beta"\)/);
assert.match(src, /get wardrobe\(\) \{ return window\.SubbysWardrobeCurated \|\| null; \}/);
for (const id of ['Subbycat','Ale','M','Izneas','Lyra','Eva']) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  assert.match(src, new RegExp(`\\{ name: "${escaped}", image: plushAsset\\(`));
}
function mock(afterInit = true) {
  const tasks=[];
  const ctx={console:{warn(){},log(){},error(){},table(){}},setTimeout(cb,delay){tasks.push({cb,delay});return tasks.length},clearTimeout(){},
    document:{documentElement:{setAttribute(){},getAttribute(){return null}}},
    CanvasDrawImage(src){return src;}, DrawImage(src){return src;},
  };
  ctx.window=ctx;
  if (afterInit) initGame(ctx);
  return {ctx,tasks};
}
function initGame(root) {
  root.Asset=[];root.AssetGroup=[];
  root.AssetGet=(f,g,n)=>root.Asset.find(x=>x.Group?.Name===g&&x.Name===n);
  for (const name of ['HairAccessory2','Necklace']) {
    const g={Name:name,Family:'Female3DCG',Category:'Appearance',Clothing:true,Asset:[]};
    const a={Name:`BCExisting${name}`,Group:g,Layer:[{Name:'Base'}]};
    g.Asset.push(a);root.AssetGroup.push(g);root.Asset.push(a);
  }
}
{
  const {ctx}=mock();
  vm.runInNewContext(src,ctx,{timeout:5000});
  assert.equal(ctx.SubbysWardrobeCurated.status,'registered-experimental');
  assert.equal(ctx.Asset.length,4);
  assert.equal(ctx.SubbysWardrobeCurated.registered.length,2);
  assert.equal(ctx.Asset.filter(a=>a.Name.startsWith('BCExisting')).length,2);
  assert.equal(ctx.SubbysWardrobeCurated.createItem, undefined);
  assert.ok(ctx.DrawImage('Assets/Female3DCG/HairAccessory2/SubbyCatHeadband_Base.png').startsWith('data:image/png;base64,'));
  assert.equal(ctx.DrawImage('Assets/Female3DCG/HairAccessory2/EchoAsset.png'),'Assets/Female3DCG/HairAccessory2/EchoAsset.png');
  vm.runInNewContext(src,ctx,{timeout:5000});
  assert.equal(ctx.Asset.length,4,'Wardrobe does not add duplicates');
  console.log('PASS combined script: two curated assets registered once; BC/Echo untouched');
}
{
  const {ctx,tasks}=mock(false);
  vm.runInNewContext(src,ctx,{timeout:5000});
  assert.equal(ctx.SubbysWardrobeCurated.status,'waiting-or-disabled');
  assert.equal(ctx.Asset,undefined);
  initGame(ctx);
  const firstWardrobePoll=tasks.find(t=>t.delay===250);
  assert.ok(firstWardrobePoll,'Wardrobe retries after BC registry appears');
  firstWardrobePoll.cb();
  assert.equal(ctx.SubbysWardrobeCurated.status,'registered-experimental');
  console.log('PASS combined script: starts before BC and registers when ready');
}
console.log('PASS static checks: beta manifest, Eva, lore, no-snap, integration UI/API');

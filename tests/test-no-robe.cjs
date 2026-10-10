'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'SubbysPlushies.user.js'),'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root,'data/wardrobe/color-layers.json'),'utf8'));
let count = 0;
const ok = (condition, label) => { assert.ok(condition, label); count++; };
const equal = (actual, expected, label) => { assert.equal(actual, expected, label); count++; };
const get = (start, end) => {
 const a = source.indexOf(start); const b = source.indexOf(end, a);
 assert.ok(a >= 0 && b > a, `missing segment: ${start}`);
 return source.slice(a,b);
};
for (const forbidden of ['SubbyCozyRobe','WARDROBE_POSE_','wearRobe','robeSizes','Suit/', 'PoseMapping: { ...WARDROBE_POSE_MAPPING }']) {
 ok(!source.includes(forbidden), `No unused robe code: ${forbidden}`);
}
const names = ['SubbyCatHeadband','SubbyHeartCharm'];
equal(Object.keys(manifest.items).length,2,'Only 2 assets in color manifest');
for (const name of names) {
 ok(fs.existsSync(path.join(root,'assets/wardrobe',name+'.png')), 'Composite exists for '+name);
 ok(manifest.items[name] && manifest.items[name].zones, 'Layer manifest available for '+name);
 ok(!manifest.items[name].poses, 'No poses for '+name);
}
for(const f of fs.readdirSync(path.join(root,'assets/wardrobe'))) ok(!/robe/i.test(f),'No robe artwork: '+f);
const state = new Map([
 ['SubbysPlushies:beta:wardrobe-placements:v4',JSON.stringify({
  SubbyCatHeadband:{left:177,top:55}, SubbyHeartCharm:{left:200,top:222},
  SubbyCozyRobe:{left:900,top:900}})]
]);
const w = { localStorage:{getItem:key=>state.has(key)?state.get(key):null,setItem:(key,value)=>state.set(key,value)},
 setTimeout:()=>1, clearTimeout:()=>{} };
const script = `const REPOSITORY_RAW_ROOT = 'https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main';\n`+
 get('    const WARDROBE_ASSET_ROOT', '    // The Appearance picker may consult BC\'s loaded translation table directly,')+
 get('    function wardrobeSpriteForPath(path) {','    Object.defineProperty(window, "SubbysWardrobeCurated",')+
 `this.probe={WARDROBE_ITEMS, WARDROBE_LAYER_IMAGES, wardrobePlacements, wardrobePlacement, wardrobeSpriteForPath, wardrobeEarlyLayerPromise, wardrobeSetPlacement};`;
const context=vm.createContext({
 window:w, AbortController, console, fetch:async url=>{
  equal(url,'https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/data/wardrobe/color-layers.json','Fetch correct URL');
  return {ok:true,json:async()=>manifest};
 }
});
(async()=>{
 vm.runInContext(script,context);
 const p=context.probe;
 equal(await p.wardrobeEarlyLayerPromise,true,'Remote color layers loaded');
 equal(p.WARDROBE_ITEMS.length,2,'Exactly two accessory definitions');
 equal(p.WARDROBE_ITEMS.map(e=>e.group).join(','),'HairAccessory2,Necklace','No Suit group');
 equal(Object.keys(p.wardrobePlacements).length,2,'Removed robe from saved placement data');
 equal(p.wardrobePlacements.SubbyCatHeadband.left,177,'Preserved accessory coordinates');
 equal(p.wardrobePlacements.SubbyHeartCharm.top,222,'Preserved second accessory coordinates');
 ok(!state.get('SubbysPlushies:beta:wardrobe-placements:v4').includes('SubbyCozyRobe'),'Persisted localStorage cleaned');
 equal(p.wardrobeSpriteForPath('Assets/Female3DCG/HairAccessory1/SubbyCatHeadband_Bow.png'),
  p.WARDROBE_LAYER_IMAGES.get('SubbyCatHeadband').get('Bow'),'HairAccessory1 alias routes correct layer');
 equal(p.wardrobeSpriteForPath('Assets/Female3DCG/HairAccessory2/SubbyCatHeadband_0.png'),
  p.WARDROBE_LAYER_IMAGES.get('SubbyCatHeadband').get('OuterEars'),'Numeric layer works');
 equal(p.wardrobeSpriteForPath('Assets/Female3DCG/Necklace/SubbyHeartCharm_Heart.png'),
  p.WARDROBE_LAYER_IMAGES.get('SubbyHeartCharm').get('Heart'),'Necklace layer routes');
 equal(p.wardrobeSpriteForPath('Assets/Female3DCG/Suit/SubbyCozyRobe_Fabric.png'),null,'Old robe sprite no longer intercepted');
 equal(p.wardrobeSpriteForPath('Assets/Female3DCG/HairAccessory1/SubbyCatHeadband.png'),
  'https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/assets/wardrobe/SubbyCatHeadband.png','One PNG for headband');
 equal(p.wardrobeSpriteForPath('Assets/Female3DCG/Necklace/Preview/SubbyHeartCharm.png'),
  'https://raw.githubusercontent.com/marvelous-bc/subby-plushies/main/assets/wardrobe/SubbyHeartCharm.png','One PNG for necklace');
 // Extract and execute the actual native registration loop with a mock BC runtime.
 const registration=get('    function setupWardrobeAssets() {','    function ensureExtendedCallbacks() {');
 const assets=new Map(); const groups=new Map([['HairAccessory2',{Name:'HairAccessory2'}],['Necklace',{Name:'Necklace'}]]);
 const reg=vm.createContext({
 WARDROBE_ITEMS:p.WARDROBE_ITEMS, wardrobeState:{status:'waiting',registered:[],errors:[],methods:[],attempted:false},
 wardrobePlacement:p.wardrobePlacement, FAMILY:'Female3DCG',
 findRuntimeAssetGroup:name=>groups.get(name),
 window:{ AssetGet:(family,group,name)=>assets.get(`${group}/${name}`)||null },
 callAssetAdd:(def,grp,name)=>assets.set(`${name}/${def.Name}`,{
  ...def, Group:{Name:name}, Layer:def.Layer.map(l=>({...l}))}),
 ensureWardrobePickerCatalog:()=>{}, wardrobeNeutralizeHeight:()=>{},
 wardrobeRepairLayerNamesCache:()=>{}, wardrobeRepairAssetText:()=>{}, warn:(...a)=>{throw new Error(a.join(' '))}, log:()=>{},
 });
 vm.runInContext(registration+'\nthis.register=setupWardrobeAssets;',reg);
 equal(reg.register(),true,'Wardrobe registration succeeds');
 equal(assets.size,2,'Only two assets registered');
 ok([...assets.keys()].every(k=>!k.startsWith('Suit/')),'No Suit assets registered');
 equal(assets.get('HairAccessory2/SubbyCatHeadband').Layer.length,4,'Headband has 4 color layers');
 equal(assets.get('Necklace/SubbyHeartCharm').Layer.length,2,'Necklace has 2 color layers');
 ok([...assets.values()].every(a=>a.HeightModifier===0),'Neither accessory shifts character height');
 console.log(`PASS: ${count} checks; no robe registered, both accessories functional`);
})().catch(error=>{console.error(error);process.exitCode=1});

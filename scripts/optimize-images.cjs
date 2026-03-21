const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.resolve('src','assets');
const heroes = ['hero-1.jpg','hero-2.jpg','hero-3.jpg','hero-4.jpg'];

async function resize(file, widths=[800,400]){
  const src = path.join(assetsDir,file);
  if(!fs.existsSync(src)) return console.warn('missing',src);
  const img = await Jimp.read(src);
  for(const w of widths){
    const clone = img.clone();
    await clone.resize(w, Jimp.AUTO).quality(78);
    const outName = file.replace('.jpg', `-${w}.jpg`);
    const outPath = path.join(assetsDir,outName);
    await clone.writeAsync(outPath);
    console.log('wrote', outPath);
  }
}

(async ()=>{
  for(const h of heroes){
    try{ await resize(h); }catch(e){ console.error('error',h,e); }
  }
})();

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const assetsDir = path.resolve('src','assets');
const heroes = ['hero-1.jpg','hero-2.jpg','hero-3.jpg','hero-4.jpg'];

async function run(){
  for(const h of heroes){
    const src = path.join(assetsDir,h);
    try{
      await fs.access(src);
    }catch(e){
      console.warn('missing',src);
      continue;
    }
    const base = h.replace('.jpg','');
    const out800 = path.join(assetsDir, `${base}-800.jpg`);
    const out400 = path.join(assetsDir, `${base}-400.jpg`);
    await sharp(src).resize({ width: 1200 }).jpeg({ quality: 78 }).toFile(out800);
    console.log('wrote', out800);
    await sharp(src).resize({ width: 600 }).jpeg({ quality: 64 }).toFile(out400);
    console.log('wrote', out400);
  }
}

run().catch(e=>{ console.error(e); process.exit(1); });

// Export the exact in-game PCM for listening/reuse. No external audio dependency.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),context=vm.createContext({AudioEngine:{}});
vm.runInContext(fs.readFileSync(path.join(root,'js/audio/cave-deaths.js'),'utf8'),context);
const output=path.join(root,'assets/audio/cave');fs.mkdirSync(output,{recursive:true});
for(const kind of vm.runInContext('Object.keys(CAVE_DEATH_VOICES)',context)) {
  const pcm=vm.runInContext(`caveDeathPCM('${kind}')`,context),rate=24000,bytes=pcm.length*2,wav=Buffer.alloc(44+bytes);
  wav.write('RIFF');wav.writeUInt32LE(bytes+36,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);
  wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);
  wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(bytes,40);
  let peak=0,energy=0;for(let i=0;i<pcm.length;i++){if(!Number.isFinite(pcm[i]))throw Error(kind+': invalid sample');peak=Math.max(peak,Math.abs(pcm[i]));energy+=pcm[i]*pcm[i];wav.writeInt16LE(Math.round(pcm[i]*32767),44+i*2);}
  if(peak>.7||energy/pcm.length<.00001)throw Error(kind+': clipping or silence');
  fs.writeFileSync(path.join(output,kind+'-death.wav'),wav);
  console.log(`${kind}: ${(pcm.length/rate).toFixed(2)}s, peak ${peak.toFixed(3)}, RMS ${Math.sqrt(energy/pcm.length).toFixed(3)}`);
}

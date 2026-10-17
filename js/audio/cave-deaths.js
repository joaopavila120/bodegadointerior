// Layered creature death cues: organic vocal fold, breath, impact and short cave echo.
// PCM is built once per species; no fetch is needed when opening index.html locally.
'use strict';
const CAVE_DEATH_VOICES = {
  javali:    { seconds:1.12, pitch:[390,720,180,70], throat:1.7, rasp:.48, trem:27, body:.85 },
  sanguanel: { seconds:1.36, pitch:[740,1020,420,115], throat:2.4, rasp:.2, trem:13, spirit:.25, body:.25 },
  boitata:   { seconds:1.48, pitch:[190,260,85,35], throat:.8, rasp:1.1, trem:17, fire:true, body:.3 },
  lobisomem: { seconds:1.7, pitch:[165,310,240,65], throat:2.1, rasp:.48, trem:5, body:1 },
  mula:     { seconds:1.5, pitch:[430,690,310,110], throat:1.8, rasp:.38, trem:19, fire:true, body:.9 },
  teiniagua:{ seconds:1.12, pitch:[850,1210,460,140], throat:1.1, rasp:.42, trem:24, spirit:.42, body:.15 },
  onca:     { seconds:1.25, pitch:[190,260,110,48], throat:3.2, rasp:.85, trem:31, body:.8 },
  anhanga:  { seconds:1.8, pitch:[370,480,255,155], throat:1.3, rasp:.12, trem:4, spirit:.65, body:.35 }
};
function caveDeathPCM(kind, rate=24000, seed=173) {
  const v=CAVE_DEATH_VOICES[kind]||CAVE_DEATH_VOICES.javali, tail=.42;
  const samples=new Float32Array(Math.ceil((v.seconds+tail)*rate));
  let phase=0,breath=0,rumble=0,previous=0,rng=seed>>>0;
  const random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296*2-1;};
  for(let i=0;i<Math.ceil(v.seconds*rate);i++) {
    const t=i/rate,p=t/v.seconds,s=Math.min(2,Math.floor(p*3)),k=p*3-s;
    const f=v.pitch[s]*(1-k)+v.pitch[s+1]*k;
    phase+=Math.PI*2*f*(1+.022*Math.sin(t*34)+.012*random())/rate;
    const white=random();breath+=.24*(white-breath);rumble+=.025*(white-rumble);
    // Irregular voiced harmonics and breath avoid a pure electronic glissando.
    const folds=Math.tanh(1.6*(Math.sin(phase)+.36*Math.sin(phase*2+.7)+.18*Math.sin(phase*3)));
    const throat=Math.sin(phase*v.throat+.55*Math.sin(phase*.53));
    const pulse=.74+.26*Math.sin(t*Math.PI*2*v.trem+1.8*Math.sin(t*9));
    const attack=1-Math.exp(-t*45),release=Math.pow(Math.max(0,1-p),1.3);
    let voice=(folds*.3+throat*.14)*pulse+(breath*.8+rumble*.6)*v.rasp;
    if(v.fire)voice=voice*.35+breath*.9+(Math.abs(white)>.994?white*.55:0);
    if(v.spirit)voice+=v.spirit*(Math.sin(phase*1.003)*.25+Math.sin(phase*2.503)*.17)*(1-p*.4);
    const fall=Math.max(0,t-.13),thud=t>.13?v.body*(Math.sin(2*Math.PI*(76*fall-25*fall*fall))*.35+rumble*.8)*Math.exp(-fall*15):0;
    previous+=.62*((voice*attack*release+thud)-previous);
    samples[i]=previous;
  }
  // Feed-forward reflections, no persistent delay graph or accumulating feedback.
  const dry=samples.slice();
  for(const [seconds,gain] of [[.087,.15],[.173,.08],[.281,.035]]) {
    const offset=Math.round(seconds*rate);for(let i=offset;i<samples.length;i++)samples[i]+=dry[i-offset]*gain;
  }
  let peak=0;for(const s of samples)peak=Math.max(peak,Math.abs(s));
  const gain=.68/Math.max(.68,peak);for(let i=0;i<samples.length;i++)samples[i]*=gain;
  return samples;
}
Object.assign(AudioEngine,{
  caveDeathCache:new Map(),caveDeathSources:new Set(),
  caveDeath(kind) {
    if(!this.on||!this.ctx||this.ctx.state!=='running')return false;
    const c=this.ctx;
    if(!this.caveDeathCache.has(kind)) {
      const pcm=caveDeathPCM(kind),buffer=c.createBuffer(1,pcm.length,24000);buffer.copyToChannel(pcm,0);
      this.caveDeathCache.set(kind,buffer);
    }
    // Limit simultaneous deaths from a wide swing without burying every other sound.
    while(this.caveDeathSources.size>=4){const first=this.caveDeathSources.values().next().value;first.stop();this.caveDeathSources.delete(first);}
    const source=c.createBufferSource(),gain=c.createGain();source.buffer=this.caveDeathCache.get(kind);
    source.playbackRate.value=.96+Math.random()*.08;
    const filter=c.createBiquadFilter(),now=c.currentTime;
    filter.type='lowpass';filter.frequency.value=2200;filter.Q.value=.5;
    gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.14/Math.sqrt(1+this.caveDeathSources.size),now+.035);
    source.connect(filter);filter.connect(gain);gain.connect(this.out());this.caveDeathSources.add(source);
    source.onended=()=>{this.caveDeathSources.delete(source);source.disconnect();filter.disconnect();gain.disconnect();};source.start();return true;
  }
});

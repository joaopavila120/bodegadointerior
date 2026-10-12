// Sistema e síntese de áudio, reprodução de trilhas sonoras e efeitos
'use strict';

const AudioEngine={ctx:null,master:null,on:true,music:true,tracks:null,stepClock:0,hissClock:0,noiseBuffer:null,whiteBuffer:null,loops:{},fxBus:null,ambientBus:null,bus:null,musicVol:1,ambientVol:1,fxVol:1,popClock:0,glugClock:0,fireClock:0,mooClock:6,
 initMusic(){if(this.tracks)return;this.tracks=MUSIC_DATA.map(src=>{const audio=new Audio(src);audio.loop=true;audio.preload='metadata';audio.volume=.12;const track={audio,pending:false,blocked:false};audio.addEventListener('error',()=>{track.blocked=true;if(!this.musicError){this.musicError=true;say('Não foi possível carregar a música. Os efeitos sonoros continuam disponíveis.');}});return track;});},
 syncMusic(){if(!this.tracks)return;for(const t of this.tracks)t.audio.volume=.12*this.musicVol*(this.sceneQuiet?.3:1);const active=this.on&&this.music&&started&&!paused&&!G.bocce?.paused&&!modal&&!document.hidden,region=this.musicRegion(),index=region==='sc'?2:region==='serra'?3:['open','closing'].includes(G.phase)?1:0;this.tracks.forEach((track,i)=>{const a=track.audio;if(!active||i!==index){if(!a.paused)a.pause();return;}if(a.paused&&!track.pending&&!track.blocked){track.pending=true;a.play().catch(error=>{if(error.name!=='AbortError')track.blocked=true;}).finally(()=>{track.pending=false;});}});},
 // Região do Sadi: no mapa de SC ou da Serra, ou num interior (casa, salão, baile) que se abre a partir deles.
 musicRegion(){if(!worldOut)return null;const here=worldOut.map,back=worldOut.back?.map;if(!WORLD_MAPS[here]?.indoor)this.outdoor=here;else if(back&&!WORLD_MAPS[back]?.indoor)this.outdoor=back;return ['sc','serra'].includes(this.outdoor)?this.outdoor:null;},
 unlock(){this.initMusic();this.tracks.forEach(track=>{if(!track.audio.error)track.blocked=false;});this.syncMusic();if(!this.ctx){try{this.ctx=new(window.AudioContext||window.webkitAudioContext)();this.master=this.ctx.createGain();this.master.gain.value=.48;this.master.connect(this.ctx.destination);this.fxBus=this.ctx.createGain();this.fxBus.gain.value=this.fxVol;this.fxBus.connect(this.master);this.ambientBus=this.ctx.createGain();this.ambientBus.gain.value=this.ambientVol;this.ambientBus.connect(this.master);this.noiseBuffer=this.ctx.createBuffer(1,this.ctx.sampleRate,this.ctx.sampleRate);const data=this.noiseBuffer.getChannelData(0);let previous=0;for(let i=0;i<data.length;i++){previous=(previous+Math.random()*.16-.08)*.98;data[i]=previous;}this.whiteBuffer=this.ctx.createBuffer(1,this.ctx.sampleRate*2,this.ctx.sampleRate);const white=this.whiteBuffer.getChannelData(0);for(let i=0;i<white.length;i++)white[i]=Math.random()*2-1;}catch(e){return;}}if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});},
 note(freq,duration=.12,type='triangle',volume=.035,delay=0){if(!this.on||!this.ctx||this.ctx.state!=='running')return;const now=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),now+.01);g.gain.exponentialRampToValueAtTime(.0001,now+duration);o.connect(g);g.connect(this.out());o.start(now);o.stop(now+duration+.02);},
 noise(duration=.1,volume=.08,frequency=1300){if(!this.on||!this.ctx)return;const source=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter(),gain=this.ctx.createGain(),now=this.ctx.currentTime;source.buffer=this.noiseBuffer;filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=.7;gain.gain.setValueAtTime(volume,now);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);source.connect(filter);filter.connect(gain);gain.connect(this.out());source.start(now);source.stop(now+duration);},
 tick(){this.note(650,.055,'triangle',.06);this.note(920,.04,'sine',.025,.035);},
 ready(){this.note(784,.16,'sine',.08);this.note(1046,.24,'triangle',.07,.12);},
 bad(){this.note(174,.13,'triangle',.1);this.note(130,.24,'triangle',.09,.1);},
 warning(){this.note(880,.1,'square',.025);this.note(880,.12,'square',.025,.16);},
 coins(){[1046,1318,1568,2093].forEach((f,i)=>this.note(f,.16,'sine',.07,i*.055));},
 glass(){this.note(1760,.3,'sine',.085);this.note(2600,.2,'sine',.025,.025);},
 chop(){this.note(120,.07,'triangle',.13);this.pop(1700,.24,.05);this.pop(3300,.12,.03);setTimeout(()=>{this.pop(2600,.08,.03);this.pop(1300,.07,.04);},60);},
 press(){this.note(90,.2,'sawtooth',.035);this.note(240,.05,'triangle',.08,.12);this.hiss(.9,.11,4200,.1);},
 sizzle(){this.noise(.35,.13,2600);},
 grain(){this.noise(.055,.22,2700);},
 scaleDone(){[659,880,1318].forEach((f,i)=>this.note(f,.13,'sine',.07,i*.08));},
 gulp(){this.note(280,.11,'sine',.08);this.note(180,.13,'sine',.06,.08);},
 boost(){[392,494,587,784,988].forEach((f,i)=>this.note(f,.14,'triangle',.065,i*.055));this.noise(.25,.1,1200);},
 drop(){this.note(115,.09,'triangle',.11);},
 trash(){this.noise(.15,.22,700);this.note(85,.12,'triangle',.07);},
 // Pano esfregando a mesa (vai e vem) e, no fim, louça recolhida e o brilho de limpo.
 scrub(){if(!this.on||!this.ctx||this.ctx.state!=='running')return;const c=this.ctx,now=c.currentTime,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain(),up=(this.scrubDir=!this.scrubDir);s.buffer=this.whiteBuffer;f.type='bandpass';f.Q.value=1.4;f.frequency.setValueAtTime(up?1600:2800,now);f.frequency.linearRampToValueAtTime(up?2800:1600,now+.15);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.09,now+.04);g.gain.exponentialRampToValueAtTime(.0001,now+.17);s.connect(f);f.connect(g);g.connect(this.out());s.start(now,Math.random());s.stop(now+.18);},
 clean(){this.noise(.2,.18,2100);[2350,3050].forEach((f,i)=>this.note(f,.12,'sine',.035,i*.06));[1568,2093,2637].forEach((f,i)=>this.note(f,.22,'sine',.045,.16+i*.07));},
 heart(){[523,659,784,1046].forEach((f,i)=>this.note(f,.22,'triangle',.065,i*.12));},
 phone(){[880,1174,880,1174].forEach((f,i)=>this.note(f,.075,'sine',.055,i*.09));},
 crowd(){[196,246,294].forEach((f,i)=>this.note(f,.4,'triangle',.03,i*.08));},
 // ---------- Volumes (menu do Esc) ----------
 out(){return this.bus||this.fxBus||this.master;},
 loadVolumes(){try{const v=JSON.parse(localStorage.getItem('bodega-volumes')||'{}');for(const k of ['music','ambient','fx'])if(Number.isFinite(v[k]))this[k+'Vol']=clamp(v[k],0,1);}catch(e){}},
 setVolume(kind,value){if(!['music','ambient','fx'].includes(kind))return;this[kind+'Vol']=clamp(value,0,1);if(kind==='fx'&&this.fxBus)this.fxBus.gain.value=this.fxVol;if(kind==='ambient'&&this.ambientBus)this.ambientBus.gain.value=this.ambientVol;this.syncMusic();try{localStorage.setItem('bodega-volumes',JSON.stringify({music:this.musicVol,ambient:this.ambientVol,fx:this.fxVol}));}catch(e){}},
 // ---------- Sons de ambiente ----------
 // Laço contínuo de ruído filtrado; o volume sobe e desce suave conforme a situação.
 loop(name,level,setup){const c=this.ctx;if(!c||c.state!=='running')return null;let l=this.loops[name];if(!l){if(level<=0)return null;const source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();source.buffer=setup.buffer==='brown'?this.noiseBuffer:this.whiteBuffer;source.loop=true;filter.type=setup.type;filter.frequency.value=setup.freq;filter.Q.value=setup.q??.8;gain.gain.value=0;source.connect(filter);filter.connect(gain);gain.connect(this.ambientBus||this.master);source.start(c.currentTime,Math.random());l=this.loops[name]={source,filter,gain};}l.gain.gain.setTargetAtTime(Math.max(0,level),c.currentTime,.06);return l;},
 silence(){for(const l of Object.values(this.loops))l.gain.gain.setTargetAtTime(0,this.ctx.currentTime,.05);},
 // Estalo curto: gordura na chapa, lenha no fogo.
 pop(freq=3500,volume=.06,duration=.025){if(!this.on||!this.ctx||this.ctx.state!=='running')return;const c=this.ctx,now=c.currentTime,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=this.whiteBuffer;f.type='bandpass';f.frequency.value=freq;f.Q.value=1.6;g.gain.setValueAtTime(volume,now);g.gain.exponentialRampToValueAtTime(.0001,now+duration);s.connect(f);f.connect(g);g.connect(this.out());s.start(now,Math.random()*1.8);s.stop(now+duration+.01);},
 // Bolha de líquido saindo da garrafa ("glub").
 bloop(freq=300,volume=.05){if(!this.on||!this.ctx||this.ctx.state!=='running')return;const c=this.ctx,now=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(freq*.55,now);o.frequency.exponentialRampToValueAtTime(freq,now+.05);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(volume,now+.012);g.gain.exponentialRampToValueAtTime(.0001,now+.08);o.connect(g);g.connect(this.out());o.start(now);o.stop(now+.1);},
 // Mugido: duas serras desafinadas, boca abrindo e fechando no filtro.
 moo(volume=.07,pitch=1){if(!this.on||!this.ctx||this.ctx.state!=='running')return;const c=this.ctx,now=c.currentTime,d=1.1+Math.random()*.45,base=112*pitch,lfo=c.createOscillator(),depth=c.createGain(),f1=c.createBiquadFilter(),f2=c.createBiquadFilter(),g=c.createGain(),oscs=[c.createOscillator(),c.createOscillator()];lfo.frequency.value=5.2;depth.gain.value=2.2;lfo.connect(depth);oscs.forEach((o,i)=>{o.type='sawtooth';o.detune.value=i*9;o.frequency.setValueAtTime(base*1.04,now);o.frequency.linearRampToValueAtTime(base*1.2,now+.28);o.frequency.linearRampToValueAtTime(base*.84,now+d);depth.connect(o.frequency);o.connect(f1);});f1.type='bandpass';f1.Q.value=1.3;f1.frequency.setValueAtTime(320,now);f1.frequency.linearRampToValueAtTime(820,now+.32);f1.frequency.linearRampToValueAtTime(400,now+d);f2.type='lowpass';f2.frequency.value=1500;f1.connect(f2);f2.connect(g);g.connect(this.out());g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(volume,now+.2);g.gain.setValueAtTime(volume,now+d*.68);g.gain.exponentialRampToValueAtTime(.0001,now+d);[...oscs,lfo].forEach(o=>{o.start(now);o.stop(now+d+.05);});},
 // Chiado de vapor ("tssss"): ruído branco agudo que some aos poucos.
 hiss(duration=.6,volume=.08,freq=4000,delay=0){if(!this.on||!this.ctx||this.ctx.state!=='running')return;const c=this.ctx,now=c.currentTime+delay,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=this.whiteBuffer;f.type='highpass';f.frequency.value=freq;g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(volume,now+.04);g.gain.exponentialRampToValueAtTime(.0001,now+duration);s.connect(f);f.connect(g);g.connect(this.out());s.start(now,Math.random());s.stop(now+duration+.02);},
 // Buzina de caminhão lá fora: duas notas graves e roucas.
 horn(){if(!this.on||!this.ctx||this.ctx.state!=='running')return;const c=this.ctx;[0,.32].forEach(t=>{const now=c.currentTime+t,f=c.createBiquadFilter(),g=c.createGain();f.type='lowpass';f.frequency.value=1100;g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.05,now+.02);g.gain.setValueAtTime(.05,now+.2);g.gain.exponentialRampToValueAtTime(.0001,now+.26);f.connect(g);g.connect(this.out());[311,370].forEach(fr=>{const o=c.createOscillator();o.type='sawtooth';o.frequency.value=fr;o.connect(f);o.start(now);o.stop(now+.28);});});},
 // Quero-quero: "QUÉ-ro QUÉ-ro…", sílabas agudas e metálicas.
 queroquero(volume=.07,calls=3){if(!this.on||!this.ctx||this.ctx.state!=='running')return;const c=this.ctx,start=c.currentTime,base=.95+Math.random()*.1;
  for(let i=0;i<calls;i++){
   [[0,.085,[2700,3500,2850],1],[.105,.075,[2450,2250,2050],.6]].forEach(([at,dur,[f0,f1,f2],amp])=>{
    const now=start+i*.27+at,o=c.createOscillator(),o2=c.createOscillator(),bp=c.createBiquadFilter(),g=c.createGain();
    o.type='square';o2.type='sine';for(const [osc,mul] of [[o,1],[o2,1.5]]){osc.frequency.setValueAtTime(f0*base*mul,now);osc.frequency.linearRampToValueAtTime(f1*base*mul,now+dur*.3);osc.frequency.linearRampToValueAtTime(f2*base*mul,now+dur);osc.connect(bp);osc.start(now);osc.stop(now+dur+.02);}
    bp.type='bandpass';bp.frequency.value=3000*base;bp.Q.value=2.5;bp.connect(g);g.connect(this.out());
    g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(volume*amp,now+.008);g.gain.exponentialRampToValueAtTime(.0001,now+dur);
   });
  }},
 // Quero-quero de ambiente (entra no volume de sons ambiente).
 birdCall(volume=.05,calls=3){const bus=this.bus;this.bus=this.ambientBus;this.queroquero(volume,calls);this.bus=bus;},
 // Vento de um rasante passando perto.
 swoosh(volume=.12){if(!this.on||!this.ctx||this.ctx.state!=='running')return;const c=this.ctx,now=c.currentTime,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=this.whiteBuffer;f.type='bandpass';f.Q.value=1.2;f.frequency.setValueAtTime(500,now);f.frequency.exponentialRampToValueAtTime(2600,now+.25);f.frequency.exponentialRampToValueAtTime(700,now+.5);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(volume,now+.22);g.gain.exponentialRampToValueAtTime(.0001,now+.55);s.connect(f);f.connect(g);g.connect(this.out());s.start(now,Math.random());s.stop(now+.6);},
 // Laço girando sobre a cabeça e o arremesso.
 whirl(){if(!this.on||!this.ctx||this.ctx.state!=='running')return;const c=this.ctx,now=c.currentTime,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=this.whiteBuffer;f.type='bandpass';f.Q.value=2;f.frequency.setValueAtTime(700,now);f.frequency.linearRampToValueAtTime(1500,now+.13);f.frequency.linearRampToValueAtTime(800,now+.26);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.05,now+.12);g.gain.exponentialRampToValueAtTime(.0001,now+.28);s.connect(f);f.connect(g);g.connect(this.out());s.start(now,Math.random());s.stop(now+.3);},
 lassoThrow(){this.swoosh(.1);this.pop(1900,.08,.04);},
 // Laço apertando no boi: estalo da corda e baque.
 ropeHit(){this.pop(2400,.22,.05);this.pop(1200,.12,.06);this.note(90,.12,'triangle',.1,.02);},
 thud(){this.note(80,.1,'triangle',.08);this.noise(.12,.12,500);},
 // "Ai!" do peão bicado: vogal a→i com formantes.
 ouch(){if(!this.on||!this.ctx||this.ctx.state!=='running')return;const c=this.ctx,now=c.currentTime,o=c.createOscillator(),f1=c.createBiquadFilter(),f2=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';o.frequency.setValueAtTime(190,now);o.frequency.linearRampToValueAtTime(290,now+.07);o.frequency.linearRampToValueAtTime(200,now+.26);f1.type='bandpass';f1.Q.value=6;f1.frequency.setValueAtTime(780,now);f1.frequency.linearRampToValueAtTime(320,now+.22);f2.type='bandpass';f2.Q.value=8;f2.frequency.setValueAtTime(1220,now);f2.frequency.linearRampToValueAtTime(2300,now+.22);o.connect(f1);o.connect(f2);f1.connect(g);f2.connect(g);g.connect(this.out());g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.32,now+.02);g.gain.setValueAtTime(.3,now+.16);g.gain.exponentialRampToValueAtTime(.0001,now+.3);o.start(now);o.stop(now+.32);this.pop(3000,.12,.02);},
 // Fósforo riscando, fogo pegando ("fuuum") e apagando.
 matchStrike(){this.hiss(.18,.12,3500);this.pop(2200,.1,.03);this.hiss(.5,.05,2600,.15);},
 ignite(){if(!this.on||!this.ctx||this.ctx.state!=='running')return;const c=this.ctx,now=c.currentTime,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=this.whiteBuffer;f.type='lowpass';f.frequency.setValueAtTime(300,now);f.frequency.exponentialRampToValueAtTime(1600,now+.35);f.frequency.exponentialRampToValueAtTime(500,now+1.2);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.22,now+.3);g.gain.exponentialRampToValueAtTime(.0001,now+1.3);s.connect(f);f.connect(g);g.connect(this.out());s.start(now,Math.random());s.stop(now+1.35);for(let i=0;i<8;i++)setTimeout(()=>this.pop(1500+Math.random()*3000,.08+Math.random()*.06,.02),250+i*90);},
 fireOut(){this.hiss(.9,.07,1800);this.note(70,.4,'triangle',.05);},
 logDrop(){this.note(95,.09,'triangle',.11);this.pop(900,.12,.05);this.sizzle();},
 // Copo estourando no chão: cacos agudos que tilintam.
 glassBreak(v=1){this.pop(5200,.16*v,.04);this.pop(3600,.12*v,.05);[2900,3700,4400,3300].forEach((f,i)=>this.note(f*(.9+Math.random()*.2),.14,'sine',.035*v,.02+i*.035));this.hiss(.25,.05*v,5000);},
 // Cadeira se partindo: baque grave e madeira estalando.
 woodCrash(v=1){this.note(70,.18,'triangle',.14*v);this.pop(1400,.2*v,.06);this.pop(900,.16*v,.08);setTimeout(()=>{this.pop(2200,.1*v,.03);this.pop(1700,.08*v,.04);},70);},
 // Soco: tapa abafado.
 punch(v=1){this.note(85+Math.random()*30,.08,'triangle',.12*v);this.pop(700+Math.random()*500,.14*v,.04);},
 // Grito no meio da muvuca: vogal curta com altura e timbre variados.
 shout(v=1){if(!this.on||!this.ctx||this.ctx.state!=='running')return;const c=this.ctx,now=c.currentTime,d=.14+Math.random()*.2,f0=140+Math.random()*190,vowel=pick([[730,1090],[570,840],[300,2300],[440,1020],[660,1700]]),o=c.createOscillator(),f1=c.createBiquadFilter(),f2=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';o.frequency.setValueAtTime(f0,now);o.frequency.linearRampToValueAtTime(f0*(1.1+Math.random()*.25),now+d*.4);o.frequency.linearRampToValueAtTime(f0*.85,now+d);f1.type='bandpass';f1.Q.value=5;f1.frequency.value=vowel[0];f2.type='bandpass';f2.Q.value=7;f2.frequency.value=vowel[1];o.connect(f1);o.connect(f2);f1.connect(g);f2.connect(g);g.connect(this.out());g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.18*v,now+.02);g.gain.exponentialRampToValueAtTime(.0001,now+d);o.start(now);o.stop(now+d+.02);},
 // Sininho da porta, bem leve: duas batidas agudas que se apagam devagar.
 doorChime(){[[2637,0],[3520,.09]].forEach(([f,t])=>{this.note(f,.55,'sine',.022,t);this.note(f*2.76,.25,'sine',.006,t);});},
 // Caixa registradora: gaveta abrindo, "tlim" e moedas.
 register(){this.pop(900,.1,.03);this.noise(.08,.08,600);this.note(2794,.45,'sine',.05,.06);this.note(4186,.3,'sine',.02,.08);[1568,2093,2637].forEach((f,i)=>this.note(f,.12,'sine',.03,.2+i*.05));},
 // Bipe das letras aparecendo na caixa de diálogo.
 blip(){this.note(1100+Math.random()*180,.03,'square',.01);},
 // Porta velha rangendo.
 creak(){if(!this.on||!this.ctx||this.ctx.state!=='running')return;const c=this.ctx,now=c.currentTime,o=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';o.frequency.setValueAtTime(110,now);o.frequency.linearRampToValueAtTime(190,now+.25);o.frequency.linearRampToValueAtTime(130,now+.55);o.frequency.linearRampToValueAtTime(170,now+.8);f.type='bandpass';f.frequency.value=900;f.Q.value=3;g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.06,now+.08);g.gain.setValueAtTime(.05,now+.7);g.gain.exponentialRampToValueAtTime(.0001,now+.9);o.connect(f);f.connect(g);g.connect(this.out());o.start(now);o.stop(now+.95);},
 // Papel desdobrando (carta e jornal).
 paper(){this.hiss(.22,.06,2600);this.hiss(.18,.05,3600,.12);},
 brawl(){[0,.09,.2,.3].forEach((t,i)=>{this.note(95+i*14,.07,'triangle',.09,t);this.noise(.08,.14,900+i*300);});},
 crash(){this.noise(.4,.3,3200);[2350,3100,2650,3900,2900].forEach((f,i)=>this.note(f,.18,'sine',.05,.02+i*.045));this.note(70,.25,'triangle',.12);},
 near(x,y,range=800){return clamp(1.15-Math.hypot(G.player.x-x,G.player.y-y)/range,.3,1);},
 ambience(dt){
  this.bus=this.ambientBus;
  const campo=isCampo()||!!G.lasso;
  // Chapa fritando: chiado contínuo + estalos de gordura (ovo chia mais agudo).
  const pressing=!campo&&pressLid(G.kitchen.press)>.8&&!G.kitchen.press.ready,frying=campo?[]:[...G.kitchen.grill.filter(i=>i&&!i.waitingToast),...(pressing?[G.kitchen.press]:[])],near=this.near(86,600,700);
  const fresh=frying.reduce((m,i)=>Math.max(m,clamp(1-(i.heat||0)/2.5,.35,1)),0);
  this.loop('fry',frying.length?(.035+.02*Math.min(frying.length,3))*near*fresh*(frying.some(i=>i.burned)?.6:1):0,{type:'highpass',freq:2600});
  this.popClock-=dt;if(frying.length&&this.popClock<=0){const egg=frying.some(i=>i.key==='ovo');this.popClock=Math.random()*(egg?.09:.16)+.03;this.pop(egg?4200+Math.random()*1800:2600+Math.random()*2200,(.03+Math.random()*.05)*near*fresh);}
  // Enchendo o copo: cerveja faz espuma; cachaça e bitter fazem glub-glub na garrafa.
  const pour=G.task?.type==='pour'?G.task:null,fill=pour?Math.min(1.1,pour.time/1.65):0,beer=pour?.item?.key==='cerveja';
  const l=this.loop('pour',pour?(beer?.07:.04):0,{type:'bandpass',freq:900,q:1.1});
  if(l&&pour)l.filter.frequency.setTargetAtTime((beer?1100:700)+fill*(beer?1500:1300),this.ctx.currentTime,.05);
  this.glugClock-=dt;if(pour&&!beer&&this.glugClock<=0){this.glugClock=.11+Math.random()*.05;this.bloop(240+fill*380,.05);}
  // Cambona passando café: gorgolejo grave e chiado do vapor.
  const brewing=G.task?.type==='coffee';this.loop('brew',brewing?.03:0,{type:'bandpass',freq:1500,q:.9});
  this.brewClock=(this.brewClock||0)-dt;if(brewing&&this.brewClock<=0){this.brewClock=.05+Math.random()*.12;this.bloop(140+Math.random()*220,.045);}
  // Muvuca da briga: falatório embolado, gritos, socos e cadeiras arrastando.
  const fight=campo?null:G.tables.find(t=>t.fight),fn=fight?this.near(fight.x+fight.w/2,fight.y+fight.h/2,900):0;
  this.loop('muvuca',fight?.06*fn:0,{type:'bandpass',freq:650,q:.7});
  this.shoutClock=(this.shoutClock||0)-dt;if(fight&&this.shoutClock<=0){this.shoutClock=.18+Math.random()*.4;this.shout(fn);if(Math.random()<.3)setTimeout(()=>this.shout(fn*.8),70);}
  this.punchClock=(this.punchClock||0)-dt;if(fight&&this.punchClock<=0){this.punchClock=.25+Math.random()*.55;this.bus=null;this.punch(fn);if(Math.random()<.2)this.noise(.3,.12*fn,350);this.bus=this.ambientBus;}
  // Quero-quero gritando ao longe no costelão.
  this.birdClock=(this.birdClock??9)-dt;if(campo&&!G.lasso&&this.birdClock<=0){this.birdClock=14+Math.random()*16;this.queroquero(.025,2+Math.floor(Math.random()*3));}
  // Fogo de chão: ronco grave da brasa e lenha estalando, conforme a lenha que resta.
  const fuel=campo&&!G.lasso&&campoState().lit?(campoState().fuel??0)/100:0,fire=fuel>0?this.near(525,510,900):0;
  this.loop('fire',fuel>0?(.05+.09*fuel)*fire:0,{buffer:'brown',type:'lowpass',freq:420});
  this.fireClock-=dt;if(fuel>0&&this.fireClock<=0){this.fireClock=(Math.random()*.22+.03)/(.4+fuel);const big=Math.random()<.12;this.pop(big?1100+Math.random()*600:1800+Math.random()*3200,(big?.12:.04+Math.random()*.06)*fire,big?.06:.018);}
  // Bois mugindo no campo e na laçada.
  this.mooClock-=dt;if(campo&&this.mooClock<=0){this.mooClock=G.lasso?2.5+Math.random()*3.5:7+Math.random()*9;this.moo(G.lasso?.06+Math.random()*.04:.025+Math.random()*.03,.82+Math.random()*.36);}
  this.bus=null;
 },
 update(dt){this.syncMusic();const quiet=G.penalties||G.bocce||!this.on||!started||paused||modal||document.hidden;if(this.ctx){if(quiet)this.silence();else this.ambience(dt);}if(G.penalties||G.bocce)return;if(!this.on||!started||paused||modal||document.hidden)return;this.stepClock+=dt;this.hissClock+=dt;if(G.player.walk&&this.stepClock>(G.boost>0?.14:.19)){this.stepClock=0;this.note(G.boost>0?125:95,.04,'triangle',.025);if(G.boost>0)G.visual.push({x:G.player.x,y:G.player.y,dx:0,dy:5,life:.4,total:.4,type:'leaf'});}if(this.hissClock>.6){this.hissClock=0;if(G.event.id==='chuva'&&G.phase==='open'){this.bus=this.ambientBus;this.noise(.5,.025,1900);this.bus=null;}}}
};

function saveAudio(){try{localStorage.setItem('bodega-music',String(AudioEngine.music));localStorage.setItem('bodega-sound',String(AudioEngine.on));}catch(e){}}

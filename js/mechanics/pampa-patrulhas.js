// Patrulhas comuns: ataques legíveis nos corredores, sem a órbita dos chefes.
'use strict';
CAVE_BEASTS.oficialAdaga = {name:'Oficial de adaga',hp:240,speed:205,dmg:18,r:24,cash:[9,16],from:999,weight:0};
ILHA_LOOKS.oficialAdaga = ILHA_LOOKS.soldado;
function pampaOficialTick(b,dt,p) {
  ilhaTick0(b,dt);const {dx,dy,d}=ilhaDist(b,p),B=CAVE_BEASTS.oficialAdaga;
  if(pampaSeguro(p.x,p.y)||d>780){b.state='roam';b.tx=b.home.x;b.ty=b.home.y;}
  if(b.state==='roam'){
    if(pampaNota(p,d,410)){b.state='chase';b.cool=.45;}else ilhaRoam(b,dt,52);
    return;
  }
  b.dx=(['windup','lunge','follow'].includes(b.state)?b.vx:dx)<0?-1:1;
  if(b.state==='chase'){
    if(d>100)mataGo(b,p,B.speed,dt);
    if(d<140&&b.cool<=0){b.state='windup';b.t=.48;b.vx=dx/d;b.vy=dy/d;b.hit=false;}
  }else if(b.state==='windup'){
    // The direction stays committed: sidestepping must beat the dagger.
    if(b.t<=0){b.state='lunge';b.t=.22;AudioEngine.swoosh?.(.035);}
  }else if(b.state==='lunge'){
    if(!mataStep(b,b.vx*330,b.vy*330,dt))b.t=0;
    const q=ilhaDist(b,p),along=q.dx*b.vx+q.dy*b.vy,off=Math.abs(q.dx*b.vy-q.dy*b.vx);
    if(!b.hit&&along>=-12&&along<80&&off<36){mataHurt(B.dmg,b);b.hit=true;}
    if(b.t<=0){b.state='follow';b.t=.16;}
  }else if(b.state==='follow'){
    if(b.t<=0){b.state='recuo';b.t=.3;}
  }else if(b.state==='recuo'){
    mataStep(b,-b.vx*125,-b.vy*125,dt);
    if(b.t<=0){b.state='rest';b.t=.55;}
  }else if(b.state==='rest'){
    if(b.t<=0){b.state='chase';b.cool=.15;}
  }else b.state='chase';
}
function pampaOficialWarn(b){if(b.state==='windup')teleLane(b.x,b.y-10,Math.atan2(b.vy,b.vx),148,52,teleK(b.t,.48),'255,170,86',.5);}
ILHA_MOBS.oficialAdaga={start:'roam',tick:pampaOficialTick,warn:pampaOficialWarn,
  draw:b=>{pampaFigura('soldado',b.x,b.y,b.dx,.72,1,Math.floor(b.frame)%4);mataHpBar(b,'Oficial de adaga',150);},
  laco:b=>pampaAtordoa(b,2),xp:11,cry:()=>AudioEngine.swoosh?.(.035)};

function pampaPatrulhaTick(b,dt,p,N){
  if(!b.montado){
    ilhaTick0(b,dt);
    if(pampaSeguro(p.x,p.y)||ilhaDist(b,p).d>780){b.state='roam';b.tx=b.home.x;b.ty=b.home.y;ilhaRoam(b,dt,55);}
    else peaoTick(b,dt,p,CAVE_BEASTS.lanceiroMontado);
    return;
  }
  ilhaTick0(b,dt);const {dx,dy,d}=ilhaDist(b,p);b.carga=false;
  if(pampaSeguro(p.x,p.y)||d>1050){b.state='roam';b.tx=b.home.x;b.ty=b.home.y;}
  if(b.state==='roam'){
    if(pampaNota(p,d,560)){b.state='aproxima';b.cool=.7;}else ilhaRoam(b,dt,88);
    return;
  }
  if(b.state==='aproxima'){
    b.dx=b.mx=dx<0?-1:1;
    if(d>340)mataGo(b,p,230,dt);
    else if(b.cool<=0){b.state='mira';b.t=.85;b.vx=dx/d;b.vy=dy/d;b.hit=false;}
  }else if(b.state==='mira'){
    if(b.t>.3){b.vx=dx/d;b.vy=dy/d;}
    b.dx=b.mx=b.vx<0?-1:1;
    if(b.t<=0){b.state='carga';b.t=.58;AudioEngine.swoosh?.(.05);}
  }else if(b.state==='carga'){
    b.carga=true;
    if(!mataStep(b,b.vx*620,b.vy*620,dt))b.t=0;
    const q=ilhaDist(b,p),along=q.dx*b.vx+q.dy*b.vy,off=Math.abs(q.dx*b.vy-q.dy*b.vx);
    if(!b.hit&&along>=-28&&along<118&&off<46){mataHurt(CAVE_BEASTS.lanceiroMontado.dmg,b);b.hit=true;}
    if(b.t<=0){b.state='freia';b.t=.9;b.carga=false;}
  }else if(b.state==='freia'){
    if(b.t>.6)mataStep(b,b.vx*85,b.vy*85,dt);
    if(b.t<=0){b.state='aproxima';b.cool=.8;}
  }else b.state='aproxima';
}
{
  const start=pampaBeastsStart;
  pampaBeastsStart=function(){start();for(const b of mataNight.beasts)if(b.kind==='lanceiroMontado')Object.assign(b,{montado:true,patrulha:true,need:1,state:'roam'});};
  const tick=ILHA_MOBS.lanceiroMontado.tick,warn=ILHA_MOBS.lanceiroMontado.warn;
  ILHA_MOBS.lanceiroMontado.tick=(b,dt,p,N)=>b.patrulha?pampaPatrulhaTick(b,dt,p,N):tick(b,dt,p,N);
  ILHA_MOBS.lanceiroMontado.warn=b=>{
    if(b.patrulha&&b.montado){if(b.state==='mira')teleLane(b.x,b.y-12,Math.atan2(b.vy,b.vx),470,80,teleK(b.t,.85),'255,160,75',.5);}
    else warn(b);
  };
}

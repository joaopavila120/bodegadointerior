(() => {
  const out=[],check=(v,m)=>{if(!v)throw Error(m);out.push(m);};
  G=fresh();G.prologue={done:true};G.tutorial.complete=true;G.day=40;G.ilha={grenfell:40};
  G.pampa={area:2,sargento:40,boi:40,capitao:40};G.cave={facao:true,hp:100,up:{},forged:{lanca:true},weapon:'lanca'};
  started=true;paused=false;scene=null;phoneOpen=false;closeDialog(true);skipWorldTalk();worldDash=null;
  worldOut={map:'pampa',x:1900,y:1000,dx:1,dy:0};
  for(const day of [1,19,40])for(let n=1;n<=PAMPA.last;n++){
    G.day=day;G.pampa.area=n;pampaBeastsStart();const beasts=mataNight.beasts;
    const temOficial=(PAMPA_MOBS[n]||[]).some(q=>q[0]==='oficialAdaga');check(n===1?beasts.length===0:beasts.some(b=>b.kind==='oficialAdaga')===temOficial,'dia '+day+', trecho '+n+': oficial só de onde a gente do Moringue já chegou');
    if(PAMPA_TROPILHA.includes(n)||n===13||n===14)check(beasts.some(b=>b.kind==='lanceiroMontado'&&b.montado&&b.patrulha),'dia '+day+', trecho '+n+': patrulha montada nasce sem chefe');
    if(n<10)check(!beasts.some(b=>b.kind==='lanceiroMontado'),'dia '+day+', trecho '+n+': a cavalaria só vem depois do Boi');
    check(beasts.every(b=>WORLD_MAPS.pampa.canWalk(b.x,b.y)),'dia '+day+', trecho '+n+': inimigos nascem em solo caminhável');
    if(temOficial){const b=beasts.find(b=>b.kind==='oficialAdaga');pampaMortos(n).push(b.idx);pampaBeastsStart();check(mataNight.beasts.find(q=>q.idx===b.idx)?.hp===0,'dia '+day+', trecho '+n+': oficial derrotado não reaparece');}
  }
  G.day=41;G.pampa.area=PAMPA_N.carretas;pampaBeastsStart();const L=pampaLayout(),N=mataNight,p=worldOut;
  // A clear straight section, away from camp and arenas.
  const at=L.pts.find(q=>q[1]>550&&q[1]<2100&&pampaLugarLivre(L,q[0],q[1])&&WORLD_MAPS.pampa.canWalk(q[0],q[1]+150));
  check(!!at,'área caminhável para exercitar os ataques');p.x=at[0];p.y=at[1]+100;
  const damage=mataHurt;let hits=0;mataHurt=()=>hits++;
  try{
    const b=ilhaMob('oficialAdaga',{x:at[0],y:at[1]},()=>.5,{state:'chase',cool:0});
    pampaOficialTick(b,.016,p);check(b.state==='windup'&&hits===0,'oficial prepara a adaga antes de causar dano');
    pampaOficialTick(b,.49,p);check(b.state==='lunge'&&pampaBeastPose(b)===5,'estocada usa o quadro próprio');
    for(let k=0;k<14;k++)pampaOficialTick(b,.02,p);
    check(hits===1,'estocada causa um único acerto');
    for(let k=0;k<60;k++)pampaOficialTick(b,.02,{x:p.x+450,y:p.y});
    check(hits===1,'recuo e recuperação não repetem dano');
    const dodge=ilhaMob('oficialAdaga',{x:at[0],y:at[1]},()=>.5,{state:'chase',cool:0});
    pampaOficialTick(dodge,.016,p);p.x+=100;
    for(let k=0;k<50;k++)pampaOficialTick(dodge,.02,p);
    check(hits===1,'desviar depois do aviso evita a adaga');p.x=at[0];p.y=at[1]+100;
    const cav=ilhaMob('lanceiroMontado',{x:at[0],y:at[1]},()=>.5,{montado:true,patrulha:true,state:'aproxima',cool:0,need:1});
    pampaPatrulhaTick(cav,.016,p,N);check(cav.state==='mira'&&hits===1,'cavaleiro avisa a carga no caminho estreito');
    pampaPatrulhaTick(cav,.86,p,N);check(cav.state==='carga','aviso termina em carga de lança');
    for(let k=0;k<30;k++)pampaPatrulhaTick(cav,.02,p,N);
    check(hits===2&&cav.state==='freia','carga atinge uma vez e freia');
    cav.state='aproxima';cav.x=at[0];cav.y=at[1];cav.cool=0;cav.carga=false;
    cavaleiroLaco(cav,N);check(!cav.montado,'laço pode derrubar o patrulheiro fora da carga');
    pampaPatrulhaTick(cav,.02,p,N);check(Number.isFinite(cav.x)&&Number.isFinite(cav.y),'cavaleiro derrubado continua a lutar a pé');
    p.x=L.camp.x;p.y=L.camp.y;
    pampaOficialTick(b,.02,p);pampaPatrulhaTick(cav,.02,p,N);
    check(b.state==='roam'&&cav.state==='roam'&&hits===2,'oficial e cavaleiro respeitam o acampamento seguro');
  }finally{mataHurt=damage;}
  for(let n=1;n<=PAMPA.last;n++){
    const l=pampaLayout(n),segments=l.pedacos.flatMap(q=>q.wallSegments||[]),nests=pampaNestSites(l);
    check(segments.length>100&&segments.every(s=>Math.hypot(s[1][0]-s[0][0],s[1][1]-s[0][1])<=20),'trecho '+n+': taipas têm contorno conectado de pequenas arestas');
    check(l.umbus.every(u=>pampaTreeSize(u)>=230&&pampaTreeSize(u)<=320),'trecho '+n+': árvores mantêm escala coerente com Sadi');
    check(nests.length>0&&nests.length<=5,'trecho '+n+': poucos ninhos em moirões próprios');
    check(nests.every(q=>!l.umbus.some(u=>Math.abs(u.x-q.x)<180&&u.y>q.y-30&&u.y<q.y+320)),'trecho '+n+': copa de árvore não cobre ninho');
  }
  const r=PAMPA_ART_CROPS['pampa-campo'].frames[2],nestHeight=32*r[3]/r[2];
  check(nestHeight>90&&nestHeight<150,'ninho fica bem acima da taipa de 32 pixels');
  paused=true;return out;
})()

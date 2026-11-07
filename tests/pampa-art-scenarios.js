(() => {
  const out=[],check=(v,m)=>{if(!v)throw Error(m);out.push(m);};
  G=fresh();G.prologue={done:true};G.tutorial.complete=true;G.day=40;G.phase='prep';
  G.ilha={grenfell:40};G.pampa={area:5,sargento:40,boi:40,capitao:40};
  G.cave={facao:true,floor:2,deepest:2,hp:100,up:{},forged:{lanca:true,cobre:true},weapon:'lanca'};
  started=true;paused=false;scene=null;phoneOpen=false;closeDialog(true);skipWorldTalk();keys.clear();worldDash=null;
  const L=pampaLayout(5),p=worldOut={map:'pampa',x:L.camp.x,y:L.camp.y,dx:1,dy:0,walk:false};
  mataNightStart();const N=mataNight;N.beasts=[];N.hurt=0;N.preso=0;frameClock+=5;
  check(golpeMaximo()===4,'lança tem quatro golpes sem exigir a melhoria das lâminas');
  const mob=(x,y)=>ilhaMob('carabineiro',{x,y},()=>.5,{hp:10000,max:10000,boss:false,state:'roam'});
  const front=mob(p.x+90,p.y),back=mob(p.x-100,p.y),far=mob(p.x+caveReach()*1.45+80,p.y);N.beasts=[front,back,far];
  const damage=caveDmg(),loss=[];
  for(let n=1;n<=4;n++){
    frameClock+=.18;N.cd=Math.max(0,N.cd-.18);const hp=front.hp;mataAttack();
    check(N.swing?.n===n&&N.swing.artWeapon==='lanca','combo da lança: golpe '+n+' aceito e pose registrada');loss.push(hp-front.hp);
    if(n<4)check(back.hp===10000,'golpe '+n+' não atinge quem está atrás');
  }
  check(loss[3]>=Math.round(damage*3.4)&&back.hp===10000-Math.round(damage*3.4),'quarto golpe causa 3,4 vezes o dano e alcança atrás do jogador');
  check(far.hp===10000,'a varredura não atinge fora do alcance');
  check(N.cd>.6&&N.swing.T===.62,'o golpe final tem animação e recuperação maiores');
  const last=N.swing;mataAttack();check(N.swing===last,'apertar durante a recuperação não repete o dano');
  frameClock+=2;N.cd=0;N.beasts=[];mataAttack();check(N.swing.n===1,'uma pausa reinicia o combo');
  N.cd=.1;frameClock+=.1;mataAttack();check(N.fila===frameClock,'aperto adiantado fica na fila');
  frameClock+=.1;N.cd=0;golpeTick(.1);check(N.swing.n===2,'entrada antecipada continua o combo');
  N.cd=0;frameClock+=1;paused=true;const blocked=N.swing;mataAttack();check(N.swing===blocked,'jogo pausado impede ataques e efeitos novos');paused=false;
  caveState().weapon='cobre';check(golpeMaximo()===2,'outras armas mantêm dois golpes');caveState().up.giro=true;check(golpeMaximo()===3,'a melhoria de giro continua dando três golpes às outras armas');
  caveState().weapon='lanca';check(golpeMaximo()===4,'a melhoria de giro não limita a lança a três golpes');
  // The existing boss guard and cavalry interception run around the combo.
  N.beasts=[ilhaMob('moringue',{x:p.x+90,y:p.y},()=>.5,{hp:8000,max:8000,boss:true,montado:false,fase:2,state:'guarda',dx:-1})];N.vento=null;
  N.golpeN=3;N.golpeEm=frameClock-.2;N.cd=0;mataAttack();check(N.beasts[0].hp===8000,'varredura respeita a guarda do Moringue');
  N.beasts=[ilhaMob('lanceiroMontado',{x:p.x+90,y:p.y},()=>.5,{montado:true,need:1,carga:true,state:'carga',vx:-1,vy:0,dx:-1})];
  N.golpeN=0;N.cd=0;frameClock+=1;mataAttack();check(!N.beasts[0].montado,'lança continua derrubando cavalo em carga');
  N.beasts=[];N.swing=null;N.hurt=0;
  check(pampaSadiReady(),'Sadi usa as poses da lança com a arma equipada');
  for(const [dx,dy,d,flip]of [[0,1,0,false],[1,0,1,false],[-1,0,1,true],[0,-1,2,false]]){
    const pose=pampaSadiPose(false,dx,dy);check(pose.index===d*4&&pose.flip===flip,'lança parada tem direção '+dx+','+dy);
    drawExpansionPerson(0,500,500,true,true,dx,false,null,dy);
  }
  for(let n=1;n<=4;n++)for(const k of [.05,.3,.55,.85]){
    N.swing={n,T:LANCA_GOLPES[n].T,t:LANCA_GOLPES[n].T*(1-k),ang:0,artWeapon:'lanca'};
    const pose=pampaSadiPose(false,1,0);check(pose?.id==='pampa:sadi-lanca-attack','pose própria do golpe '+n+' em '+k);
    drawExpansionPerson(0,500,500,false,true,1,false,null,0);drawGolpeRastro(N.swing,p);
  }
  worldOut=null;check(!pampaSadiReady()&&pampaSadiPose(false,1,0)===null,'a lança não altera a proporção nem a bandeja dentro da bodega');worldOut=p;
  for(const[id,sheet]of Object.entries(PAMPA_ART_CROPS)){
    check(PAMPA_ART[id]?.naturalWidth===sheet.size[0],id+': PNG carregado na resolução registrada');
    check(sheet.frames.every(r=>r[0]>=0&&r[1]>=0&&r[0]+r[2]<=sheet.size[0]&&r[1]+r[3]<=sheet.size[1]),id+': recortes dentro da imagem');
  }
  for(const[id,spec]of Object.entries(PAMPA_FIGURES))for(let frame=0;frame<spec[2];frame++)check(pampaFigureSprite(id,frame,500,500),id+': quadro '+frame+' desenha');
  check(/pampa-npcs/.test(zeferinoPortrait())&&/pampa-chefes/.test(pampaRetrato('moringue')),'retratos de Zeferino e Moringue usam as artes próprias');
  // Only the visible pieces are rasterized; visiting every segment cannot grow memory.
  for(let n=1;n<=10;n++)for(const wall of pampaLayout(n).pedacos)pampaPedaco(wall);
  check(pampaWallCache.size<=256,'cache das taipas permanece limitado depois de percorrer dez trechos');
  check([...pampaWallCache.values()].reduce((s,t)=>s+t.canvas.width*t.canvas.height,0)<4*1024*1024,'cache das taipas ocupa menos de 16 MB');
  check(actionFramePixels<=4*1024*1024,'poses compartilham o cache limitado de quadros');
  check(pampaPatterns.size<=4,'chão usa no máximo quatro padrões compartilhados');
  // Same four-hit combat works in a normal cave floor.
  worldOut={map:'caverna',x:500,y:500,dx:1,dy:0};caveRun=null;
  if(inCave()){
    const run=caveFloorRun();run.beasts=[];run.rocks=[];run.dash=null;run.hurt=0;
    for(let n=1;n<=4;n++){run.cd=0;frameClock+=.18;caveAttack();check(run.swing?.n===n,'caverna aceita golpe '+n+' da lança');}
  }else throw Error('O teste deve usar o mapa da caverna');
  worldOut=p;mataNight=N;N.beasts=[];N.swing=null;paused=true;
  return out;
})()

(() => {
  const results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
  G=fresh();G.prologue={done:true};G.tutorial.complete=true;G.day=40;G.phase='prep';
  started=true;paused=false;scene=null;phoneOpen=false;closeDialog(true);skipWorldTalk();keys.clear();worldDash=null;
  G.cave={facao:true,floor:2,deepest:2,hp:100,up:{},dunstanTaught:true,forged:{sabre:true},weapon:'sabre'};
  worldOut={map:'caverna',x:600,y:600,dx:1,dy:0};caveRun=buildCaveFloor(1);caveRun.floor=2;caveRun.day=G.day;caveTrip=null;
  const run=caveRun;run.rocks=[];run.beasts=[];run.shots=[];run.hurt=0;run.cd=0;run.dash=null;
  for(const[tool,a]of Object.entries(SADI_TOOL_POSES)){
    check(ACTION_ART['tool:sadi-'+tool]?.naturalWidth===a.size[0]&&a.frames.length===12,tool+' atlas loads all poses');
    for(const f of a.frames)check(f[0]>=0&&f[1]>=0&&f[0]+f[2]<=a.size[0]&&f[1]+f[3]<=a.size[1]&&f[4]>0&&f[4]<f[2]&&f[5]<=f[3],tool+' valid crop/ground anchor');
  }
  const beast={kind:'sanguanel',x:650,y:590,hp:500,max:500,state:'rest',t:2};run.beasts=[beast];
  const damage=caveHitDmg(beast);caveAttack();
  check(beast.hp===500-damage&&run.swing?.artWeapon==='sabre','real sabre swing deals exactly one normal hit');
  const swing=run.swing;const hp=beast.hp;caveAttack();
  check(run.swing===swing&&beast.hp===hp,'cooldown neither restarts animation nor duplicates damage');
  for(const[t,stage]of [[.2,0],[.14,1],[.09,2],[.04,3]]){swing.t=t;check(sadiToolPose()?.stage===stage,'sabre attack phase '+stage);}
  for(const[dx,dy,dir,flip]of [[1,0,1,false],[-1,0,1,true],[0,1,0,false],[0,-1,2,false]]){
    swing.ang=Math.atan2(dy,dx);const p=sadiToolPose();check(p?.direction===dir&&p.flip===flip,'sabre points along attack '+dx+','+dy);drawExpansionPerson(0,500,500,false,true,dx,false,null,dy);
  }
  G.cave.weapon='facao';check(sadiToolPose()?.tool==='sabre','equipping another blade does not change a swing already in progress');
  run.cd=0;caveAttack();check(sadiToolPose()?.tool==='facao'&&sadiToolPose().id==='tool:sadi-facao','o facão do vô entra na mesma linha de golpes, com a folha original');G.cave.weapon='sabre';run.cd=0;caveAttack();
  run.hurt=.1;check(!sadiToolPose(),'hurt pose takes priority');run.hurt=0;run.dash={t:.1};check(!sadiToolPose(),'dash takes priority');run.dash=null;
  G.avatarId='badin';check(!sadiToolPose(),'other characters never become Sadi during a swing');G.avatarId='sadi';
  worldOut=null;check(!sadiToolPose()&&personHeight(0,true)===130,'bodega scale and serving poses stay unchanged');
  worldOut={map:'ilha',x:3200,y:1420,dx:1,dy:0};mataNightStart();mataNight.beasts=[];mataNight.hurt=0;mataNight.cd=0;mataAttack();
  check(mataNight.swing?.artWeapon==='sabre'&&sadiToolPose()?.tool==='sabre','sabre animation also follows actual island/forest attacks');
  // O combo: F, F (o talho e o revés); com o Golpe de giro, o terceiro, que pega em volta. Vale com qualquer lâmina, na caverna e na mata.
  worldOut={map:'caverna',x:600,y:600,dx:1,dy:0};Object.assign(run,{hurt:0,dash:null,swing:null,rocks:[],golpeN:0,fila:0});
  {const alvo=run.beasts[0]||{};Object.assign(alvo,{kind:'sanguanel',x:660,y:590,hp:9000,max:9000,state:'rest',t:9});run.beasts=[alvo];const base=caveHitDmg(alvo);
   const bate=(espera=.2)=>{frameClock+=espera;run.cd=0;const h=alvo.hp;caveAttack();return h-alvo.hp;},poe=()=>Object.assign(alvo,{x:660,y:590});
   check(bate(5)===base&&run.swing.n===1,'F: o talho, com o dano normal');check(run.cd<=GOLPE.elo,'dá pra emendar logo');
   poe();check(bate()===Math.round(base*GOLPES[2].dano)&&run.swing.n===2,'F, F bem ligeiro: o revés, mais forte');check(run.cd>caveCd(),'o último golpe da sequência deixa a lâmina voltando');
   poe();check(bate()===base&&run.swing.n===1,'sem a melhoria, o combo para no segundo golpe');
   poe();check(bate(GOLPE.janela+.1)===base&&run.swing.n===1,'demorou, começa de novo no talho');
   poe();caveAttack();check(run.swing.n===1,'dois apertos no mesmo instante não contam como combo');
   run.cd=.1;frameClock+=.1;caveAttack();check(!!run.fila&&run.swing.n===1,'apertou antes de a lâmina voltar: fica na fila');run.cd=0;golpeTick(0);check(run.swing.n===2&&!run.fila,'e sai assim que dá');
   for(const[k,stage]of[[0,3],[.3,2],[.9,1]]){run.swing.t=run.swing.T*(1-k);check(sadiToolPose()?.stage===stage,'o revés sobe, ao contrário do talho: pose '+stage);}
   check(CAVE_UPGRADES.some(u=>u.id==='giro')&&dunstanLojaHTML().includes('Golpe de giro')&&griggsGolpeHTML().includes('Golpe de giro'),'o Golpe de giro se compra na ferraria e com o Griggs');
   G.cash=1000;const cash=G.cash,u=CAVE_UPGRADES.find(x=>x.id==='giro');worldOut.map='ilha';griggsGiro();closeDialog(true);skipWorldTalk();worldOut.map='caverna';check(caveUp('giro')&&G.cash===cash-u.cost,'compra o terceiro golpe');
   poe();bate(1);poe();bate();poe();Object.assign(alvo,{x:540});const antes=alvo.x;check(bate()===Math.round(base*GOLPES[3].dano)&&run.swing.n===3,'F, F, F: o giro, com o dobro do dano e pegando até quem tá atrás');check(alvo.x<antes-40,'e joga o bicho longe');
   check(run.cd>=caveCd()*GOLPE.recuoGiro-.001&&golpeTreme>0,'o chão treme e a lâmina demora a voltar');
   const dirs=[];for(const k of[.05,.4,.7,.95]){run.swing.t=run.swing.T*(1-k);const p=sadiToolPose();dirs.push(p.direction+(p.flip?'f':''));drawExpansionPerson(0,500,500,false,true,1,false,null,0);drawCaveSwing();}check(new Set(dirs).size>=3,'no giro, o corpo dá a volta inteira: '+dirs.join());
   poe();bate();check(run.swing.n===1,'depois do giro, recomeça');
   for(const[w,tool]of[['facao','facao'],['ametista','facao'],['sabre','sabre'],['sabre_preto','sabre'],['sabre_dourado','sabre']]){G.cave.weapon=w;G.cave.forged[w]=true;for(let n=1;n<=3;n++){poe();bate(n===1?1:.2);check(run.swing.n===n&&sadiToolPose()?.tool===tool,w+': golpe '+n+' na linha de '+tool);drawExpansionPerson(0,500,500,false,true,1,false,null,0);drawCaveSwing();}}
   G.cave.weapon='sabre';worldOut={map:'ilha',x:3200,y:1420,dx:1,dy:0};mataNightStart();const N=mataNight,m={kind:'javali',x:3270,y:1400,hp:9000,max:9000,state:'rest',t:9,vx:0,vy:0,hurt:0,frame:0,cool:0,attack:0,dx:1,home:{x:3270,y:1400}};N.beasts=[m];N.hurt=0;
   const na=(espera=.2)=>{frameClock+=espera;N.cd=0;Object.assign(m,{x:3270,y:1400});const h=m.hp;mataAttack();return h-m.hp;},d0=caveDmg();
   check(na(5)===d0&&N.swing.n===1&&na()===Math.round(d0*GOLPES[2].dano)&&N.swing.n===2&&na()===Math.round(d0*GOLPES[3].dano)&&N.swing.n===3,'na mata e na ilha, o mesmo combo');drawGolpeRastro(N.swing,worldOut);
   mataNight=null;delete G.cave.up.giro;run.cd=0;run.swing=null;run.golpeN=0;run.beasts=[];worldOut={map:'caverna',x:600,y:600,dx:1,dy:0};
   // As cores: uma linha de animação só, e a paleta troca a lâmina.
   check(['cinza','cinza_escuro','prata','prata_escura','preto','dourado'].every(n=>LAMINA_PALETAS[n]),'o sabre pode sair em cinza, cinza escuro, prata, prata escura, preto e dourado');
   check(laminaDaArma('sabre')==='cinza'&&laminaDaArma('ametista')==='ametista'&&LAMINA_PALETAS.ametista.perola&&laminaDaArma('ouro')==='dourado'&&laminaDaArma('facao')===null,'cada arma diz a sua cor; a de ametista é perolada; o facão do vô fica como é');
   G.ilha={facaoPrata:G.day};check(laminaDaArma('sabre')==='prata'&&laminaDaArma('facao')==='prata'&&laminaDaArma('ametista')==='ametista','com o fio de prata do Griggs, a lâmina fica prateada (a de pedra mantém a cor)');delete G.ilha;
   const soma=(id,x,y,w,h)=>{const d=ACTION_ART[id].getContext('2d').getImageData(x,y,w,h).data;let r=0,b=0;for(let i=0;i<d.length;i+=4)if(d[i+3]>200){r+=d[i];b+=d[i+2];}return{r,b};};
   const ouro=laminaFolha('sabre','dourado'),preto=laminaFolha('sabre','preto'),lamina=[1000,450,98,48],corpo=[850,380,60,120];
   check(ouro==='tool:sadi-sabre:dourado'&&soma(ouro,...lamina).r>soma(preto,...lamina).r*2&&soma(ouro,...lamina).r>soma(ouro,...lamina).b*1.3,'a paleta pinta a lâmina');
   check(soma(ouro,...corpo).r===soma(preto,...corpo).r,'e não mexe no corpo do Sadi');
   const am=laminaFolha('facao','ametista'),f=[640,488,120,44],s=soma(am,...f);check(s.b>s.r*.9&&laminaFolha('nada','ametista')==='tool:sadi-nada'&&laminaFolha('sabre',null)==='tool:sadi-sabre','o facão de ametista puxa pro lilás; sem paleta, a folha original');
   laminaFolha('sabre','prata');laminaFolha('sabre','cobre');check(laminaFolhas.size<=LAMINA_FOLHAS_MAX&&!ACTION_ART[ouro],'guarda poucas folhas pintadas na memória');
  }
  // A animação do dash: arranque, corrida inclinada com as pernas trocando e freada; vultos atrás e poeira no chão.
  {worldOut={map:'caverna',x:600,y:600,dx:1,dy:0,walk:false};Object.assign(run,{hurt:0,swing:null,dashTrail:[],dashCd:0});dashVisto=null;dashFreada=null;const T=CAVE_DASH.duration;
   run.dash={t:T,dx:1,dy:0};let p=dashPose(0);check(p?.fase==='arranque'&&p.sy<1&&p.sx>1,'o dash começa agachando, no arranque');
   run.dash.t=T*.7;p=dashPose(0);const quadro=p.index;check(p.fase==='corrida'&&p.lean>.2&&p.sx>1&&!p.flip&&p.direction===1,'corre inclinado pra frente e esticado');
   run.dash.t=T*.55;check(dashPose(0).index!==quadro,'as pernas trocam no meio da corrida');
   run.dash={t:T*.5,dx:-1,dy:0};p=dashPose(0);check(p.flip&&p.lean<0,'pra esquerda, espelha e inclina pro outro lado');
   run.dash={t:T*.5,dx:0,dy:-1};p=dashPose(0);check(p.direction===2&&p.sy>1&&Math.abs(p.lean)<.001,'pra cima, de costas e esticado na vertical');
   check(!sadiToolPose()&&drawExpansionPerson(0,500,500,true,true,0,false,null,-1)===true,'o dash desenha o corpo dele, por cima das outras poses');
   run.dashTrail=[0,1,2,3,4,5,6,7].map(k=>({x:600,y:600+k*30,life:.1+k*.01,dx:0,dy:-1}));drawCaveDash();
   let puffs=0,grande=0;const keep=fxAdd;fxAdd=function(type,x,y,o){if(type==='puff'){puffs++;grande=Math.max(grande,o.size);}return keep(type,x,y,o);};
   run.dash=null;dashVisto=null;dashArtTick(.01);check(puffs===0,'sem dash, sem poeira');run.dash={t:T,dx:1,dy:0};dashArtTick(.01);check(puffs>0&&puffs<=6,'o arranque levanta um pouco de poeira');
   const arranque=puffs;run.dash=null;dashArtTick(.01);check(puffs>arranque&&dashPose(0)?.fase==='freada'&&dashPose(0).lean<0,'a freada também, jogando o peso pra trás');check(grande<=6,'poeira pequena, que não tapa o personagem');
   worldOut.walk=true;check(!dashPose(0),'saindo andando, emenda na caminhada');worldOut.walk=false;dashArtTick(1);check(!dashPose(0),'a freada acaba');fxAdd=keep;
   worldOut={map:'ilha',x:3150,y:3700,dx:1,dy:0,walk:false};worldDash={t:T*.5,dx:1,dy:0};worldDashCd=1;worldDashTrail=[];check(dashPose(0)?.fase==='corrida','fora da caverna, a mesma animação');
   worldDashNow(1/60);check(worldDashTrail[0]?.dx===1,'o rastro guarda pra onde ele corria');drawWorldDash();drawExpansionPerson(0,500,500,true,true,1,false,null,0);
   G.avatarId='badin';check(dashPose(avatarSprite())?.id==='badin','vale pros outros personagens jogáveis');G.avatarId='sadi';
   const art=WALK_ART.sadi;WALK_ART.sadi={naturalWidth:0};check(!dashPose(0),'sem o desenho, fica o boneco normal');drawDashRastro(worldDashTrail);WALK_ART.sadi=art;
   worldDash=null;worldDashCd=0;worldDashTrail=[];dashVisto=null;dashFreada=null;run.dash=null;run.dashTrail=[];
  }
  mataNight=null;worldOut=null;G.herd=1;G.lassoTaught=true;startLasso();closeDialog(true);scene=null;paused=false;
  const L=G.lasso;L.queros=[];Object.assign(G.player,{x:600,y:700,dx:1,dy:0});L.time=.05;lassoCharge();
  check(sadiToolPose()?.tool==='laco'&&sadiToolPose().stage===0,'holding Q starts the winding pose');L.time=.3;check(sadiToolPose()?.stage===1,'winding alternates the arm pose');
  L.charge=.5;const aim=lassoAim();lassoRelease();const t=L.throw,hand=sadiLassoHand();
  check(t.tx===aim.x&&t.ty===aim.y&&t.total===.32+aim.p*.25,'new lasso art preserves target and flight time');
  check(Math.hypot(t.sx-hand.x,t.sy-hand.y)<.001&&sadiToolPose()?.stage===2,'rope launches from the drawn right hand');
  const b=L.bois[0];Object.assign(b,{x:t.tx,y:t.ty+28,state:'free',speed:0,t:99,dx:0,dy:0,rope:0});
  lassoTick(t.total+.01);check(b.rope===1&&t.done&&sadiToolPose()?.stage===3,'real flight hits once and starts the pulling pose');
  lassoTick(.01);check(b.rope===1,'pulling never scores a second hit');lassoTick(.35);check(!L.throw&&!sadiToolPose(),'finished throw returns to ordinary Sadi');
  L.charging=true;
  for(const[dx,dy,dir,flip]of [[1,0,1,false],[-1,0,1,true],[0,1,0,false],[0,-1,2,false]]){
    L.fx=dx;L.fy=dy;const p=sadiToolPose(),h=sadiLassoHand();check(p?.direction===dir&&p.flip===flip&&Number.isFinite(h.x+h.y),'lasso body and rope hand face '+dx+','+dy);drawLassoRope(L);
  }
  for(const mode of ['rodeio','javali','cavalo']){L.mode=mode;check(sadiToolPose()?.tool==='laco','shared action in '+mode);}
  L.stun=.2;check(!sadiToolPose(),'stun interrupts the lasso pose');L.stun=0;L.dash=.1;check(!sadiToolPose(),'lasso dodge keeps its pose');L.dash=0;
  const im=ACTION_ART['tool:sadi-laco'];ACTION_ART['tool:sadi-laco']={naturalWidth:0};check(!sadiToolPose(),'missing sheet uses ordinary character');drawLassoRope(L);ACTION_ART['tool:sadi-laco']=im;
  G.lasso=null;$('lassoUI').classList.add('hidden');worldOut={map:'caverna',x:600,y:600,dx:1,dy:0};G.cave.floor=SALAMANCA_FLOOR;caveRun=buildCaveFloor(SALAMANCA_FLOOR);caveRun.day=G.day;
  Object.assign(caveRun,{beasts:[],rocks:[],hurt:0,swing:null,lassoCd:0,t:4});salamancaLasso();
  check(caveRun.rope?.artStart===4&&sadiToolPose()?.stage===2,'Salamanca throw triggers body animation on a real cast');
  const rope=caveRun.rope;caveRun.t+=.2;check(sadiToolPose()?.stage===3,'combat lasso has a pull follow-through');salamancaLasso();check(caveRun.rope===rope,'combat cooldown does not restart lasso');
  caveRun.t+=.5;check(!sadiToolPose(),'combat pose ends even if target remains tied');
  paused=true;return results;
})()

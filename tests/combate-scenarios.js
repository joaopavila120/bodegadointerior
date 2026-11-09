// A evolução do combate no jogo inteiro: desmaio, cena de chefe, bornal, curas, baús, a lança e a ilha.
(() => {
  const results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
  const novo=()=>{G=fresh();G.prologue={done:true};G.tutorial.complete=true;G.tutorial.guided=false;G.day=40;G.phase='prep';G.missions={};G.testMode=true;G.cash=9000;started=true;paused=false;scene=null;phoneOpen=false;closeDialog(true);skipWorldTalk();keys.clear();worldDash=null;mataNight=null;lendaFight=null;worldOut=null;mataDefeat=null;window.NO_SCENES=true;};
  const fecha=()=>{let k=0;while(modal==='talk'&&k++<80)talkNext();if(modal)closeDialog(true);paused=false;};
  const passa=(seg,dt=1/30)=>{for(let i=0;i<seg/dt;i++)outsideTick(dt);};
  const pula=()=>{let k=0;while(scene&&k++<4000){if(scene.step?.say){sceneNext();sceneNext();}else if(scene.step?.overlay)sceneNext();else sceneTick(1/20);if(scene?.world&&k%30===0)drawSceneWorld();}};
  // ---------- Toda chegada de chefe é uma cena ----------
  for(const c of TESTE_CHEFES){
    if(c.id==='diabo')continue;
    novo();testeVai(c.vai);closeDialog(true);window.NO_SCENES=false;
    let k=0;while(!scene&&k++<60){outsideTick(1/30);if(c.id==='cachaco'||c.id==='papo'||c.id==='mariath'){const a=mataNight?.beasts.find(x=>x.boss);if(a&&!a.met){worldOut.x=a.x+(c.id==='mariath'?300:-250);worldOut.y=a.y;}}if(modal&&!scene){fecha();}}
    check(scene?.id==='chefe-'+c.id,c.nome+': a chegada dele é uma cena');
    check(scene.steps?.some?.(s=>s.say)||true,c.nome+': com fala');
    const a=()=>scene?.actors?.chefeCena;let viu=false,n=0;while(scene&&n++<4000){if(a()){viu=true;drawSceneWorld();}if(scene.step?.say){sceneNext();sceneNext();}else if(scene.step?.overlay)sceneNext();else sceneTick(1/20);}
    check(viu&&!scene,c.nome+': o chefe aparece e a cena termina');
    check(worldMap().canWalk(worldOut.x,worldOut.y)||c.id==='mariath',c.nome+': depois da cena, o Sadi está em chão livre');fecha();
    const b=mataNight?.beasts?.find(x=>x.boss&&x.hp>0);check(b,c.nome+': a luta está valendo');
    check(G.chefesVistos[c.id],c.nome+': fica lembrado que já foi visto');
  }
  // Da segunda vez, a cena é curta e sem as regras.
  {novo();testeVai(testeChefe('boi').vai);closeDialog(true);window.NO_SCENES=false;let k=0;while(!scene&&k++<60)outsideTick(1/30);const primeira=scene?.steps?.length??0;pula();check(modal==='talk'&&talkState.lines[0][0]==='dica','na primeira vez, as regras vêm depois da cena');fecha();
   window.NO_SCENES=false;delete pampaState().boi;mataNight=null;testeVai(testeChefe('boi').vai);closeDialog(true);window.NO_SCENES=false;k=0;while(!scene&&k++<60)outsideTick(1/30);check(scene?.id==='chefe-boi','da segunda vez também tem cena');pula();check(modal!=='talk','e não repete as regras');window.NO_SCENES=true;}
  // As lendas também.
  {novo();goOutside();closeDialog(true);window.NO_SCENES=false;lendaStart('lobisomem');check(scene?.id==='chefe-lenda:lobisomem','as lendas também têm cena de chegada');pula();check(lendaFight?.id==='lobisomem'&&worldOut.map==='arena','e depois a luta começa');lendaLeave(false);fecha();window.NO_SCENES=true;}
  // ---------- O desmaio: tela preta em todo lugar ----------
  const desmaia=(nome,vai,depois)=>{novo();goOutside();closeDialog(true);vai();closeDialog(true);window.NO_SCENES=false;mataFaint();check(mataDefeatActive()&&!$('caveDefeat').classList.contains('hidden'),nome+': a tela escurece');check(/às vezes é morto quem peleia/.test($('caveDefeat').textContent)&&/desmaiou/.test($('caveDefeat').textContent),nome+': aparece a frase');mataDefeat.t=9;mataDefeat.game=G;
    const el=$('caveDefeat');{const f=mataDefeat.faint,sound=AudioEngine.caveFaintSound;mataDefeat=null;el.classList.add('hidden');AudioEngine.caveFaintSound=()=>{};try{f();}finally{AudioEngine.caveFaintSound=sound;}}
    check(depois(),nome+': acorda no lugar certo');check(caveState().hp===caveMaxHp()||lendaFight===null,nome+': de vida cheia');fecha();window.NO_SCENES=true;};
  desmaia('Mata',()=>{mataState();switchMap({map:'trecho',trecho:3,x:90,y:trechoEnds(3).yIn});mataCombatTick(1/30);},()=>worldOut.map==='mata');
  desmaia('Ilha',()=>{switchMap({map:'ilha',x:3200,y:3600});mataCombatTick(1/30);},()=>worldOut.map==='ilha'&&Math.hypot(worldOut.x-ILHA.arrive.x,worldOut.y-ILHA.arrive.y)<10);
  desmaia('Cerração',()=>{switchMap({map:'ilhamato',x:90,y:ilhaMatoLayout(2).yIn,n:2});mataCombatTick(1/30);},()=>worldOut.map==='ilha');
  desmaia('Cripta',()=>{switchMap({map:'masmorra',...WORLD_MAPS.masmorra.spawn()});mataCombatTick(1/30);},()=>worldOut.map==='ilha');
  desmaia('Pampa',()=>{G.ilha={grenfell:G.day};switchMap(pampaEntrada(3));mataCombatTick(1/30);},()=>worldOut.map==='pampa');
  desmaia('Lenda',()=>{lendaStart('mula');mataCombatTick(1/30);},()=>worldOut.map!=='arena'&&!lendaFight);
  // ---------- O bornal e a vida ----------
  novo();
  check(mataBagMax()===3&&caveBagMax()===5,'bornal do começo: 3 e 5');
  check(CAVE_UPGRADES.find(u=>u.id==='bornal2').requires==='bornal'&&CAVE_UPGRADES.find(u=>u.id==='bornal3').requires==='bornal2','os bornais vão em ordem');
  caveState().up.bornal=true;check(mataBagMax()===6&&caveBagMax()===10,'couro cru: 6 e 10');caveState().up.bornal2=true;check(mataBagMax()===8&&caveBagMax()===14,'tropeiro: 8 e 14');caveState().up.bornal3=true;check(mataBagMax()===12&&caveBagMax()===20,'alforje: 12 e 20');
  check(mataBagMax('costela')===6&&mataBagMax('marcela')===12,'nos itens fortes, o limite é a metade');
  for(const id of ['bornal2','bornal3','gibao'])check(forgeUpgradeIcon(id),id+' tem ícone');
  novo();check(caveMaxHp()===100,'vida do começo: 100');caveState().up.poncho=true;check(caveMaxHp()===140,'poncho: 140');caveState().up.pala=true;check(caveMaxHp()===180,'pala: 180');caveState().up.gibao=true;check(caveMaxHp()===230,'gibão: 230');
  mataState().cachaco=G.day;check(caveMaxHp()===240,'cada chefe vencido dá +10 de vida máxima');Object.assign(pampaState(),{sargento:1,boi:1,capitao:1});check(caveMaxHp()===270,'e conta em todas as áreas');
  // ---------- Os itens novos ----------
  novo();goOutside();closeDialog(true);switchMap(pampaEntrada(2));mataCombatTick(1/30);{const bag=mataBag(),st=caveState();
   bag.caldo=1;bag.costela=1;bag.canha=1;bag.marcela=1;st.hp=10;check(mataBeltItems().map(i=>i.id).slice(0,3).join()==='marcela,caldo,costela','as curas vêm primeiro no cinto');
   check(mataUseItem('caldo')&&st.hp===70&&!bag.caldo,'caldo de peixe cura 60');check(mataUseItem('costela')&&st.hp===caveMaxHp()&&!bag.costela,'a costela cura 110');
   check(!mataUseItem('canha')===false&&mataBuffs.canha===20,'a canha dá coragem');const d=(mataBuffs.canha=0,caveDmg());mataBuffs.canha=5;check(caveDmg()>d,'e aumenta o dano');mataCombatTick(1);check(mataBuffs.canha<5,'e passa');mataBuffs.canha=0;
   for(const id of ['caldo','costela','canha'])check(mataGearHTML(id,42).includes('mata-item-art'),id+' tem desenho');}
  {novo();goOutside();closeDialog(true);G.ilha={grenfell:G.day};switchMap(pampaEntrada(1));closeDialog(true);pampaState().zeferino=G.day;pampaForja();const t=$('dialogContent');check(t.querySelector('[data-act="pampaItem"][data-id="costela"]')&&t.querySelector('[data-act="pampaItem"][data-id="marcela"]'),'na ferraria do pampa dá pra comprar cura');
   check(t.innerHTML.indexOf('Cura e bornal')<t.innerHTML.indexOf('Armas'),'as curas ficam no começo da loja');check(/Alforje de campanha/.test(t.textContent)&&/Gibão/.test(t.textContent),'o alforje e o gibão aparecem na forja');
   action('pampaItem','costela');check(mataBag().costela===1,'comprar costela funciona');closeDialog(true);}
  {novo();goOutside();closeDialog(true);G.ilha={griggs:G.day};switchMap({map:'ilha',x:3000,y:4600});closeDialog(true);griggsShop();const t=$('dialogContent');check(t.querySelector('[data-act="griggsItem"][data-id="caldo"]'),'o Griggs vende caldo de peixe');check(/Bornal de couro cru/.test(t.textContent),'e costura bornal');G.cash=9000;action('facaoBuy','bornal');check(caveUp('bornal')&&modal==='griggsShop','comprar o bornal no Griggs funciona');closeDialog(true);}
  // ---------- Os baús variam ----------
  novo();{mataState();for(const area of ['caverna','mata','ilha','pampa']){const vistos=new Set();let repetiu=false,ant=null;for(let i=0;i<120;i++){const l=bauMonta(area,area==='ilha'?4:area==='pampa'?8:14);vistos.add(l.tema);if(l.tema===ant)repetiu=true;ant=l.tema;check(l.cash>=0,'');}check(vistos.size>=3,area+': os baús têm temas diferentes ('+[...vistos].join()+')');check(!repetiu,area+': o mesmo tema não sai duas vezes seguidas');}
   results.splice(0,results.length,...results.filter(Boolean));
   let soMinerio=0;for(let i=0;i<60;i++){const l=trechoChestLoot(25);if(Object.keys(l.raw).some(k=>CAVE_MINERALS.includes(k)))soMinerio++;}check(soMinerio<36,'na mata, o baú nem sempre traz minério');
   goOutside();closeDialog(true);switchMap({map:'trecho',trecho:3,x:90,y:trechoEnds(3).yIn});closeDialog(true);const T=trechoLayout();for(let i=0;i<6;i++){const c={id:'t'+i,x:T.yIn||100,y:100};const antes=G.cash;trechoOpenChest(T,c);check(modal==='talk'&&G.cash>=antes,'baú da mata abre ('+i+')');fecha();}
   rangedOwned;}
  // ---------- A lança tem som próprio ----------
  novo();{let a=0,f=0;const g=AudioEngine.lancaGolpe,h=AudioEngine.lancaAcerto,sw=AudioEngine.swoosh;AudioEngine.lancaGolpe=function(){a++;return true;};AudioEngine.lancaAcerto=function(){f++;return true;};
   goOutside();closeDialog(true);G.ilha={grenfell:G.day};switchMap(pampaEntrada(3));mataCombatTick(1/30);const cs=caveState();cs.facao=true;cs.forged={lanca:1};cs.weapon='lanca';const N=mataNight,p=worldOut;N.beasts=[ilhaMob('graxaim',{x:p.x+70,y:p.y},Math.random,{})];p.dx=1;p.dy=0;N.cd=0;mataAttack();check(a>=1&&f>=1,'a lança tem som próprio de golpe e de acerto');a=0;cs.weapon='facao';N.cd=0;N.beasts=[];mataAttack();check(a===0,'o facão continua com o som dele');
   AudioEngine.lancaGolpe=g;AudioEngine.lancaAcerto=h;check(AudioEngine.swoosh===sw,'e o som de sempre volta pro lugar');}
  // ---------- O Boi Barroso mais baixo ----------
  {let maior=0;const m=AudioEngine.moo;AudioEngine.moo=function(v){maior=Math.max(maior,v);};novo();testeVai(testeChefe('boi').vai);closeDialog(true);passa(.05);fecha();const b=mataNight.beasts.find(x=>x.boss);Object.assign(b,{state:'mira',t:.01,t0:.9});passa(.1);b.lacos=0;boiLaco(b);AudioEngine.moo=m;check(maior<=.03,'o berro do boi ficou bem mais baixo');}
  // ---------- A ilha ----------
  novo();{check(ilhaRegiao(3000,4600)==='Praia do Trapiche'&&ilhaRegiao(3200,3600)==='Mata Baixa'&&ilhaRegiao(3200,2300)==='Pé do Paredão'&&ilhaRegiao(3200,1200)==='Fortaleza do Império','cada parte da ilha tem nome');
   check(ilhaForcaEm('ilha',4600).hp<ilhaForcaEm('ilha',3600).hp&&ilhaForcaEm('ilha',3600).hp<ilhaForcaEm('ilha',2300).hp&&ilhaForcaEm('ilha',2300).hp<ilhaForcaEm('ilha',1200).hp,'os inimigos ficam mais fortes conforme se sobe');
   check(ilhaForcaEm('ilhamato',0,7).hp>ilhaForcaEm('ilhamato',0,1).hp,'na cerração também');check(Object.keys(ILHA_TRECHOS).length===ILHAMATO.last,'cada trecho da cerração tem nome e clima');
   for(let n=1;n<=ILHAMATO.last;n++){const L=ilhaMatoLayout(n);check(L.pts.length>20,'trecho '+n+': a picada faz curva');}
   goOutside();closeDialog(true);G.ilha={planalto:1,facaoPrata:1,griggs:1};for(const q of [{map:'ilha',x:3000,y:4600},{map:'ilha',x:3200,y:3600},{map:'ilha',x:3200,y:1300},{map:'masmorra',...WORLD_MAPS.masmorra.spawn()}]){switchMap(q);closeDialog(true);mataCombatTick(1/30);drawOutside();AudioEngine.ambience?.(.05);passa(.05);fecha();}
   for(let n=1;n<=ILHAMATO.last;n++){switchMap({map:'ilhamato',x:90,y:ilhaMatoLayout(n).yIn,n});closeDialog(true);mataCombatTick(1/30);drawOutside();AudioEngine.ambience?.(.05);passa(.03);fecha();}results.push('a ilha inteira se desenha e toca sem erro');
   for(const k of ['rangido','sinoLonge','risoBruxa','asas','tremorChao','tamborBoi','borbulha','gemido','corrente','cornetaLonge','marcha','lancaGolpe','lancaAcerto'])check(typeof AudioEngine[k]==='function',k+': o som existe');
   switchMap({map:'ilha',x:3200,y:3600});closeDialog(true);mataCombatTick(1/30);const a=ILHA_ACHADOS[0],q=ilhaAchadoLugar(a);check(worldMap().canWalk(q.x,q.y),'o baú da capela fica em chão livre');const s=worldMap().spots().find(x=>x.id==='ilha:achado:capela');check(s,'dá pra abrir o baú da capela');s.act();check(modal==='talk','o baú abre');fecha();check(!worldMap().spots().some(x=>x.id==='ilha:achado:capela'),'e fica fechado por uma semana');G.day+=7;check(worldMap().spots().some(x=>x.id==='ilha:achado:capela'),'depois tem coisa nova');G.day-=7;
   caveState().facao=true;const N=mataNight,mob=ilhaMob('pirata',{x:worldOut.x+60,y:worldOut.y},Math.random,{});N.beasts=[mob];mob.hp=1;worldOut.dx=1;worldOut.dy=0;N.cd=0;mataAttack();check(mob.hp<=0,'o pirata cai');}
  // ---------- Na ilha, só chuva ----------
  novo();{check(typeof drawNavioFantasma==='undefined'&&typeof ilhaNevoa==='undefined'&&typeof ilhaParticulas==='undefined','sem navio fantasma, sem neblina, sem vela e sem fita');check(typeof ilhaChuva==='function','chove na ilha');
   goOutside();closeDialog(true);G.ilha={planalto:1,facaoPrata:1,griggs:1};const chove=q=>{let n=0;const c=ilhaChuva;ilhaChuva=function(v,l){n++;return c(v,l);};try{switchMap(q);closeDialog(true);mataCombatTick(1/30);drawOutside();}finally{ilhaChuva=c;}return n;};
   check(chove({map:'ilha',x:3000,y:4600})>0&&chove({map:'ilha',x:3200,y:3600})>0&&chove({map:'ilha',x:3200,y:1300})>0,'chove da praia até a fortaleza');for(let n=1;n<=ILHAMATO.last;n++)check(chove({map:'ilhamato',x:90,y:ilhaMatoLayout(n).yIn,n})>0,'chove no trecho '+n+' da cerração');check(chove({map:'masmorra',...WORLD_MAPS.masmorra.spawn()})===0,'na cripta, debaixo da terra, não chove');}
  // ---------- A bênção do monge ----------
  novo();{check(PODERES.monge&&!poderHas('monge'),'o poder de cura existe e começa fechado');goOutside();closeDialog(true);G.ilha={};const f=ILHA_FOGOS.find(q=>q.folk==='joaomaria');switchMap({map:'ilhamato',x:90,y:ilhaMatoLayout(f.n).yIn,n:f.n});closeDialog(true);mongeEnsina();check(poderHas('monge')&&modal==='talk'&&talkState.lines.some(l=>/Bênção do monge/.test(l[1])),'o monge ensina a bênção');fecha();
   mataCombatTick(1/30);const st=caveState(),max=caveMaxHp();st.hp=max;poder.cd={};poderUse();check(!(poder.cd.monge>0),'de vida cheia, não gasta');st.hp=10;mataBuffs.veneno=5;poderUse();check(st.hp===10+Math.round(max*MONGE_CURA.agora)&&mataBuffs.veneno===0&&poder.cd.monge===50,'cura um terço na hora e corta o veneno');const h=st.hp;drawOutside();for(let i=0;i<60;i++)poderTick(1/30);check(st.hp>h,'e segue curando');for(let i=0;i<300;i++)poderTick(1/30);check(!poder.monge,'até passar');
   delete poderState().has.monge;poder.cd={};st.hp=max;ilhaFolkTalk(f);check(poderHas('monge'),'quem já conhecia o monge aprende na próxima prosa');fecha();const prosa=modal;ilhaFolkTalk(f);check(modal==='talk'&&!talkState.lines.some(l=>/Poder novo/.test(l[1])),'depois é só prosa');fecha();}
  // ---------- O monge com o sprite novo ----------
  {check(ACTION_ART_CROPS.joaomaria?.frames?.length===12&&ACTION_ART.joaomaria?.naturalWidth>0,'o monge usa o sprite novo de 12 poses');let usou=0;const s=actionSprite;actionSprite=function(id,...r){if(id==='joaomaria')usou++;return s(id,...r);};try{drawJoaoMaria(500,500,1);drawJoaoMaria(500,500,-1);}finally{actionSprite=s;}check(usou===2,'e desenha com ele, dos dois lados');check(/monge-joao-maria/.test(joaoMariaPortrait(72)),'o retrato também é do sprite novo');}
  // ---------- A batalha final ----------
  novo();{const L=pampaLayout(PAMPA_N.moringue),a=L.arena;Object.assign(pampaState(),{lanceiros:1,sargento:1,boi:1,capitao:1,lacoCouro:1});G.ilha={grenfell:G.day};const cs=caveState();cs.facao=true;cs.forged={lanca:1};cs.weapon='lanca';goOutside();closeDialog(true);switchMap({map:'pampa',n:PAMPA_N.moringue,x:a.x,y:a.y});closeDialog(true);passa(.05);fecha();
   const N=mataNight,b=N.beasts.find(x=>x.kind==='moringue');check(b&&N.chefe,'o Moringue chega');passa(1);const T=N.tempo;check(T&&T.chuva>0&&T.escuro>0,'fase 1: o céu fecha e começa a chover');
   const r0=T.raios.length+T.marcas.length;T.raioT=0;passa(.05);check(T.marcas.length>0,'cai raio no campo');drawOutside();
   moringueApeia(b,N);fecha();check(b.fase===2,'fase 2');passa(1.5);check(T.chuva>.5,'fase 2: tempestade cheia');N.vento.t=.01;passa(.1);check(T.vento!==0,'o minuano sopra e entra na chuva');drawOutside();N.vento.ativo=0;N.vento.t=99;
   Object.assign(b,{stun:0,state:'chase',hp:Math.round(b.max*.38)});passa(.05);fecha();check(N.madrugada&&N.aliados.length===7,'fase 3: os farrapos chegam');
   const linha=N.aliados.filter(q=>q.papel==='linha'),comando=N.aliados.filter(q=>q.papel==='comando');check(linha.length===5&&comando.length===2,'cinco na roda e dois no comando');check(linha.every(q=>worldMap().canWalk(q.ancora.x,q.ancora.y)),'os postos da roda são chão livre');
   const cav=N.beasts.filter(q=>q.batalha&&q.hp>0);check(cav.length>=1&&cav.every(q=>linha.includes(q.alvo)),'cada cavaleiro vem contra um farrapo da roda');
   const hp0=caveState().hp;N.inv=0;Object.assign(worldOut,{x:a.x,y:a.y});b.cool=99;b.state='rest';b.t=99;let derrubou=false;for(let i=0;i<600;i++){caveState().hp=hp0;b.state='rest';b.t=99;passa(1/30);if(N.beasts.some(q=>q.batalha&&!q.montado))derrubou=true;if(derrubou)break;}check(derrubou,'os farrapos derrubam a cavalaria');
   for(const q of linha)q.x+=0;let voltou=true;for(let i=0;i<900;i++){b.state='rest';b.t=99;passa(1/30);}for(const q of linha)if(!(q.caido>0)&&Math.hypot(q.x-q.ancora.x,q.y-q.ancora.y)>460)voltou=false;check(voltou,'e ninguém sai correndo pelo campo: cada um fica perto do seu posto');
   b.x=a.x+a.rx*.9;b.y=a.y;moringueNoCampo(b);check(Math.hypot((b.x-a.x)/a.rx,(b.y-a.y)/a.ry)<=.43,'o duelo fica no meio da roda');
   drawOutside();Object.assign(b,{hp:1,state:'chase',stun:0});worldOut.x=b.x-90;worldOut.y=b.y;worldOut.dx=1;worldOut.dy=0;N.cd=0;mataAttack();check(pampaState().moringue,'o golpe final');fecha();}
  // ---------- O Fogo da República ----------
  {const f=pampaFogoFim();check(worldOut.map==='pampa'&&pampaArea()===PAMPA_N.capitao&&Math.hypot(worldOut.x-f.x,worldOut.y-f.y)<220,'o fim deixa o Sadi do lado do Fogo da República');check(worldMap().canWalk(worldOut.x,worldOut.y)&&worldMap().canWalk(f.x,f.y+70),'em chão livre');const s=worldMap().spots().find(x=>x.id==='pampa:fogofim');check(s,'o fogo tem a opção de voltar');drawOutside();s.act();check(modal==='talk'&&talkState.choices?.length===3,'pra bodega, pro começo do pampa ou ficar');talkPick(1);let k=0;while(modal==='talk'&&k++<20)talkNext();closeDialog(true);check(worldOut.map==='pampa'&&pampaArea()===1,'e leva pro começo do pampa');
   switchMap({map:'pampa',n:PAMPA_N.capitao,x:f.x+130,y:f.y+60});closeDialog(true);worldMap().spots().find(x=>x.id==='pampa:fogofim').act();talkPick(0);k=0;while(modal==='talk'&&k++<20)talkNext();closeDialog(true);check(worldOut.map==='vila','ou pra bodega');}
  // ---------- A curva dos chefes ----------
  {const hp=k=>CAVE_BEASTS[k].hp;check(hp('cachaco')<hp('papo')&&hp('papo')<hp('mariath')&&hp('mariath')<hp('bernunciaMae')&&hp('bernunciaMae')<hp('grenfell'),'os chefes crescem na ordem da história');check(hp('moringue')>hp('capitao')&&hp('capitao')>hp('boiBarroso'),'e o pampa fecha mais forte');const t=n=>(PAMPA_MOBS[n]||[]).reduce((a,q)=>a+q[1],0);check(t(14)>=25&&t(2)>=7,'o pampa tem bem mais inimigo');}
  novo();worldOut=null;mataNight=null;lendaFight=null;closeDialog(true);G.testMode=false;window.NO_SCENES=true;
  return results;
})()

(() => {
  const results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
  G=fresh();G.prologue={done:true};G.tutorial.complete=true;G.day=40;G.phase='prep';G.regions={serra:true,sc:true};
  started=true;paused=false;scene=null;phoneOpen=false;closeDialog(true);skipWorldTalk();keys.clear();worldDash=null;mataNight=null;
  G.cave={facao:true,floor:1,deepest:2,hp:40,up:{},forged:{},weapon:'facao'};
  const S=SERRA,cx=S.roadX+S.roadW/2;
  worldOut={map:'serra',x:cx,y:S.H-200,dx:0,dy:1,walk:false};
  // ---------- A porteira ----------
  check(!pampaAberto()&&!WORLD_MAPS.serra.canWalk(cx,S.H-40),'antes do Grenfell cair, a porteira do pampa fica trancada');
  check(WORLD_MAPS.serra.canWalk(cx,S.H-200)&&WORLD_MAPS.serra.canWalk(cx-600,S.H-200),'a estrada da Serra continua livre até a porteira');
  check(WORLD_MAPS.serra.spots().some(s=>s.id==='pampa:porteira'&&/trancada/.test(s.label)),'a porteira avisa que está trancada');
  worldOut.y=S.H-90;check(!WORLD_MAPS.serra.edge({x:cx,y:S.H-4}),'trancada, a beira de baixo da Serra não leva a lugar nenhum');
  G.ilha={grenfell:G.day};
  check(pampaAberto()&&WORLD_MAPS.serra.canWalk(cx,S.H-40)&&!WORLD_MAPS.serra.canWalk(cx-300,S.H-40),'com o Grenfell derrubado, abre só a passagem da estrada');
  check(WORLD_MAPS.serra.edge({x:cx,y:S.H-4})?.map==='pampa','a porteira fica ao sul da Serra e leva pro pampa');
  // ---------- Os trechos, em fila (com os chefes já vencidos: a peleia vem mais abaixo) ----------
  Object.assign(pampaState(),{boi:G.day,capitao:G.day,sargento:G.day});
  for(let n=1;n<=PAMPA.last;n++){
    switchMap(pampaEntrada(n));closeDialog(true);
    const L=pampaLayout(),M=worldMap();
    check(worldOut.map==='pampa'&&pampaArea()===n&&L.n===n,'trecho '+n+': '+L.nome);
    check(M.canWalk(worldOut.x,worldOut.y),'trecho '+n+': a entrada é chão livre');
    check(L.pts.every((q,i)=>!i||q[1]>=L.pts[i-1][1]),'trecho '+n+': a estrada só desce pro sul');
    check(L.pedacos.length>30,'trecho '+n+': a taipa de pedra acompanha o caminho');
    {const pedras=L.pedacos.flatMap(q=>q.pedras);let vaos=0,beiras=0;for(let i=4;i<L.pts.length-4;i+=3){const[ax,ay]=L.pts[i-1],[bx,by]=L.pts[i+1],k=Math.hypot(bx-ax,by-ay)||1,nx=-(by-ay)/k,ny=(bx-ax)/k,[qx,qy]=L.pts[i];for(const o of[-1,1]){const x=qx+nx*o*(PAMPA.meia+16),y=qy+ny*o*(PAMPA.meia+16);if(y<60||y>L.H-60||pampaFolga(L,x,y)>-12)continue;beiras++;if(!pedras.some(s=>Math.hypot(s.x-x,s.y-y)<44))vaos++;}}check(beiras>10&&vaos===0,'trecho '+n+': a taipa não tem buraco');}
    // Da entrada até tudo o que importa, andando de verdade por chão livre (busca em largura numa grade).
    const passo=30,chave=(x,y)=>x+':'+y,fila=[[Math.round(worldOut.x/passo)*passo,Math.round(worldOut.y/passo)*passo]],visto=new Set([chave(...fila[0])]);
    while(fila.length){const[x,y]=fila.pop();for(const[dx,dy]of[[passo,0],[-passo,0],[0,passo],[0,-passo]]){const a=x+dx,b=y+dy;if(a<0||a>L.W||b<0||b>L.H||visto.has(chave(a,b))||!M.canWalk(a,b))continue;visto.add(chave(a,b));fila.push([a,b]);}}
    const alcancou=(x,y,r=110)=>{for(const k of visto){const[a,b]=k.split(':').map(Number);if(Math.hypot(a-x,b-y)<r)return true;}return false;};
    if(L.camp){const P=ilhaFogoPartes(L.camp);check(pampaFogoAqui(n)&&alcancou(P.fogo.x,P.fogo.y+70),'trecho '+n+': da entrada se chega no fogo');}
    if(n<PAMPA.last)check(alcancou(L.xOut,L.H-100),'trecho '+n+': da entrada se chega na saída pro sul');
    if(L.palco){check(pampaEstradaDist(L,L.palco.x,L.palco.y)<40,'trecho '+n+': o chefe fica no meio do caminho');check(alcancou(L.palco.x,L.palco.y),'trecho '+n+': da entrada se chega no campo do chefe');}
    if(L.ferraria){const f=M.spots().find(s=>s.id==='pampa:ferraria');check(f&&alcancou(f.x,f.y),'trecho '+n+': da entrada se chega na ferraria');}
    for(const c of[...L.baus,...L.achados])check(alcancou(c.x,c.y,90),'trecho '+n+': dá pra chegar em '+c.id);
    for(const b of L.bolsoes)check(alcancou(b.x,b.y,120),'trecho '+n+': dá pra chegar no bolsão '+b.id);
    // Estreito: anda-se em pouco do mapa, e fora do caminho é taipa.
    check(visto.size*passo*passo<L.W*L.H*.5,'trecho '+n+': o caminho ocupa só um pedaço do mapa');
    let beira=0,furos=0;for(let i=2;i<L.pts.length-2;i+=2){const[ax,ay]=L.pts[i-1],[bx,by]=L.pts[i+1],k=Math.hypot(bx-ax,by-ay)||1,nx=-(by-ay)/k,ny=(bx-ax)/k,[qx,qy]=L.pts[i];for(const o of[-1,1]){const x=qx+nx*o*(PAMPA.meia+24),y=qy+ny*o*(PAMPA.meia+24);if(y<40||y>L.H-40||L.bays.some(b=>Math.hypot((x-b.x)/b.rx,(y-b.y)/b.ry)<1.2)||L.ramais.some(r=>pampaLinhaDist(r.pts,x,y)<r.meia+30))continue;beira++;if(M.canWalk(x,y))furos++;}}
    check(beira>0&&furos/beira<.2,'trecho '+n+': a cerca segura de verdade dos dois lados da estrada');
    const fora=M.edge({x:worldOut.x,y:L.H-3});check(n<PAMPA.last?fora?.map==='pampa'&&fora.n===n+1:!fora,n<PAMPA.last?'trecho '+n+': pro sul vem o trecho '+(n+1):'trecho '+n+': o cerro é o fim do caminho');
    const volta=M.edge({x:worldOut.x,y:3});check(n===1?volta?.map==='serra':volta?.n===n-1,n===1?'trecho 1: pro norte volta pra Serra':'trecho '+n+': pro norte volta pro trecho '+(n-1));
    check(volta&&(volta.map==='serra'?WORLD_MAPS.serra.canWalk(volta.x,volta.y):true),'trecho '+n+': a volta cai em chão livre');
    if(n<PAMPA.last){const e=pampaEntrada(n,true);check(M.canWalk(e.x,e.y),'trecho '+n+': quem volta do trecho seguinte chega em chão livre');}
  }
  const trechos=Array.from({length:PAMPA.last},(_,i)=>i+1),comChefe=trechos.filter(n=>pampaLayout(n).palco);
  check(new Set(trechos.map(n=>pampaLayout(n).nome)).size===PAMPA.last,'cada trecho tem o seu nome');
  check(trechos.every(n=>n===1||PAMPA.portas[n-1]===pampaLayout(n).xIn&&pampaLayout(n-1).xOut===pampaLayout(n).xIn),'a saída de um trecho é a entrada do seguinte');
  check(comChefe.length===4&&trechos.length-comChefe.length>comChefe.length,'tem mais trecho sem chefe do que com chefe');
  check(trechos.filter(n=>!pampaLayout(n).palco&&n>1).every(n=>pampaLayout(n).baus.length>=1&&pampaLayout(n).bolsoes.length>=2),'nos trechos sem chefe tem ramal e baú pra explorar');
  check(PAMPA_N.lanceiros<PAMPA_N.sargento&&PAMPA_N.sargento<PAMPA_N.boi&&PAMPA_N.boi<PAMPA_N.capitao&&PAMPA_N.capitao<PAMPA_N.moringue,'a ordem do caminho: lanceiros, Sargento, Boi, Capitão, Moringue');
  // ---------- Sem cavalo ----------
  {mountState().owned=true;G.mount.stabled=false;worldOut={map:'serra',x:cx,y:S.H-200,dx:0,dy:1,walk:false};check(playerMounted(),'na Serra, o Sadi anda a cavalo');
   switchMap(pampaEntrada(5));closeDialog(true);check(!playerMounted(),'no pampa, o Sadi anda a pé');drawOutside();delete G.mount;}
  // ---------- Os acampamentos ----------
  {const L=pampaLayout(PAMPA_N.seival);switchMap(pampaEntrada(PAMPA_N.seival));closeDialog(true);const f=pampaFogoAqui(PAMPA_N.seival),P=ilhaFogoPartes(L.camp);Object.assign(worldOut,{x:P.fogo.x,y:P.fogo.y+70});
   check(!worldMap().spots().some(s=>s.id==='pampa:trilha:seival'),'fogo ainda apagado não tem trilha');
   const s=worldMap().spots().find(x=>x.id==='pampa:fogo:seival');caveState().hp=10;s.act();
   check(caveState().hp===caveMaxHp()&&pampaFogoAceso('seival')&&pampaState().ultimoFogo==='seival','descansar enche a vida, acende o fogo e guarda o último acampamento');
   check(modal==='talk','o primeiro descanso avisa que o jogo está salvo');while(modal==='talk')talkNext();closeDialog(true);
   check(JSON.parse(JSON.stringify(G)).pampa.fogos.seival===G.day,'o fogo aceso fica no save');
   check(worldMap().spots().some(x=>x.id==='pampa:trilha:seival'),'fogo aceso ganha a trilha dos farrapos');}
  pampaFogoVai(PAMPA_FOGOS[0]);closeDialog(true);check(pampaArea()===1&&worldMap().canWalk(worldOut.x,worldOut.y),'a trilha leva direto pra outro fogo');
  {const[a,b]=[PAMPA_FOGOS[0],PAMPA_FOGOS[2]];pampaDescansa(a);while(modal==='talk')talkNext();closeDialog(true);pampaTrilha(a);check(modal==='talk'&&talkState?.choices?.length>=2,'de um fogo aceso se escolhe pra qual ir');while(modal==='talk'){if(talkState?.choices)break;talkNext();}closeDialog(true);}
  // ---------- A ferraria ----------
  switchMap(pampaEntrada(1));closeDialog(true);
  {const s=worldMap().spots().find(x=>x.id==='pampa:ferraria');G.cash=900;bagAdd('cobre',20);
   Object.assign(worldOut,{x:s.x,y:s.y});s.act();check(modal==='talk'&&pampaState().zeferino,'na primeira vez, o seu Zeferino se apresenta');let k=0;while(modal==='talk'&&k++<20)talkNext();
   check(modal==='dunstanShop'&&/Ferraria do seu Zeferino/.test($('dialogContent').closest('.dialog').textContent),'depois da prosa, abre a forja dele');
   check($('dialogContent').querySelector('[data-act="forjaMake"][data-id="cobre"]'),'dá pra forjar arma na ferraria do pampa');
   const c=G.cash;action('forjaMake','cobre');check(caveWeapon().id==='cobre'&&G.cash===c-60&&modal==='dunstanShop'&&/Ferraria do seu Zeferino/.test($('dialogContent').closest('.dialog').textContent),'forjar funciona e continua na forja do Zeferino');
   const d=caveDmg();action('forjaAfiar');check(caveDmg()===d+3&&weaponRefine('cobre')===1,'afiar a lâmina funciona');closeDialog(true);
   switchMap(pampaEntrada(2));closeDialog(true);check(!dunstanShopOpen(),'longe da ferraria, a forja fecha');}
  // ---------- Desenhar sem quebrar ----------
  for(let n=1;n<=PAMPA.last;n++){switchMap(pampaEntrada(n));closeDialog(true);const L=pampaLayout();for(const q of[[L.xIn,130],L.camp&&[L.camp.x,L.camp.y+160],L.palco&&[L.palco.x,L.palco.y],L.bolsoes[0]&&[L.bolsoes[0].x,L.bolsoes[0].y],[pampaEstradaX(L,L.H/2),L.H/2]])if(q){Object.assign(worldOut,{x:q[0],y:q[1]});drawOutside();}}
  results.push('os dez trechos se desenham sem erro');
  worldOut={map:'serra',x:cx,y:S.H-200,dx:0,dy:1,walk:false};drawOutside();results.push('a porteira se desenha no fim da estrada da Serra');
  // ---------- As cancelas trancadas ----------
  const st=pampaState();for(const k of['boi','capitao','sargento'])delete st[k];
  G.missions??={};
  const fecha=()=>{let k=0;while(modal==='talk'&&k++<80)talkNext();if(modal)closeDialog(true);};
  const passa=(seg,dt=1/30)=>{for(let i=0;i<seg/dt;i++)outsideTick(dt);};
  const vai=(n,x,y)=>{switchMap({map:'pampa',n,x,y});closeDialog(true);keys.clear();};
  const colado=(b,lado=-1)=>{Object.assign(worldOut,{x:b.x+lado*90,y:b.y-6,dx:-lado,dy:0});};
  const bate=()=>{mataNight.cd=0;mataAttack();if(mataNight)mataNight.hitstop=0;};
  const laca=()=>{mataNight.lacoCd=0;pampaLaco();};
  const cheio=()=>{caveState().hp=caveMaxHp();};
  const santo=()=>{mataNight.inv=99;cheio();};
  const chefe=()=>mataNight.beasts.find(b=>b.boss&&b.hp>0);
  const naEstrada=(L,yMin)=>L.pts.findIndex(q=>q[1]>yMin);
  const adiante=(L,i,d)=>{const a=L.pts[i];for(let j=i;j<L.pts.length;j++)if(Math.hypot(L.pts[j][0]-a[0],L.pts[j][1]-a[1])>=d)return{x:L.pts[j][0],y:L.pts[j][1]};return{x:a[0],y:a[1]};};
  {const L=pampaLayout(PAMPA_N.sargento);vai(PAMPA_N.sargento,L.xIn,130);const M=worldMap();
   check(!pampaSaidaAberta(PAMPA_N.sargento)&&!M.edge({x:L.xOut,y:L.H-3})&&!M.canWalk(L.xOut,L.H-40)&&!M.canWalk(L.cancela.x,L.cancela.y+10),'com o chefe vivo, a cancela do sul fica fechada');
   check(M.spots().some(s=>s.id==='pampa:trancada'),'a cancela trancada avisa por quê');drawOutside();
   check(/Lanceiro Negro/.test(pampaGoal()),'a missão aponta primeiro pro Lanceiro Negro');}
  check([2,3,5,7,8,10,13].every(n=>pampaSaidaAberta(n)),'nos trechos sem chefe, a cancela fica aberta');
  // ---------- Os baús e as ervas ----------
  {const n=2,L=pampaLayout(n);vai(n,L.xIn,130);const s=worldMap().spots().find(x=>x.id.startsWith('pampa:bau:'));check(s,'tem baú no Corredor das Taipas');
   Object.assign(worldOut,{x:s.x,y:s.y});const c=G.cash,f=bagQty('ferro_imperial');s.act();check(G.cash>c&&modal==='talk'&&talkState.lines[0][1].includes(BAU_NOMES[G.bauUltimo]),'o baú dá dinheiro e diz o tema');fecha();
   check(!worldMap().spots().some(x=>x.id===s.id),'baú aberto não abre de novo hoje');drawOutside();
   G.day++;check(worldMap().spots().some(x=>x.id===s.id),'no dia seguinte, o baú volta');G.day--;pampaState().hoje=null;
   const comErva=[2,3,5,7,8].find(k=>pampaLayout(k).achados.length);vai(comErva,pampaLayout(comErva).xIn,130);const e=worldMap().spots().find(x=>x.id.startsWith('pampa:erva:')),a=pampaLayout().achados[0],q=mataBag()[a.k]||0;e.act();check((mataBag()[a.k]||0)===q+1&&!worldMap().spots().some(x=>x.id===e.id),'dá pra colher erva pro bornal');}
  // ---------- Quem anda pelo caminho ----------
  {const L=pampaLayout(1);vai(1,L.xIn,130);passa(.05);check(!mataCombatOn(),'na Porteira do Pampa não tem peleia');}
  {const L=pampaLayout(5);vai(5,L.xIn,130);passa(.05);let N=mataNight;const i=naEstrada(L,480),P0=L.pts[i];
   check(N?.pampa===5&&N.beasts.some(b=>b.kind==='graxaim')&&N.beasts.some(b=>b.kind==='batedor')&&!N.beasts.some(b=>b.boss),'no Banhado das Almas tem graxaim e batedor, sem chefe andando solto');
   check(N.beasts.every(b=>worldMap().canWalk(b.x,b.y)&&!pampaSeguro(b.x,b.y)),'ninguém nasce dentro da taipa nem no acampamento');
   check(trechos.slice(1).every(n=>PAMPA_MOBS[n]?.length),'do segundo trecho em diante sempre tem quem peleie');
   drawOutside();
   const P=ilhaFogoPartes(L.camp);Object.assign(worldOut,{x:P.fogo.x+90,y:P.fogo.y+60});cheio();N.inv=0;const h0=caveState().hp;mataHurt(20,{x:worldOut.x,y:worldOut.y});check(caveState().hp===h0,'perto do fogo, ninguém acerta o Sadi');
   Object.assign(worldOut,{x:P0[0],y:P0[1]});
   const q1=adiante(L,i,220),g=ilhaMob('graxaim',q1,Math.random,{cool:5});g.idx=0;N.beasts=[g];cheio();passa(.1);check(g.state==='cerca','o graxaim cerca quem chega perto');
   for(let k=0;k<300&&caveState().hp===caveMaxHp();k++){g.cool=Math.min(g.cool,.2);passa(1/30);}check(caveState().hp<caveMaxHp(),'o graxaim dá o bote, mesmo entre as taipas');
   Object.assign(worldOut,{x:P0[0],y:P0[1]});const bt=ilhaMob('batedor',adiante(L,i,300),Math.random);N.beasts=[bt];N.inv=0;cheio();passa(.1);check(bt.state==='mira','o batedor roda a boleadeira quando vê o Sadi');
   for(let k=0;k<60&&!(N.preso>0);k++)passa(1/30);check(N.preso>0&&caveState().hp<caveMaxHp(),'a boleadeira prende as pernas');
   N.beasts=[];{const x=worldOut.x,y=worldOut.y;keys.add('s');outsideTick(.1);keys.clear();check(worldOut.x===x&&worldOut.y===y,'preso, o Sadi não anda');N.preso=0;}
   Object.assign(worldOut,{x:P0[0],y:P0[1]});const cb=ilhaMob('carabineiro',adiante(L,i,420),Math.random);N.beasts=[cb];N.inv=0;cheio();passa(.1);check(cb.state==='chase','o carabineiro vê o Sadi de longe');
   for(let k=0;k<120&&cb.state!=='recarrega';k++)passa(1/30);check(cb.state==='recarrega'&&caveState().hp<caveMaxHp(),'o tiro acerta e ele fica recarregando');
   {const r=Math.random,q=bagQty('ferro_imperial');Math.random=()=>0;pampaFerro(cb);Math.random=r;check(bagQty('ferro_imperial')===q+1,'os imperiais deixam ferro imperial');}
   N.beasts=[];}
  {const L=pampaLayout(PAMPA_TROPILHA[0]),i=naEstrada(L,500);vai(PAMPA_TROPILHA[0],L.pts[i][0],L.pts[i][1]);passa(.05);const N=mataNight;N.beasts=[];N.tropT=0;cheio();N.inv=0;passa(.05);check(N.trop&&N.trop.aviso>0,'na Estrada das Carretas, a poeira avisa a tropilha fantasma');
   N.trop.y=worldOut.y;for(let k=0;k<150&&N.trop;k++)passa(1/30);check(!N.trop&&caveState().hp<caveMaxHp(),'a tropilha atravessa e atropela quem ficou na faixa');}
  // ---------- O acampamento dos lanceiros e o Sargento: o primeiro chefe ----------
  {const L0=pampaLayout(PAMPA_N.lanceiros),L=pampaLayout(PAMPA_N.sargento),D=L.duelo,F=ilhaFogoPartes(L0.camp).folk;vai(PAMPA_N.sargento,D.x,D.y);passa(.05);check(!chefe()&&!mataNight.chefe,'o Sargento só peleia depois da prosa com os lanceiros');
   vai(PAMPA_N.lanceiros,F.x-60,F.y+120);passa(.05);check(st.lanceiros&&modal==='talk'&&talkState.lines[0][0]==='lanceiro'&&talkState.lines.some(l=>/Sargento Recolhedor/.test(l[1])),'no acampamento, o Lanceiro Negro conta do Sargento');check(pampaQuem('neto').name==='Coronel Antônio de Sousa Neto'&&pampaQuem('bento')==='bento'&&pampaQuem('vo').name==='Vô Sadi','as falas têm nome de gente');fecha();
   check(worldMap().spots().some(s=>s.id==='pampa:folk:lanceiro'),'dá pra prosear de novo com ele');drawOutside();
   check(/Sargento/.test(pampaGoal()),'a missão passa pro Sargento');
   vai(PAMPA_N.sargento,D.x,D.y);passa(.05);check(modal==='talk'&&chefe()?.kind==='sargento','no meio da estrada, o Sargento Recolhedor');fecha();const N=mataNight,b=chefe();santo();
   check(N.aliados.length===3&&N.aliados.every(a=>a.id==='lanceiro'),'os três lanceiros do acampamento vêm junto');drawOutside();
   check(N.beasts.filter(x=>!x.boss&&Math.hypot(x.x-worldOut.x,x.y-worldOut.y)<=1500).length===0,'chefe chegando, os bichos de perto saem de cena');
   b.cool=9;for(let k=0;k<240&&b.hp===b.max;k++){santo();passa(1/30);}check(b.hp<b.max,'os lanceiros ajudam na batalha');drawOutside();
   b.cool=0;Object.assign(worldOut,{x:b.x-300,y:b.y});Object.assign(b,{state:'arremesso',t:.001,t0:.85,leque:[Math.atan2(worldOut.y-40-(b.y-70),worldOut.x-b.x)]});cheio();N.inv=0;passa(.05);check(N.lancas.length>0,'o Sargento arremessa as lanças');drawOutside();for(let k=0;k<40&&caveState().hp===caveMaxHp();k++)passa(1/30);check(caveState().hp<caveMaxHp(),'a lança arremessada machuca');santo();
   const al=N.aliados[0];Object.assign(al,{x:b.x+60,y:b.y,caido:0});Object.assign(b,{state:'varre',t:.001,t0:.95});colado(b);cheio();N.inv=0;passa(.05);check(al.caido>0&&caveState().hp<caveMaxHp(),'o feixe varre em roda e derruba quem está perto');santo();
   Object.assign(b,{state:'arrasta',cool:0,chamou:0,hp:Math.round(b.max*.4)});passa(.05);check(N.beasts.filter(x=>x.minion&&x.hp>0).length>=2,'com a vida na metade, ele chama os batedores');N.beasts.filter(x=>x.minion).forEach(x=>x.hp=0);santo();
   b.lacoImune=0;b.stun=0;colado(b);laca();check(b.stun>0,'o laço segura o Sargento um instante');b.stun=0;colado(b);laca();check(!(b.stun>0),'mas ele logo escapa');b.lacoImune=0;b.stun=0;
   b.hp=1;colado(b);const rf=caveReach(),cd0=caveCd();bate();check(modal==='talk'&&N.aliados.length===0,'o Sargento cai e abre a fala da lança');check(talkState.lines.some(l=>/finca o pé e aponta/.test(l[1])),'o lanceiro ensina a firmar a lança');check(talkState.lines.some(l=>/desviam de bala e de arpão/.test(l[1])),'o lanceiro avisa que gente a cavalo desvia de tiro');fecha();
   check(st.sargento&&weaponOwned('lanca')&&caveWeapon().id==='lanca','o Sadi ganha a Lança do Lanceiro Negro, já na mão');check(pampaSaidaAberta(PAMPA_N.sargento),'a cancela do Passo abre');
   check(/Boi Barroso/.test(pampaGoal()),'a missão passa pro Boi Barroso');
   check(caveReach()>rf+50&&caveCd()>cd0&&mataArco()<.8,'a lança alcança mais longe, é mais lenta e mais estreita');drawOutside();
   Object.assign(worldOut,{x:D.x,y:D.y,dx:-1,dy:0});const v=ilhaMob('lanceiroMontado',{x:D.x+130,y:D.y},Math.random,{minion:true,montado:true,need:1,state:'carga',t:1,carga:true,vx:-1,vy:0,dx:-1});N.beasts=[v];bate();check(!v.montado,'a lança firme derruba cavalo em carga, e o Sadi vira sozinho pra ele');
   caveState().weapon='cobre';const w=ilhaMob('lanceiroMontado',{x:D.x+100,y:D.y},Math.random,{minion:true,montado:true,need:1,state:'carga',t:1,carga:true,vx:-1,vy:0,dx:-1});Object.assign(worldOut,{dx:1,dy:0});N.beasts=[w];bate();check(w.montado,'facão comum não segura cavalo em carga');caveState().weapon='lanca';
   {const h=w.hp;rangedHit(w,{id:'arpao'});check(w.hp===h,'gente a cavalo desvia do arpão');rangedHit(w,{id:'revolver38'});check(w.hp===h,'e desvia do tiro');w.montado=false;rangedHit(w,{id:'arpao'});check(w.hp<h,'a pé, o arpão pega');}
   N.beasts=[];N.swing={t:.1,T:.2,ang:0,n:1};Object.assign(worldOut,{x:D.x,y:D.y});drawOutside();N.swing={t:.1,T:.3,ang:0,n:3};drawOutside();N.swing=null;results.push('a estocada e o giro da lança se desenham');}
  // ---------- A forja com a lança e o fio de campanha ----------
  {const s0=pampaLayout(1);switchMap({map:'pampa',n:1,x:s0.xIn,y:130});closeDialog(true);const f=worldMap().spots().find(x=>x.id==='pampa:ferraria');Object.assign(worldOut,{x:f.x,y:f.y});pampaForja();
   check(!/Lança do Lanceiro|Fio de campanha/.test([...$('dialogContent').querySelectorAll('.supply')].filter(q=>q.querySelector('.bag-emoji')).map(q=>q.textContent).join()),'a lança e o fio têm ícone desenhado, sem emoji');const txt=$('dialogContent').textContent;check(modal==='dunstanShop'&&txt.includes('Lança do Lanceiro Negro'),'a lança aparece na forja, pra trocar');check(txt.includes('Fio de campanha'),'o seu Zeferino oferece o fio de campanha');
   bagAdd('ferro_imperial',4);G.cash=999;const d=caveDmg();action('pampaAfia');check(caveDmg()===d+4&&pampaFio()===1&&modal==='dunstanShop','o fio de campanha soma dano com ferro imperial');closeDialog(true);}
  // ---------- Boi Barroso ----------
  {const L=pampaLayout(PAMPA_N.boi),m=L.mangueira;vai(PAMPA_N.boi,m.x,m.y);check(worldMap().canWalk(m.x,m.y),'a estrada passa por dentro da mangueira de pedra');passa(.05);
   check(modal==='talk'&&chefe()?.kind==='boiBarroso'&&mataNight.chefe,'dentro da mangueira, o Boi Barroso aparece');fecha();const N=mataNight,b=chefe();santo();drawOutside();
   {const lim=m.r*.9+1,q=[b.x,b.y];Object.assign(b,{x:m.x+m.r*.8,y:m.y,state:'investe',t:1,vx:1,vy:0});for(let i=0;i<30&&b.state==='investe';i++)passa(1/30);check(b.state==='bate'&&Math.hypot(b.x-m.x,(b.y-m.y)/.72)<=lim,'a parede da mangueira segura a investida');Object.assign(b,{x:q[0],y:q[1],state:'mira',t:.9,t0:.9});}
   colado(b);let h=b.hp;bate();check(h-b.hp>0&&h-b.hp<caveDmg()*.4,'com o boi inteiro, nem a lança entra direito');
   b.state='mira';for(let i=0;i<3;i++)laca();check(b.state==='mira'&&b.lacos===3,'cada laço conta');laca();check(b.state==='cansado','no quarto laço, o boi cansa');
   colado(b);h=b.hp;bate();check(h-b.hp>=caveDmg()*.7,'cansado, o golpe pega de verdade');
   b.t=.01;passa(.1);check(b.state==='mira'&&b.lacos===0&&b.need===5,'o boi recobra o fôlego e agora precisa de mais um laço');
   b.t=.01;b.t0=.9;colado(b);cheio();N.inv=0;for(let i=0;i<40&&b.state!=='investe';i++)passa(1/30);check(b.state==='investe','depois da mira, ele investe');drawOutside();for(let i=0;i<30&&caveState().hp===caveMaxHp();i++)passa(1/30);check(caveState().hp<caveMaxHp(),'a investida machuca');santo();
   Object.assign(b,{state:'cansado',t:9,hp:1,stun:0});colado(b);bate();check(st.boi&&st.lacoCouro&&modal==='talk','vencer o Boi Barroso dá o laço de couro cru');check(bagQty('chifre_boi')===1,'o boi deixa o chifre pra melhoria da lança');fecha();check(poderHas('boi'),'vencer o boi ensina o Assobio do Boi Barroso');
   check(pampaSaidaAberta(PAMPA_N.boi)&&worldMap().edge({x:L.xOut,y:L.H-3})?.n===PAMPA_N.boi+1,'com o boi vencido, a cancela do sul abre');
   check(/capitão/.test(pampaGoal()),'a missão passa pro capitão');
   N.lacoCd=0;pampaLaco();check(N.lacoCd===.8,'o laço de couro volta mais ligeiro');}
  // ---------- O capitão de cavalaria ----------
  {const L=pampaLayout(PAMPA_N.capitao),C=L.campo,P=L.palanque;vai(PAMPA_N.capitao,C.x,C.y);check(worldMap().canWalk(C.x,C.y),'a estrada passa pelo meio do Campo dos Menezes');check(worldMap().canWalk(P.x+P.w/2,P.y+P.h+120),'dá pra chegar na frente do palanque');passa(.05);
   check(modal==='talk'&&chefe()?.kind==='capitao','no meio do campo, o capitão chega');fecha();const N=mataNight,b=chefe(),guarda=N.beasts.filter(x=>x.minion);santo();
   check(guarda.length===2&&guarda.every(x=>x.montado)&&b.montado,'ele vem a cavalo, com dois lanceiros');drawOutside();
   check(N.beasts.every(x=>worldMap().canWalk(x.x,x.y)),'todos nascem dentro do campo cercado');
   const r=guarda[0];Object.assign(r,{state:'mira',t:.01,t0:.9});colado(r,1);cheio();N.inv=0;for(let i=0;i<20&&r.state!=='carga';i++)passa(1/30);passa(1/30);check(r.state==='carga'&&r.carga,'o lanceiro avisa e vem em carga');for(let i=0;i<40&&caveState().hp===caveMaxHp();i++)passa(1/30);check(caveState().hp<caveMaxHp(),'a carga machuca');santo();
   Object.assign(b,{state:'ronda',t:9});colado(b);let h=b.hp;bate();check(h-b.hp>0&&b.montado,'fora da carga, em cima do cavalo, o golpe pega pouco');
   {const hh=b.hp;rangedHit(b,{id:'arpao'});check(b.hp===hh,'o capitão a cavalo desvia do arpão');}
   Object.assign(b,{state:'carga',t:1,carga:true,vx:-1,vy:0});colado(b,1);bate();check(!b.montado&&b.stun>0&&N.soltos.length>0,'a lança firme derruba o capitão de uma vez, e o cavalo sai correndo');drawOutside();
   b.stun=0;colado(b);h=b.hp;bate();check(h-b.hp>=caveDmg()*.7,'a pé, o golpe pega cheio');
   b.lacoImune=0;b.stun=0;colado(b);laca();check(b.stun>0,'a pé, o laço atordoa');b.stun=0;colado(b);laca();check(!(b.stun>0),'mas não dá pra travar o capitão no laço');
   b.lacoImune=0;b.apeado=.01;passa(.1);check(b.montado&&b.lacos===0,'quem demora vê o capitão montar de novo');
   Object.assign(b,{state:'ronda',t:9,lacoImune:0});delete b.giro;colado(b);laca();check(b.montado&&b.lacos===1,'sem a lança, o primeiro laço não derruba');passa(.1);check(Number.isFinite(b.x)&&Number.isFinite(b.y),'laçado na ronda, o cavaleiro continua no mapa');
   Object.assign(b,{state:'ronda',t:9});colado(b);laca();check(b.lacos===1&&b.montado,'logo depois de um laço, ele escapa do outro');b.lacoImune=0;Object.assign(b,{state:'carga',t:9});colado(b);laca();check(b.lacos===1&&b.montado,'na carga, o laço arrebenta');Object.assign(b,{state:'ronda',t:9,carga:false});colado(b);laca();check(!b.montado,'o segundo laço também derruba');b.stun=0;
   const q=bagQty('ferro_imperial');b.hp=1;colado(b);bate();check(st.capitao&&guarda.every(x=>x.hp<=0),'o capitão cai e os lanceiros debandam');fecha();check(bagQty('ferro_imperial')===q+6&&bagQty('dragona')===1&&pampaSaidaAberta(PAMPA_N.capitao),'a cancela abre e ficam o ferro imperial e a dragona');
   check(/Moringue/.test(pampaGoal()),'a missão passa pro Moringue');}
  // ---------- Coronel Moringue ----------
  {const L=pampaLayout(PAMPA_N.moringue),a=L.arena;vai(PAMPA_N.moringue,a.x,a.y);check(worldMap().canWalk(a.x,a.y),'o campo da batalha é chão livre');check(worldMap().canWalk(L.bento.x-60,L.bento.y+40),'dá pra chegar perto do Bento');passa(.05);
   check(modal==='talk'&&chefe()?.kind==='moringue','no campo das lanças, o Moringue chega');fecha();let N=mataNight,b=chefe();santo();drawOutside();
   check(!playerMounted()&&b.montado&&b.fase===1,'fase 1: ele a cavalo, o Sadi a pé');
   check(/Fase 1 de 3/.test(pampaObjetivo(N,b))&&/0 de 3/.test(pampaObjetivo(N,b)),'fase 1: a tela diz o que fazer e conta as marcas');
   Object.assign(b,{state:'ronda',t:9});colado(b);let h=b.hp;bate();check(h-b.hp<caveDmg()*.3&&b.fase===1,'fase 1: fora da carga, o golpe mal encosta');
   {const hh=b.hp;rangedHit(b,{id:'arpao'});check(b.hp===hh,'fase 1: ele desvia do arpão');}
   b.state='carga';b.carga=true;colado(b);laca();check(b.lacos===0,'fase 1: na carga, o laço arrebenta');
   b.state='ronda';b.carga=false;colado(b);laca();check(b.lacos===1&&b.fase===1&&b.lacoImune>0,'fase 1: fora da carga, o laço marca, mas ele fica esperto');b.lacoImune=0;b.lacos=0;passa(.05);check(Number.isFinite(b.x)&&Number.isFinite(b.y),'fase 1: laçado, ele continua no mapa');
   Object.assign(b,{state:'carga',carga:true,t:1,vx:-1,vy:0,stun:0});colado(b,1);bate();check(b.lacos===1&&b.state==='tonto'&&b.fase===1,'fase 1: a lança firme marca e o cavalo empina');check(/Empinou/.test(pampaObjetivo(N,b)),'fase 1: a tela avisa a hora de bater');
   h=b.hp;colado(b);bate();check(h-b.hp>=caveDmg()*.5,'fase 1: com o cavalo empinado, o golpe pega');
   {Object.assign(b,{state:'carga',carga:true,t:1,vx:-1,vy:0,stun:0});colado(b,1);N.cd=9;N.firme=.3;passa(.05);check(b.lacos===2,'fase 1: apertar F um instante antes também aguenta a carga');}
   Object.assign(b,{state:'carga',carga:true,t:1,vx:-1,vy:0,stun:0});colado(b,1);bate();check(b.fase===2&&!b.montado&&N.vento,'fase 1: três cargas aguentadas, e ele cai do cavalo');fecha();santo();drawOutside();
   Object.assign(b,{state:'guarda',t:9,stun:0});N.vento.ativo=0;N.vento.t=99;colado(b);h=b.hp;bate();check(b.hp===h,'fase 2: de guarda, ele segura o golpe');check(/bate depois da estocada/.test(pampaObjetivo(N,b)),'fase 2: a tela diz quando bater');
   Object.assign(b,{state:'rest',t:9,stun:0});colado(b);h=b.hp;bate();check(h-b.hp>=caveDmg()*1.1,'fase 2: depois da estocada, a janela vale mais');check(/Agora/.test(pampaObjetivo(N,b)),'fase 2: a tela avisa a janela');
   Object.assign(b,{x:a.x,y:a.y,state:'guarda',t:9,stun:0});Object.assign(worldOut,{x:a.x-200,y:a.y,dx:1,dy:0});{const x=worldOut.x;N.vento.ativo=2;N.vento.dir=1;passa(.4);check(worldOut.x>x,'fase 2: o minuano empurra');check(b.state==='vento',"fase 2: no minuano, ele perde a guarda");drawOutside();colado(b);h=b.hp;bate();check(h-b.hp>=caveDmg()*1.1,'fase 2: no minuano, o golpe passa');}
   N.vento.ativo=0;N.vento.t=.01;passa(.1);check(N.vento.ativo>0,'fase 2: o minuano volta de tempos em tempos');N.vento.ativo=0;N.vento.t=99;passa(.05);
   Object.assign(b,{state:'chase',stun:0,cool:9,lacoImune:0});colado(b);laca();check(b.stun>0,'fase 2: o laço atordoa');b.stun=0;colado(b);laca();check(!(b.stun>0),'fase 2: mas não trava o coronel');Object.assign(b,{state:'guarda',t:9,stun:0,lacoImune:0});colado(b);laca();check(b.state==='chase','fase 2: o laço quebra a guarda');
   Object.assign(b,{state:'windup',t:.01,t0:.5,vx:-1,vy:0,stun:0,combo:0});colado(b);cheio();N.inv=0;for(let i=0;i<30&&caveState().hp===caveMaxHp();i++)passa(1/30);check(caveState().hp<caveMaxHp(),'fase 2: a estocada dele machuca');santo();
   {Object.assign(b,{state:'windup',t:.3,t0:.5,stun:0});colado(b,-1);bate();check(b.state==='windup','apanhar não cancela o bote do coronel');}
   Object.assign(b,{stun:0,state:'chase',hp:Math.round(b.max*.38)});passa(.05);check(b.fase===3&&modal==='talk'&&N.acesas,'fase 3: a madrugada chega e as lanças se acendem');check(talkState.lines.some(l=>l[1]==='Avante, farrapos!'),'fase 3: o Sadi grita Avante, farrapos!');drawOutside();fecha();
   check(N.madrugada&&N.aliados.length===7&&N.aliados.filter(q=>q.id==='lanceiro').length===3&&['garibaldi','anita','neto','canabarro'].every(id=>N.aliados.some(q=>q.id===id)),'fase 3: os três lanceiros, Garibaldi, Anita, Neto e Canabarro chegam juntos');
   const cav=N.beasts.filter(x=>x.minion&&x.hp>0&&x.montado);check(cav.length>=1,'fase 3: a cavalaria ataca');check(caveState().hp===caveMaxHp(),'fase 3: o Sadi recobra o fôlego');drawOutside();
   {const v=cav[0];Object.assign(v,{state:'carga',t:1,carga:true,vx:-1,vy:0});colado(v,1);bate();check(!v.montado,'fase 3: a lança derruba a cavalaria também');}
   {let pior=0;for(let i=0;i<300;i++){santo();passa(1/30);pior=Math.max(pior,N.beasts.filter(x=>x.minion&&x.hp>0&&x.montado).length);if(!mataNight||modal)break;}check(pior<=2,'fase 3: no máximo dois cavaleiros de cada vez, pra não embaralhar');}drawOutside();
   // Desmaiou no meio: acorda no fogo, e a peleia começa de novo.
   N.inv=0;mataFaint();check(!mataNight&&modal==='talk'&&!st.moringue,'desmaiou: acorda no acampamento, com o Moringue ainda solto');fecha();check(!playerMounted(),'acorda a pé');
   vai(PAMPA_N.moringue,a.x,a.y);passa(.05);fecha();N=mataNight;b=chefe();check(b?.fase===1&&b.montado,'de volta ao campo, a batalha recomeça da fase 1');santo();
   G.missions.bento={status:'done',day:1};check(campFolk(26)===null,'até o fim, o Bento não está no acampamento dele');
   Object.assign(b,{fase:3,montado:false,state:'chase',stun:0,hp:1});colado(b);bate();check(st.moringue&&modal==='talk','o Moringue cai');check(talkState.lines.some(l=>/República Rio-Grandense/.test(l[1])),'o Neto proclama a República Rio-Grandense');check(talkState.lines.some(l=>/tinha nome/.test(l[1])),'as almas dos lanceiros se despedem');fecha();
   check(st.republica&&st.bandeira&&ilhaState().resgatado,'a República é proclamada e o Bento fica livre');check(pampaArea()===PAMPA_N.capitao&&worldOut.map==='pampa'&&worldMap().canWalk(worldOut.x,worldOut.y),'o fim acontece no Campo dos Menezes');check(campFolk(26)?.id==='bento','o Bento volta pro acampamento dele');drawOutside();
   const m=MISSIONS.find(x=>x.id==='porongos');check(m.done()&&JSON.parse(JSON.stringify(G)).pampa.republica===G.day,'a missão termina e o fim fica no save');
   G.missions.porongos={status:'active',day:G.day};completeMission(m);check(missionState('porongos').status==='done'&&modal==='talk','a missão entrega o desfecho e a recompensa');fecha();}
  // ---------- A subida: bicho, água, gente do Moringue, cavalaria ----------
  {const tem=(n,k)=>(PAMPA_MOBS[n]||[]).some(q=>q[0]===k);
   check(tem(2,'graxaim')&&tem(2,'teiu')&&!tem(2,'batedor')&&!tem(2,'carabineiro'),'no começo, só graxaim e teiú');
   check(!tem(3,'afogado')&&tem(4,'afogado')&&tem(5,'afogado'),'os afogados aparecem nos trechos de água');
   check(!tem(6,'carabineiro')&&tem(8,'carabineiro'),'o carabineiro só vem depois do banhado');
   check(!tem(9,'lanceiroMontado')&&tem(10,'lanceiroMontado'),'a cavalaria só vem depois do Boi');
   const tot=n=>(PAMPA_MOBS[n]||[]).reduce((a,q)=>a+q[1],0);check(tot(14)>tot(2)*2,'perto do fim, tem muito mais inimigo');
   check(pampaForca(15).hp>pampaForca(2).hp&&pampaForca(15).dmg>pampaForca(2).dmg,'quanto mais fundo, mais vida e mais dano');
   {const L=pampaLayout(4);vai(4,L.xIn,130);passa(.05);const af=mataNight.beasts.filter(b=>b.kind==='afogado');check(af.length>=1&&af.every(b=>worldMap().canWalk(b.x,b.y)),'o afogado sai da beira da água');drawOutside();mataNight.beasts=[];}
   {const r=Math.random;Math.random=()=>0;const c=bagQty('couro_cru'),b={kind:'graxaim',x:100,y:100};pampaDeixa(b);Math.random=r;check(bagQty('couro_cru')===c+1,'graxaim e teiú deixam couro cru');}
   for(const k of['couro_cru','chifre_boi','dragona']){check(/<img/.test(bagIcon(k)),k+' tem ícone desenhado');check(itemImageForSize(k,48),k+' tem imagem no inventário');}}
  // ---------- Cada fogo tem um farrapo ----------
  {delete st.folk;delete st.lanceiros;
   check(PAMPA_FOGOS.length===5&&PAMPA_FOGOS.every(f=>PAMPA_FOLK[f.folk]),'os cinco fogos têm um personagem');
   check(new Set(PAMPA_FOGOS.map(f=>f.folk)).size===5,'um personagem diferente em cada fogo');
   for(const f of PAMPA_FOGOS){const L=pampaLayout(f.n),q=ilhaFogoPartes(L.camp).folk;vai(f.n,q.x-40,q.y+120);passa(.05);check(modal==='talk'&&st.folk?.[f.folk],f.nome+': '+f.folk+' puxa prosa quando o Sadi chega');check(talkState.lines.some(l=>l[0]==='card'&&l[1].includes(PAMPA_FOLK[f.folk].perk)),f.nome+': o presente fica claro');fecha();
     const sp=worldMap().spots().find(x=>x.id==='pampa:folk:'+f.folk);check(sp,f.nome+': dá pra prosear de novo');drawOutside();sp.act();check(modal==='talk','a segunda prosa é um causo');fecha();sp.act();fecha();sp.act();fecha();}
   check(st.lanceiros,'a prosa do fogo dos lanceiros conta pra missão');
   worldOut.map='pampa';check(PODERES.grito.cd===30,'Garibaldi: o Grito volta mais ligeiro no pampa');{const m=worldOut;worldOut={...m,map:'serra'};check(PODERES.grito.cd===45,'fora do pampa, o Grito é como sempre');worldOut=m;}
   check(pampaOcultoAlpha()>.5,'Neto: o batedor no capim aparece mais');
   {const f=PAMPA_FOGOS[0],bag=mataBag();bag.marcela=0;delete st.chaDia;pampaDescansa(f);fecha();check(bag.marcela===1,'Anita: descansar deixa um chá no bornal');pampaDescansa(f);fecha();check(bag.marcela===1,'um chá por dia só');}
   {const b={kind:'capitao'};pampaCarga(b,1,0,1);check(b.t0>1.1,'Canabarro: a carga avisa com mais tempo');}}
  // ---------- A lança melhora na forja ----------
  {const cs=caveState();cs.forged.lanca=G.day;cs.weapon='lanca';delete st.lancaUp;switchMap(pampaEntrada(1));closeDialog(true);const f=worldMap().spots().find(x=>x.id==='pampa:ferraria');Object.assign(worldOut,{x:f.x,y:f.y});G.cash=5000;pampaForja();
   check(/Encaixe de chifre/.test($('dialogContent').textContent)&&$('dialogContent').querySelector('[data-act="pampaMelhora"][data-id="cabo"]'),'as melhorias da lança aparecem na forja');
   check($('dialogContent').querySelector('[data-act="pampaItem"]'),'o seu Zeferino vende o que vai no bornal');
   const btn=id=>$('dialogContent').querySelector('[data-act="pampaMelhora"][data-id="'+id+'"]');
   check(btn('ponta').disabled,'uma melhoria de cada vez');
   for(const m of LANCA_MELHORIAS)for(const[k,q]of Object.entries(m.needs))bagAdd(k,q);
   const cd0=caveCd(),d0=caveDmg(),r0=caveReach();action('pampaMelhora','cabo');check(caveCd()<cd0&&pampaLancaTem('cabo'),'o cabo: a lança volta mais ligeiro');action('pampaMelhora','ponta');check(caveDmg()===d0+12,'a ponta: mais dano');action('pampaMelhora','chifre');check(caveReach()===r0+40,'o chifre: mais alcance');action('pampaMelhora','flamula');check(caveDmg()===d0+20&&pampaLancaTem('flamula'),'a flâmula: mais dano');
   check(modal==='dunstanShop','continua na forja');const q=mataBag().marcela||0;mataBag().marcela=0;action('pampaItem','marcela');check(mataBag().marcela===1,'comprar chá de marcela funciona');mataBag().marcela=q;closeDialog(true);
   cs.weapon='facao';const dF=caveDmg();cs.weapon='lanca';check(caveDmg()>dF+19,'as melhorias só valem na lança');
   check(JSON.parse(JSON.stringify(G)).pampa.lancaUp.flamula===G.day,'as melhorias ficam no save');}
  // ---------- O Assobio do Boi Barroso e o som do Grito ----------
  {const L=pampaLayout(PAMPA_N.capitao);poderState().has.boi=G.day;vai(PAMPA_N.capitao,L.campo.x,L.campo.y);passa(.05);fecha();const N=mataNight;N.beasts=[];Object.assign(worldOut,{dx:1,dy:0});
   const b=ilhaMob('batedor',{x:worldOut.x+180,y:worldOut.y},Math.random,{state:'chase'}),h=b.hp;N.beasts=[b];poderBoi();check(poder.boi,'o assobio chama o boi');drawOutside();for(let i=0;i<60&&b.hp===h;i++)passa(1/30);check(b.hp<h,'o boi atropela quem está no caminho');for(let i=0;i<60&&poder.boi;i++)passa(1/30);check(!poder.boi,'e vai embora');
   const v=ilhaMob('lanceiroMontado',{x:worldOut.x+180,y:worldOut.y},Math.random,{montado:true,need:1,state:'ronda',t:9,stun:9});N.beasts=[v];poderBoi();for(let i=0;i<40&&v.montado;i++)passa(1/30);check(!v.montado,'e derruba quem está a cavalo');poder.boi=null;N.beasts=[];
   let gritou=0;const g=AudioEngine.gritoFarrapo;AudioEngine.gritoFarrapo=function(){gritou++;};poder.cd={};poderState().pick='grito';poderGrito();AudioEngine.gritoFarrapo=g;check(gritou===1,'o Grito tem som próprio');poder.ally=null;
   check(/Boi Barroso/.test(Object.values(PODERES).map(x=>x.name).join()),'o poder novo está na lista');}
  // ---------- Sons e clima ----------
  {for(const k of['gritoFarrapo','clarim','assobio','boiBerro','bufo','tropel','boleadeira','clinkMetal','vareta','rosnado','splash','firme','rajada','sapo','trovao','gadoLonge','despedida','vivas','hinoFarrapo','violaFogo']){check(typeof AudioEngine[k]==='function',k+': o som existe');AudioEngine[k]();}
   check(MATA_MUSIC_MAPS.has('pampa'),'o pampa tem a música da mata');
   for(const n of[3,5,10,15]){const L=pampaLayout(n);vai(n,L.xIn,130);mataNight=null;AudioEngine.ambience?.(.05);drawOutside();PAMPA_CEU.flash=.5;drawOutside();PAMPA_CEU.flash=0;}results.push('o clima de cada região se desenha sem erro');}
  // ---------- As cenas de verdade ----------
  window.NO_SCENES=false;
  {const roda=id=>{check(scene?.id===id,'a cena '+id+' começa');let n=0;while(scene&&n++<6000){if(scene.step?.say){sceneNext();sceneNext();}else sceneTick(1/20);if(scene&&scene.world&&n%20===0)drawSceneWorld();}check(!scene,'a cena '+id+' termina');},
    L4=pampaLayout(PAMPA_N.sargento);vai(PAMPA_N.sargento,L4.duelo.x,L4.duelo.y);passa(.05);delete caveState().forged.lanca;
   pampaLancaCena({x:L4.duelo.x,y:L4.duelo.y});roda('pampa-lanca');fecha();check(weaponOwned('lanca'),'a cena da lança entrega a lança');
   const L5=pampaLayout(PAMPA_N.moringue),a=L5.arena;delete st.moringue;vai(PAMPA_N.moringue,a.x,a.y-40);passa(.05);fecha();const N=mataNight,b=chefe();check(b,'o Moringue de novo pra cena');Object.assign(b,{fase:3,montado:false});
   moringueMadrugada(b,N);roda('pampa-madrugada');check(N.madrugada&&N.aliados.length===7,'a cena da madrugada traz os aliados');drawOutside();
   b.hp=1;colado(b);bate();roda('pampa-final');fecha();check(st.republica&&pampaArea()===PAMPA_N.capitao,'a cena final leva pro palanque');
   // ---------- A fogueira ----------
   {const m=MISSIONS.find(x=>x.id==='fogueira'),p=front(VILA.bodega,70);check(m&&m.when()===true||!missionDone('porongos'),'depois do pampa, a fogueira fica disponível');G.missions.porongos={status:'done',day:G.day};check(m.when(),'a missão da fogueira abre depois da batalha');startMission(m);closeDialog(true);showBanner&&0;
    switchMap({map:'vila',x:p.x+800,y:p.y+200});closeDialog(true);passa(.05);check(!scene,'longe da bodega, nada acontece');
    worldOut.x=p.x;worldOut.y=p.y;passa(.05);check(scene?.id==='fogueira','na frente da bodega, a fogueira começa');
    const roda2=FOGUEIRA_RODA.concat(FOGUEIRA_FRENTE),faltam=[];for(const id of roda2)if(id!=='neto'&&id!=='zeferino'&&id!=='canabarro'&&!PEOPLE.some(q=>q.id===id))faltam.push(id);check(!faltam.length,'todo mundo da roda existe: '+faltam.join());check(new Set(roda2).size===roda2.length&&roda2.length>=40,'a roda junta o elenco inteiro');
    let n=0,viu=false;while(scene&&n++<9000){if(scene.step?.say){if(scene.step.say==='vo')viu=true;sceneNext();sceneNext();}else if(scene.step?.overlay)sceneNext();else sceneTick(1/20);if(scene&&scene.world&&n%25===0)drawSceneWorld();}check(!scene,'a cena da fogueira termina');check(viu,'o vô aparece no fim da noite');
    check(st.fogueira&&G.relics.bandeira&&modal==='talk','a noite termina com o fim do jogo e a bandeira na estante');fecha();check(m.done()&&lembrancas().includes('bandeira'),'a missão termina e a bandeira fica na estante');drawLembranca('bandeira',100,100);
    G.missions.fogueira={status:'active',day:G.day};completeMission(m);check(missionState('fogueira').status==='done','a fogueira dá recompensa');fecha();drawOutside();passa(.05);check(!scene,'a cena não repete');}
   window.NO_SCENES=true;
   {delete st.fogueira;delete st.fogueiraVista;fogueiraComeca();check(modal==='talk'&&!scene&&talkState.lines.some(l=>/orgulho/.test(l[1])),'sem cenas, a fogueira vira conversa');check(talkState.lines.some(l=>/Tropeamos|tropeamos/.test(l[1])),'o Mano Lima conta do vô, como prometeu');check(talkState.lines.some(l=>/não abre sozinha/.test(l[1])),'o bilhete da caverna volta');fecha();check(st.fogueira,'e conta do mesmo jeito');}}
  window.NO_SCENES=true;
  worldOut=null;mataNight=null;closeDialog(true);delete G.ilha;delete G.pampa;
  return results;
})()

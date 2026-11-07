// O painel do modo de testes: cada chefe e cada área respondem de verdade, partindo de um jogo novo, sem história nenhuma.
(() => {
  const results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
  const novo=(modo=true)=>{G=fresh();G.prologue={done:true};G.tutorial.complete=true;G.tutorial.guided=false;G.day=40;G.phase='prep';G.missions={};G.regions={serra:false,sc:false};G.testMode=modo;G.eventMode=false;G.cash=0;started=true;paused=false;scene=null;phoneOpen=false;closeDialog(true);skipWorldTalk();keys.clear();worldDash=null;mataNight=null;lendaFight=null;worldOut=null;};
  const botao=(a,id)=>$('dialogContent').querySelector('[data-act="'+a+'"]'+(id?'[data-id="'+id+'"]':''));
  const abre=(aba)=>{pauseGame();botao('testChefes').click();if(aba)botao('testChefes',aba).click();};
  const fecha=()=>{let k=0;while(modal==='talk'&&k++<80)talkNext();if(modal)closeDialog(true);paused=false;};
  const passa=(seg,dt=1/30)=>{for(let i=0;i<seg/dt;i++)outsideTick(dt);};
  const vivo=kind=>mataNight?.beasts?.some(b=>b.kind===kind&&b.hp>0);
  const sem=()=>{while(scene)sceneSkip();};
  // ---------- Só no modo de teste ----------
  novo(false);pauseGame();check(modal==='pause'&&!botao('testChefes'),'fora do modo de teste, o Esc não tem o painel');closeDialog(true);paused=false;
  action('testVai','serra');action('testLuta','boi');check(!worldOut||worldOut.map==='vila','fora do modo de teste, os atalhos não levam a lugar nenhum');
  check(!pampaAberto(),'fora do modo de teste, a porteira do pampa continua trancada');
  novo();pauseGame();check(botao('testChefes'),'no modo de teste, o Esc tem o painel');botao('testChefes').click();
  check(modal==='pause'&&$('dialogTitle').textContent==='Testar áreas e chefes','o painel abre');check(TESTE_CHEFES.every(c=>botao('testLuta',c.id))&&Object.keys(LENDA_BOSS).every(id=>botao('testLenda',id)),'a aba Chefes tem um botão pra cada chefe e cada lenda');
  botao('testChefes','areas').click();check(TESTE_LUGARES.every(q=>botao('testVai',q.id))&&Object.keys(TESTE_FAIXAS).every(id=>botao('testFaixa',id)&&$('testeN-'+id)),'a aba Áreas tem cada mapa e cada seletor');check(botao('testCena','final')&&botao('testCena','fogueira'),'a aba Áreas tem as duas cenas do fim');
  botao('testChefes','resetar').click();check(TESTE_AREAS.every(a=>botao('testReset',a.id)),'a aba Resetar tem cada área');
  botao('testChefes','armas').click();check(botao('testArmas')&&$('testeArma'),'a aba Armas tem o liberar e a arma na mão');
  botao('testChefesVolta').click();check($('dialogTitle').textContent==='Menu do jogo','o Voltar leva pro menu do Esc');closeDialog(true);paused=false;
  check(pampaAberto()&&WORLD_MAPS.pampa,'no modo de teste, a porteira do pampa está sempre aberta');
  G.mata={faintDay:G.day};check(!mataLockedToday(),'no modo de teste, a mata não trava por causa de um desmaio');delete G.mata;
  // ---------- Cada chefe, de um jogo novo, saindo de dentro da bodega ----------
  const confere={
    cachaco:()=>worldOut.map==='trecho'&&vivo('cachaco'),papo:()=>worldOut.map==='trecho'&&vivo('papo'),mariath:()=>inNavio()&&!!navioBoss(),
    bruxaMor:()=>worldOut.map==='ilhamato'&&vivo('bruxaMor'),bernunciaMae:()=>worldOut.map==='ilhamato'&&vivo('bernunciaMae'),grenfell:()=>worldOut.map==='ilha'&&!!grenfellVivo(),
    diabo:()=>inCave()&&caveState().floor===SALAMANCA_FLOOR&&!!salamancaBoss(caveFloorRun())&&!caveFloorRun().sleeping,
    sargento:()=>pampaArea()===PAMPA_N.sargento&&vivo('sargento')&&mataNight.aliados.length===3,boi:()=>pampaArea()===PAMPA_N.boi&&vivo('boiBarroso'),capitao:()=>pampaArea()===PAMPA_N.capitao&&vivo('capitao'),moringue:()=>pampaArea()===PAMPA_N.moringue&&vivo('moringue')
  };
  check(TESTE_CHEFES.every(c=>confere[c.id]),'todo chefe da lista está conferido neste teste');
  for(const c of TESTE_CHEFES){
    novo();abre();check(worldOut===null,'começa dentro da bodega');botao('testLuta',c.id).click();check(modal!=='pause'&&!paused,c.nome+': o painel fecha');
    check(worldMap().canWalk(worldOut.x,worldOut.y)||inCave(),c.nome+': chega em chão livre');check(caveState().hp===caveMaxHp()&&caveState().facao,c.nome+': chega de vida cheia e facão na mão');
    passa(.05);fecha();sem();if(!inCave()){passa(.1);fecha();}
    check(confere[c.id](),c.nome+': a luta começa de um jogo novo');drawOutside();
  }
  // Direto de uma luta pra outra, e de um chefe já vencido.
  novo();abre();botao('testLuta','boi').click();passa(.05);fecha();check(vivo('boiBarroso'),'com o Boi na frente');check(weaponOwned('lanca')&&caveWeapon().id==='lanca'&&pampaState().sargento,'quem vai pro Boi já passou pelo Sargento e tem a lança');
  G.pampa.boi=G.day;abre();check(/✔ Boi Barroso/.test($('dialogContent').textContent),'o painel marca quem já foi vencido');botao('testLuta','boi').click();passa(.05);fecha();check(vivo('boiBarroso')&&!G.pampa.boi,'dá pra lutar de novo com quem já foi vencido');
  abre();botao('testLuta','grenfell').click();passa(.05);fecha();check(!!grenfellVivo(),'de uma luta direto pra outra');
  abre();botao('testLuta','diabo').click();fecha();sem();check(inCave(),'da ilha direto pra caverna');abre();botao('testLuta','moringue').click();passa(.05);fecha();check(!inCave()&&vivo('moringue'),'da caverna direto pro pampa');
  // ---------- As lendas ----------
  for(const id of Object.keys(LENDA_BOSS)){novo();abre();botao('testLenda',id).click();check(lendaFight?.id===id&&worldOut.map==='arena'&&!paused,'lenda '+FOLK[id].name+': vai direto pra luta');passa(.05);drawOutside();lendaLeave(false);fecha();check(!lendaFight&&worldOut.map!=='arena'&&!worldMap().indoor,'lenda '+FOLK[id].name+': depois volta pro mapa');}
  // ---------- Cada área ----------
  for(const q of TESTE_LUGARES){novo();abre('areas');botao('testVai',q.id).click();fecha();sem();check(worldOut&&(worldMap().indoor||worldMap().canWalk(worldOut.x,worldOut.y)),q.nome+': chega em chão livre');passa(.05);fecha();drawOutside();results.push(q.nome+': funciona');}
  for(const[id,f]of Object.entries(TESTE_FAIXAS))for(let n=f.de;n<=f.ate();n++){
    novo();abre('areas');const s=$('testeN-'+id);s.value=String(n);botao('testFaixa',id).click();fecha();sem();
    if(id==='caverna')check(inCave()&&caveState().floor===n,f.nome+' '+n+': chega no andar');else{check(worldOut&&worldMap().canWalk(worldOut.x,worldOut.y),f.nome+' '+n+': chega em chão livre');if(id==='pampa')check(pampaArea()===n,f.nome+' '+n+': é o trecho certo');if(id==='trecho')check(trechoN()===n,f.nome+' '+n+': é o trecho certo');if(id==='ilhamato')check(ilhaState().trecho===n,f.nome+' '+n+': é o trecho certo');passa(.03);fecha();}
    if(n===f.de||n===f.ate())drawOutside();
  }
  results.push('todos os trechos e andares levam pro lugar certo');
  // De qualquer situação: com a bodega aberta, dentro da caverna e de volta pra bodega.
  novo();G.phase='open';abre('areas');botao('testVai','serra').click();check(worldOut.map==='serra'&&G.phase!=='open','com a bodega aberta também dá pra ir');
  abre('areas');botao('testBodega').click();check(worldOut===null&&!paused,'o painel volta pra dentro da bodega');
  // ---------- As cenas do fim, a qualquer hora ----------
  novo();abre('areas');botao('testCena','final').click();fecha();sem();fecha();check(pampaState().republica&&worldOut.map==='pampa','o final do pampa roda de um jogo novo');
  novo();abre('areas');botao('testCena','fogueira').click();fecha();sem();fecha();check(pampaState().fogueira&&worldOut.map==='vila','a fogueira roda de um jogo novo');
  abre('areas');botao('testCena','fogueira').click();fecha();sem();fecha();check(pampaState().fogueira,'e dá pra ver de novo');
  // ---------- Armas ----------
  novo();abre('armas');check($('testeArma').options.length===1,'no começo, só o facão');botao('testArmas').click();check(CAVE_WEAPONS.every(w=>weaponOwned(w.id))&&G.up.arpao&&G.up.revolver38&&caveUp('dash'),'o botão libera todas as armas e melhorias');check(LANCA_MELHORIAS.every(m=>pampaLancaTem(m.id))&&poderHas('boi')&&poderHas('grito'),'e também as melhorias da lança e os poderes');check($('testeArma').options.length===CAVE_WEAPONS.length,'a lista mostra todas as armas');
  $('testeArma').value='lanca';botao('testArma').click();check(caveWeapon().id==='lanca'&&$('testeArma').value==='lanca','dá pra trocar a arma na mão pelo painel');closeDialog(true);paused=false;
  // ---------- Resetar ----------
  novo();const ms=mataState(),lg=lagunaState();ms.cachaco=G.day;ms.papo=G.day;ms.camps[11]=true;lg.won=G.day;lg.carregado=G.day;G.ilha={bruxaMor:1,bernunciaMae:1,grenfell:1,chave:1,contou:1,mortos:{day:G.day}};caveState().salamanca=1;caveState().salamancaFled=1;G.missions.jarau={status:'done',day:1};Object.assign(pampaState(),{lanceiros:1,sargento:1,boi:1,capitao:1,moringue:1,republica:1,bandeira:1,fogueira:1,fogueiraVista:1,folk:{garibaldi:1},fogos:{porteira:1,porongos:1},lacoCouro:1,hoje:{day:G.day,got:{2:['bau0']}}});G.ilha.resgatado=1;G.missions.porongos={status:'done',day:1};(caveState().forged??={}).lanca=G.day;
  abre('resetar');check(/✔ Javali Cachaço/.test($('dialogContent').textContent),'a aba Resetar mostra quem já foi vencido');botao('testReset','mata').click();check(!ms.cachaco&&!ms.papo&&ms.camps[11]&&modal==='pause'&&/Mata de Araucárias resetado/.test($('dialogContent').textContent),'resetar a mata zera os chefes e mantém os fogos');
  botao('testReset','laguna').click();check(!lg.won&&lg.carregado,'resetar Laguna traz o navio de volta');
  botao('testReset','ilha').click();check(!G.ilha.bruxaMor&&!G.ilha.bernunciaMae&&!G.ilha.grenfell&&G.ilha.contou&&G.ilha.chave,'resetar a ilha zera os chefes e mantém a história');
  botao('testReset','caverna').click();check(!salamancaDone()&&jarauActive(),'resetar a caverna traz o Diabo Vermelho de volta');
  botao('testReset','pampa').click();{const st=pampaState();check(!st.sargento&&!st.boi&&!st.capitao&&!st.moringue&&!st.republica&&!st.bandeira&&!st.fogueira&&!st.fogueiraVista&&!st.folk&&!st.lanceiros&&!st.hoje&&!G.ilha.resgatado&&!missionState('porongos'),'resetar o pampa zera os chefes, os baús do dia, os farrapos dos fogos e o final');check(st.fogos.porongos&&weaponOwned('lanca')&&st.lacoCouro,'os fogos acesos, a lança e o laço ficam');}
  closeDialog(true);paused=false;
  // Quem está depois de uma cancela que volta a fechar não fica preso.
  novo();pampaState().sargento=G.day;{const L=pampaLayout(PAMPA_N.sargento);goOutside();closeDialog(true);switchMap({map:'pampa',n:PAMPA_N.sargento,x:L.xOut,y:L.H-100});closeDialog(true);check(worldMap().canWalk(worldOut.x,worldOut.y),'de cancela aberta, dá pra estar depois dela');abre('resetar');botao('testReset','pampa').click();check(worldMap().canWalk(worldOut.x,worldOut.y),'quem estava depois da cancela não fica preso');closeDialog(true);paused=false;}
  novo();Object.assign(mataState(),{cachaco:1});G.ilha={grenfell:1};Object.assign(pampaState(),{boi:1});caveState().salamanca=1;lagunaState().won=1;abre('resetar');botao('testReset','tudo').click();check(!G.mata.cachaco&&!G.mata.laguna.won&&!G.ilha.grenfell&&!G.pampa.boi&&!salamancaDone(),'o Resetar todas zera todas as áreas');closeDialog(true);paused=false;
  worldOut=null;mataNight=null;lendaFight=null;closeDialog(true);G.testMode=false;
  return results;
})()

'use strict';
const HOME_KEEPSAKE_NAMES={rodeio:'Troféu do rodeio',penalti:'Troféu de pênaltis',uva:'Troféu da uva',cuia:'Cuia do vô',foto1968:'Fotografia de 1968',retrato:'Retrato de casamento',ticao:'Tição do Lobisomem',fita:'Fita do Sanguanel',escama:'Escama do Boitatá',freio:'Freio da Mula sem Cabeça',carbunculo:'Carbúnculo da Teiniaguá',galhada:'Galhada do Anhangá',pesca:'Troféu de pesca'};
function homeKeepsakePositions(){return lembrancas().map((id,k)=>({id,...homePoint(820+k%5*61,[245,287,328][Math.floor(k/5)]),scale:HOME_SCENE.scale*.72}));}
function drawHomeCollections(){
  if(worldOut?.map!=='casa:sadi')return;
  for(const p of homeKeepsakePositions()){
    ctx.save();ctx.translate(p.x,p.y);ctx.scale(p.scale,p.scale);drawLembranca(p.id,0,0);ctx.restore();
  }
  homePortraits().forEach((id,k)=>drawFriendPortrait(id,{...homePoint(806+k*78,92),w:52*HOME_SCENE.scale,h:66*HOME_SCENE.scale}));
}
function homeCollectionsMenu(){
  const keep=modal==='homeCollections'?$('dialogContent').closest('.dialog').scrollTop:0,items=lembrancas();
  openDialog('Coleções da sua casa',`<p>Troféus e lembranças das suas aventuras ficam guardados aqui. Os espaços vazios esperam as próximas conquistas.</p><h3>Prateleira · ${items.length} lembranças</h3>${items.length?'<ul>'+items.map(id=>'<li>'+(HOME_KEEPSAKE_NAMES[id]||'Lembrança')+'</li>').join('')+'</ul>':'<p class="small-note">Ganhe campeonatos e descubra histórias para preencher sua prateleira.</p>'}${quadroPanel()}<div class="actions"><button data-act="close">Voltar para casa</button></div>`,'homeCollections');
  $('dialogContent').closest('.dialog').scrollTop=keep;
}

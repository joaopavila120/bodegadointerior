// Catálogo de itens, receitas, equipamentos, melhorias e eventos
'use strict';

const GOODS={
 pao_xis:{name:'Pão de xis',cost:1.5,initial:12,cat:'Cozinha'},burger:{name:'Hambúrguer',cost:3,initial:12,cat:'Cozinha'},ovo:{name:'Ovo',cost:1,initial:12,cat:'Cozinha'},queijo:{name:'Queijo',cost:1.5,initial:12,cat:'Cozinha'},salada:{name:'Salada completa',cost:1.5,initial:12,cat:'Cozinha'},bacon:{name:'Bacon',cost:2.5,initial:0,cat:'Cozinha',unlock:'bacon'},coracao:{name:'Coração',cost:3,initial:0,cat:'Cozinha',unlock:'coracao'},refri:{name:'Refrigerante',cost:2.5,price:6,initial:10,cat:'Bebidas',sealed:true},cerveja:{name:'Cerveja na caneca',cost:3.5,price:8,initial:6,cat:'Bebidas',sealed:false},cachaca:{name:'Dose de cachaça',cost:1.5,price:5,initial:0,starter:10,cat:'Bebidas',unlock:'trago'},cigarro:{name:'Maço de cigarros',cost:6,price:12,initial:6,cat:'Balcão',sealed:true},codorna:{name:'Ovos de codorna em conserva',cost:3,price:12,initial:6,cat:'Balcão',sealed:true},pepino:{name:'Pepino em conserva',cost:2.5,price:10,initial:0,cat:'Balcão',sealed:true,unlock:'pepino'},erva:{name:'Erva-mate a granel',cost:.006,price:7,initial:6000,cat:'Balcão',sealed:true,pack:2000},salame:{name:'Salame de colônia',cost:4,price:10,initial:0,cat:'Balcão',unlock:'salame'},amendoim:{name:'Amendoim torrado',cost:2,price:7,initial:0,cat:'Balcão',unlock:'amendoim',sealed:true},queijo_colonial:{name:'Queijo colonial',cost:2,price:16,initial:0,cat:'Balcão',unlock:'queijo_colonial',sealed:true,farm:true,noSupplier:true,removed:true},pinhao:{name:'Pinhão a granel',cost:.006,price:12,initial:0,cat:'Balcão',unlock:'pinhao',pack:4000,starter:6000},bergamota:{name:'Bergamota',cost:.0025,price:6.5,initial:0,cat:'Balcão',unlock:'bergamota',pack:6000,starter:12000},cafe:{name:'Café passado',cost:1,price:4,initial:0,cat:'Bebidas',unlock:'coffee',starter:12},bitter:{name:'Dose de bitter',cost:3,price:9,initial:0,cat:'Bebidas',unlock:'bitter'},
 azeite:{name:'Óleo vegetal',cost:1.5,initial:6,cat:'Cozinha'},
 // Vinho de garrafão: uva da parreira + garrafão vazio, na mesa de compota. Só sai da roça (não se pede pelo telefone).
 vinho:{name:'Vinho de garrafão',cost:3,price:24,initial:0,cat:'Balcão',unlock:'vinho',sealed:true,farmOnly:true},
 // Costelão: as mantas vêm da carneação do boi laçado no curral; costela e maionese são preparadas no campo.
 costela_crua:{name:'Manta de costela crua',cost:40,initial:0,cat:'Campo',noSupplier:true},
 costela:{name:'Costela assada',cost:.02,price:22,initial:0,cat:'Campo',noSupplier:true},
 lenha:{name:'Lenha rachada',cost:0,initial:0,cat:'Campo',noSupplier:true},
 maionese:{name:'Maionese caseira',cost:1.2,price:9,initial:0,cat:'Campo',noSupplier:true,sealed:true}
};
const RECIPES={torrada:{name:'Torrada de salame',price:14,unlock:'salame',parts:['pao_xis','salame']},xis_salada:{name:'Xis salada',price:22,parts:['pao_xis','salada','burger','ovo','queijo']},xis_bacon:{name:'Xis bacon',price:27,unlock:'bacon',parts:['pao_xis','salada','burger','ovo','queijo','bacon']},xis_coracao:{name:'Xis coração',price:29,unlock:'coracao',parts:['pao_xis','salada','burger','ovo','queijo','coracao']}};
const BULK={costela:{unit:500,weights:[500,1000,1500],capacity:40000},erva:{unit:500,weights:[250,500,750],capacity:9000},pinhao:{unit:1000,weights:[500,1000,2000,3000],capacity:16000},bergamota:{unit:1000,weights:[1000,2000,3000,6000],capacity:24000}};
const GEAR={feet:{name:'A pé',bonus:0},bootsGaucho:{name:'Bota de gaúcho',bonus:.15},bootsBagual:{name:'Bota bagual',bonus:.25}};
const MATES=[{name:'Mate da casa',duration:10,bonus:.55},{name:'Mate Cuiudo',duration:18,bonus:.65},{name:'Mate Topetudo',duration:25,bonus:.75},{name:'Mate Lendário',duration:35,bonus:.85}];
const UPGRADES=[
 {id:'trago',goods:'cachaca',name:'Mesa de tragos',cost:0,rep:0,desc:'Mesa de cachaça para o trago de pura. O Valter acertou com a Ferragem: sai de graça e vem com 10 doses.'},
 {id:'coffee',level:2,goods:'cafe',name:'Café de cambona',cost:100,rep:62,desc:'Instala um fogareiro a lenha rústico com a cambona, a chaleira preta, e libera pedidos de café. Inclui 12 porções.'},
 {id:'bootsGaucho',name:'Bota de gaúcho',cost:90,rep:62,desc:'Velocidade permanente +15%. Não acumula com outro equipamento.'},
 {id:'bootsBagual',level:3,name:'Bota bagual',cost:190,rep:68,requires:'bootsGaucho',desc:'Velocidade permanente +25%. Substitui a bota de gaúcho.'},
 {id:'mateCuiudo',name:'Mate Cuiudo',cost:110,rep:64,desc:'Impulso de +65% durante 18 segundos.'},
 {id:'mateTopetudo',level:3,name:'Mate Topetudo',cost:240,rep:70,requires:'mateCuiudo',desc:'Impulso de +75% durante 25 segundos.'},
 {id:'mateLendario',level:5,name:'Mate Lendário',cost:440,rep:80,requires:'mateTopetudo',desc:'Impulso de +85% durante 35 segundos.'},
 {id:'cigarro_py',level:3,name:'Cigarro do Paraguai',cost:140,rep:67,desc:'Melhora os maços da prateleira: cada venda passa de R$ 12 para R$ 18.'},
 {id:'table4',level:4,name:'Quarta mesa',cost:240,rep:74,desc:'Mais quatro lugares para o restaurante. Participa do carteado durante campeonatos.'},
 {id:'bodoque',name:'Bodoque',cost:60,rep:0,desc:'Forquilha de goiabeira com borracha de câmara. No campo, segure F (ou o botão) e solte quando o círculo sobre o quero-quero ficar verde: ele leva um susto e vai embora.'},
 {id:'placaFiado',name:'Placa “Fiado só amanhã”',cost:70,rep:0,desc:'Pendurada ao lado do balcão: bem menos fregueses pedem fiado (de 18% para 4%). Quem já tem conta continua pagando normalmente.'},
 {id:'tray',name:'Bandeja de dois lugares',cost:80,rep:60,desc:'Carregue dois itens. Selecione o espaço com 1 e 2.'},
 {id:'pepino',goods:'pepino',shop:'conserva',name:'Conserva de pepino',cost:45,rep:62,desc:'Libera a venda e inclui 4 potes para começar.'},
 {id:'bergamota',goods:'bergamota',shop:'colheita',name:'Bergamota do pomar',cost:45,rep:63,desc:'Libera venda por peso e inclui 12 kg de bergamota.'},
 {id:'amendoim',goods:'amendoim',shop:'atacado',name:'Amendoim torrado',cost:55,rep:64,desc:'Libera o petisco e inclui 4 porções.'},
 {id:'salame',level:2,goods:'salame',shop:'badin',name:'Salame de colônia',cost:85,rep:66,desc:'Salame da nona do Badin: libera salame e torradas. Coloque pão + salame diretamente na prensa. Vem da despensa da colônia, na casa do Badin.'},
 {id:'pinhao',level:2,goods:'pinhao',shop:'colheita',name:'Pinhão a granel',cost:90,rep:68,desc:'Libera venda por peso e inclui 6 kg de pinhão.'},
 {id:'bitter',level:3,goods:'bitter',name:'Bitter da casa',cost:125,rep:72,desc:'Libera a estação de bitter. Inclui 4 doses; sirva segurando E.'},
 {id:'capacity',level:2,name:'Estações maiores',cost:120,rep:64,desc:'30 unidades por estação e 15 kg de erva-mate.'},
 {id:'bacon',name:'Xis bacon',cost:90,rep:63,desc:'Libera bacon e uma nova receita. O bacon vem do Açougue da Fronteira.'},
 {id:'table3',level:2,name:'Terceira mesa',cost:145,rep:66,desc:'Mais uma mesa de quatro lugares no salão.'},
 {id:'grill3',level:3,name:'Terceiro espaço da chapa',cost:110,rep:65,desc:'Mais uma boca independente para cozinhar em paralelo.'},
 {id:'coracao',level:4,name:'Xis coração',cost:140,rep:70,desc:'Libera o xis coração. O coração sai da carneação do boi, junto das mantas e do hambúrguer.'}
];
const EVENTS={
 campeonato:{name:'Campeonato de truco',icon:'♠',desc:'Duas duplas por mesa entram na abertura e ficam até fechar. Os parceiros permanecem juntos, trocam de adversários e continuam pedindo petiscos e bebidas. Não há outras chegadas.',prep:'Organize e amplie as mesas antes de abrir. Reponha cerveja, cachaça, bitter e petiscos. As duplas trocam de mesa entre rodadas; pedidos pendentes vão junto. Brigas exigem 10 teclas em 24 s.'},
 normal:{name:'Dia tranquilo',icon:'🌤',desc:'Movimento leve para conhecer a casa e seus fregueses.',prep:'Comece com ovos de codorna em conserva, cigarros e erva-mate. Deixe carne, pão e salada organizados.'},
 chuva:{name:'Chuva forte',icon:'☂',desc:'Mais gente procura abrigo. Guarda-chuvas deixam poças na entrada: elas reduzem a velocidade.',prep:'Reponha bebidas e mercadorias. Segure E perto de uma poça para secar o chão.'},
 radio:{name:'Final do campeonato no rádio',icon:'♫',desc:'Aos 75 segundos, o intervalo provoca pedidos de rodadas simultâneas nas mesas.',prep:'Deixe canecas e refrigerantes no apoio. A rodada extra pode chegar antes do xis ficar pronto.'},
 baile:{name:'Baile na comunidade',icon:'♪',desc:'Movimento intenso nos primeiros 75 segundos. Depois a turma vai para a festa e a bodega fica tranquila.',prep:'Prepare pedidos em paralelo e reponha antes de abrir. Aproveite a calmaria para limpar.'},
 feira:{name:'Feira da colônia',icon:'❀',desc:'O balcão comercial fica muito movimentado; o salão recebe menos gente.',prep:'Priorize erva-mate e as mercadorias desbloqueadas. A balança será bastante usada.'},
 geada:{name:'Manhã de geada',icon:'❄',desc:'Os grupos procuram comida quente: o salão pede lanche quente e café, quando o café de cambona está instalado.',prep:'Reforce os ingredientes dos lanches e, se tiver cafeteira, o café. Use o chimarrão central para agilizar as entregas.'}
};
const PEOPLE=[{name:'Lúcia',retailFav:'erva',sprite:1,fav:'refri',color:'#648291'},{name:'Seu Anselmo',retailFav:'cigarro',sprite:2,fav:'cachaca',color:'#bda47a'},{name:'Rosa',retailFav:'codorna',sprite:3,fav:'xis_salada',color:'#ba765e'},{name:'Dona Nair',retailFav:'erva',sprite:4,fav:'refri',color:'#ac945d'},{name:'Valter',retailFav:'cigarro',sprite:5,fav:'cerveja',color:'#668257'},{name:'Arlindo',retailFav:'codorna',sprite:2,fav:'cachaca',color:'#8b9860'}];

const WAGER_OPTIONS=[0,5,10,25,50,100];

Object.assign(EVENTS, {
 gremio:{name:'Jogo do Grêmio',icon:'⚽',desc:'Só gremistas chegam para acompanhar a TV. No intervalo, as mesas pedem outra rodada.',prep:'Evento liberado após o primeiro dia. Reponha bebidas e petiscos; a TV é presente da comunidade.'},
 inter:{name:'Jogo do Inter',icon:'⚽',desc:'A bodega recebe apenas colorados. O intervalo traz mais pedidos de bebidas.',prep:'Organize as bebidas antes de abrir. A TV da comunidade transmite a partida.'},
 grenal:{name:'Gre-Nal',icon:'⚽',desc:'As duas torcidas se encontram e dividem mesas. A partir do dia 5, as discussões podem virar briga.',prep:'Reponha bebidas e petiscos. Nos dias avançados, E inicia a sequência de 10 teclas para apartar a briga.'}
});
Object.assign(EVENTS,{
});
EVENTS.costelao={name:'Costelão de domingo',icon:'🔥',desc:'A bodega vai para o campo: costela no fogo de chão, maionese caseira e chimarrão. A freguesia compra costela por peso.',prep:'As mantas vêm da carneação: lace e carneie um boi no pasto do curral. Separe ovos e óleo para a maionese e refrigerante na caixa térmica.'};
// Eventos pequenos acontecem, mas sem aviso e sem aparecer no calendário (lá eles contam como dia tranquilo).
// Com aviso: truco, chuva forte, futebol (Grêmio, Inter, Gre-Nal) e costelão.
for(const id of ['radio','baile','feira','geada'])EVENTS[id].quiet=true;
EVENTS.chuva.desc='Clientes molhados deixam poças pelo caminho até as mesas e o balcão. O chão molhado reduz sua velocidade por 8 segundos.';

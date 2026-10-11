// Caminhos relativos ao HTML: funcionam tanto por file:// quanto por HTTP.
'use strict';
// Cenário único, sem decoração: as peças ficam em assets/images/decor e são compradas no celular.
const ROOM_DATA = 'assets/images/room2.webp';
const PEOPLE_DATA = 'assets/images/people.webp';
const FURNITURE_DATA = 'assets/images/furniture.webp';
const MUSIC_DATA = ['assets/audio/1.mp3', 'assets/audio/2.mp3'];

// A arte, a colisão e as rotas usam o mesmo mundo lógico de 1600 x 900 (16:9, o formato da arte).
const W = 1600, H = 900;
// Porta de entrada da freguesia (embaixo, no tapete) e ponto de saída.
const ENTRY = {x:1060,y:880}, EXIT = {x:1060,y:870};
const DAY = 180, ORDER_WAIT = 110, COUNTER_WAIT = 95;
// Mantidos para recuperar partidas anteriores à separação dos arquivos.
// Saves separados: jogo normal, testes com dinheiro infinito e testes sem tutorial (escolhe eventos, dinheiro normal).
const KEY = 'bodega-interior-v3', TEST_KEY = 'bodega-interior-tests', TEST2_KEY = 'bodega-interior-tests-eventos';
// Versão das regras do modo dinheiro infinito (só dinheiro infinito e escolha de eventos).
const TEST_RULES = 3;
function saveKey(mode){return mode===true?TEST_KEY:mode==='eventos'?TEST2_KEY:KEY;}
const BASE_SPEED=280;

const COOK={torrada:6,burger:11,ovo:7,bacon:8,coracao:10};

const SPRITES=[{x:190,y:26,w:244,h:483},{x:670,y:25,w:226,h:481},{x:1127,y:18,w:252,h:491},{x:188,y:526,w:247,h:474},{x:671,y:528,w:229,h:478},{x:1123,y:524,w:250,h:477}];

const furnitureCrops=[[46,48,442,422],[552,74,435,374],[1101,9,379,480],[133,502,263,514],[527,561,488,397],[1051,560,476,394]];

const TABLE_DEF=[{id:0,x:960,y:458,w:138,h:87,seats:4},{id:1,x:1265,y:460,w:138,h:87,seats:4},{id:2,x:975,y:605,w:136,h:87,seats:4,unlock:'table3'},{id:3,x:1255,y:603,w:150,h:88,seats:4,unlock:'table4'}];

// Cozinha no chão de terra (esquerda); comércio, mesas e balcão no assoalho (direita).
const FIXED=[
 {id:'bin:pao_xis',x:50,y:355,w:72,h:57,label:'Pão de xis'}, {id:'bin:burger',x:156,y:355,w:72,h:57,label:'Hambúrguer'}, {id:'bin:ovo',x:262,y:355,w:72,h:57,label:'Ovo'}, {id:'bin:queijo',x:369,y:355,w:72,h:57,label:'Queijo'}, {id:'bin:salada',x:475,y:355,w:72,h:57,label:'Salada'}, {id:'bin:bacon',x:581,y:355,w:72,h:57,label:'Bacon',unlock:'bacon'}, {id:'bin:coracao',x:688,y:355,w:72,h:57,label:'Coração',unlock:'coracao'},
 {id:'grill:0',x:40,y:455,w:92,h:66,label:'Chapa · espaço 1'}, {id:'grill:1',x:40,y:531,w:92,h:66,label:'Chapa · espaço 2'}, {id:'grill:2',x:40,y:607,w:92,h:66,label:'Chapa · espaço 3',unlock:'grill3'},
 {id:'bench:0',x:300,y:480,w:83,h:108,label:'Montagem · bancada 1'}, {id:'bench:1',x:392,y:480,w:83,h:108,label:'Montagem · bancada 2'}, {id:'press',x:40,y:705,w:110,h:82,label:'Prensa'},
 {id:'bottle:refri',x:560,y:455,w:55,h:92,label:'Refrigerante'}, {id:'tap:cerveja',x:625,y:455,w:55,h:92,label:'Cerveja'}, {id:'pour',x:560,y:610,w:90,h:87,label:'Servir uma dose',unlock:'trago'},
 {id:'parking:0',x:300,y:680,w:83,h:78,label:'Apoio · lugar 1'}, {id:'parking:1',x:392,y:680,w:83,h:78,label:'Apoio · lugar 2'}, {id:'trash',x:50,y:815,w:48,h:52,label:'Lixeira'},
 {id:'shop:cigarro',x:960,y:355,w:52,h:57,label:'Maços de cigarros'}, {id:'shop:codorna',x:1022,y:355,w:52,h:57,label:'Ovos de codorna em conserva'}, {id:'bag',x:1084,y:355,w:52,h:57,label:'Balança de erva-mate'},
 {id:'shop:pepino',x:1146,y:355,w:52,h:57,label:'Pepino em conserva',unlock:'pepino'}, {id:'shop:salame',x:1208,y:355,w:52,h:57,label:'Salame de colônia',unlock:'salame'}, {id:'shop:amendoim',x:1270,y:355,w:52,h:57,label:'Amendoim torrado',unlock:'amendoim'}, {id:'shop:pinhao',x:1332,y:355,w:52,h:57,label:'Pinhão a granel',unlock:'pinhao'}, {id:'shop:bergamota',x:1394,y:355,w:52,h:57,label:'Bergamota',unlock:'bergamota'}, {id:'shop:vinho',x:1456,y:355,w:52,h:57,label:'Vinho de garrafão',unlock:'vinho'},
 {id:'service',x:1150,y:770,w:200,h:55,label:'Balcão de atendimento'}, {id:'mate',x:780,y:470,w:66,h:54,label:'Chimarrão · segure E'}, {id:'bitter',x:690,y:620,w:67,h:64,label:'Servir bitter',unlock:'bitter'},
 {id:'coffee',x:690,y:730,w:67,h:55,label:'Café de cambona · segure E',unlock:'coffee'},
 // Da roça para a bodega: o trigo vira pão no forno a lenha e o leite da vaca vira queijo no tacho.
 {id:'forno',x:505,y:776,w:112,h:78,label:'Forno a lenha · pão de xis',prepOnly:true}, {id:'tacho',x:190,y:800,w:86,h:64,label:'Tacho · queijo da casa',prepOnly:true},
 {id:'conservas',x:300,y:812,w:170,h:52,label:'Mesa de compota',prepOnly:true}
];

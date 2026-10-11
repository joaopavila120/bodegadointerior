'use strict';

// Silhuetas recortadas apenas no canvas; os arquivos originais ficam intactos.
PEOPLE.push(
 {id:'indavirus',name:'Indavirus',partner:'lauro',retailFav:'erva',fav:'cerveja',origin:'Gustavo Pórco · Jornal Indavírus, de Indaial (SC)',exclusiveVoice:true,sprite:characterSprite('indavirus',[235, 45, 615, 1365],[[285, 6], [331, 20], [370, 43], [413, 81], [414, 115], [428, 148], [420, 207], [400, 250], [366, 284], [361, 309], [405, 346], [470, 360], [511, 392], [525, 463], [560, 604], [582, 772], [574, 816], [574, 872], [556, 900], [509, 915], [474, 894], [468, 854], [484, 816], [458, 806], [473, 789], [462, 708], [451, 603], [451, 705], [471, 791], [460, 813], [478, 960], [471, 975], [486, 1035], [510, 1100], [512, 1181], [527, 1223], [552, 1231], [567, 1267], [593, 1300], [603, 1339], [582, 1355], [538, 1355], [502, 1338], [454, 1305], [443, 1271], [454, 1233], [444, 1171], [415, 1125], [399, 1077], [403, 1042], [374, 1009], [368, 979], [340, 975], [323, 930], [307, 890], [306, 953], [300, 973], [304, 1018], [319, 1059], [318, 1141], [318, 1198], [335, 1215], [342, 1262], [334, 1287], [285, 1315], [234, 1331], [170, 1331], [154, 1311], [152, 1290], [169, 1263], [210, 1235], [241, 1204], [254, 1203], [253, 1167], [231, 1117], [221, 1045], [212, 1008], [199, 975], [179, 971], [174, 928], [163, 855], [161, 815], [133, 792], [141, 712], [151, 667], [162, 620], [158, 569], [132, 604], [97, 626], [59, 637], [30, 625], [11, 593], [6, 551], [17, 511], [43, 476], [52, 432], [67, 413], [97, 393], [111, 369], [110, 330], [124, 310], [146, 302], [164, 304], [184, 325], [201, 323], [180, 282], [172, 218], [165, 204], [163, 159], [188, 157], [186, 125], [169, 119], [172, 95], [187, 63], [217, 39], [236, 18]])},
 {id:'lauro',name:'Lauro',partner:'indavirus',retailFav:'salame',fav:'cachaca',origin:'Lauro Antigo · parceiro do Indavírus, de Indaial (SC)',exclusiveVoice:true,sprite:characterSprite('lauro',[245, 65, 645, 1365],[[0, 0], [645, 0], [645, 1365], [0, 1365]])},
 {id:'peixinhonabrasa',name:'Peixinho na Brasa',retailFav:'amendoim',fav:'cerveja',origin:'Vera Cruz (RS) · peixinho na brasa, Kaiser na mão',exclusiveVoice:true,sprite:characterSprite('peixinhonabrasa',[180, 75, 665, 1430],[[0, 0], [665, 0], [665, 1430], [0, 1430]])},
 {id:'manolima',name:'Mano Lima',retailFav:'erva',fav:'cachaca',exclusiveVoice:true,origin:'O filósofo dos pampas · tropeiro e gaiteiro do M’Bororé',sprite:characterSprite('manolima',[220, 75, 615, 1415],[[249, 11], [306, 15], [343, 31], [373, 51], [401, 71], [406, 128], [419, 151], [435, 158], [435, 170], [418, 179], [430, 195], [443, 202], [441, 215], [426, 225], [427, 242], [409, 257], [385, 251], [414, 274], [455, 283], [499, 304], [529, 348], [546, 400], [555, 431], [562, 467], [586, 510], [596, 551], [603, 573], [599, 600], [582, 612], [579, 670], [567, 730], [560, 768], [566, 806], [563, 843], [539, 860], [496, 871], [513, 907], [530, 955], [545, 990], [547, 1020], [534, 1060], [511, 1087], [486, 1106], [484, 1165], [476, 1213], [471, 1261], [485, 1286], [488, 1317], [505, 1355], [508, 1381], [492, 1399], [442, 1401], [411, 1383], [390, 1355], [375, 1346], [374, 1305], [378, 1274], [368, 1236], [368, 1204], [357, 1160], [352, 1101], [323, 1100], [299, 1082], [289, 1059], [279, 1088], [253, 1101], [237, 1104], [238, 1151], [229, 1188], [226, 1225], [224, 1266], [229, 1312], [223, 1343], [185, 1352], [159, 1373], [120, 1386], [74, 1388], [37, 1378], [29, 1357], [42, 1335], [74, 1313], [100, 1288], [121, 1247], [117, 1221], [108, 1185], [108, 1138], [112, 1098], [80, 1084], [66, 1056], [50, 1019], [42, 981], [50, 950], [69, 892], [90, 824], [110, 764], [122, 742], [90, 750], [52, 741], [26, 727], [11, 704], [7, 675], [22, 644], [18, 617], [13, 585], [19, 544], [8, 532], [17, 509], [43, 467], [67, 414], [76, 367], [93, 340], [127, 311], [145, 306], [159, 286], [169, 239], [171, 217], [188, 203], [180, 194], [189, 174], [187, 159], [180, 147], [177, 132], [189, 126], [193, 98], [202, 75], [190, 67], [189, 47], [209, 28]])}
,
 // Novos especiais com pixel art própria. O Gaudêncio saiu do jogo: fica só a vaga na lista (removed), para os saves antigos.
 {id:'dianho',name:'Dianho',retailFav:'codorna',fav:'refri',noAlcohol:true,exclusiveVoice:true,origin:'Fernando Schmidt · gângster de galpão, de Santa Cruz do Sul',sprite:characterSprite('dianho',[253, 47, 604, 1375],[[0, 0], [604, 0], [604, 1375], [0, 1375]])},
 {id:'mitodosul',name:'Mito do Sul',retailFav:'pinhao',fav:'xis_salada',noDrinks:true,exclusiveVoice:true,origin:'Almir · streamer gremista de Farming Simulator e My Summer Car',sprite:characterSprite('mito',[226, 55, 590, 1443],[[0, 0], [590, 0], [590, 1443], [0, 1443]])},
 {id:'loligebien',name:'Loli Gebien',retailFav:'salame',fav:'cerveja',lovesChopp:true,exclusiveVoice:true,origin:'O jovem alemão de Pomerode (SC) · tamancos e chopp',sprite:characterSprite('loligarbien',[230, 39, 647, 1389],[[0, 0], [647, 0], [647, 1389], [0, 1389]])},
 {id:'jayme',name:'Jayme Caetano Braun',retailFav:'erva',fav:'cachaca',exclusiveVoice:true,origin:'O pajador de Bossoroca · poeta do Rio Grande',sprite:characterSprite('jayme',[202, 24, 609, 1487],[[0, 0], [609, 0], [609, 1487], [0, 1487]])},
 {id:'gaudencio',placeholder:true,removed:true,name:'Gaudêncio',retailFav:'erva',fav:'cachaca',exclusiveVoice:true,origin:'Gaúcho bagual da campanha · bombacha, bigode e paciência curta',sprite:4},
 {id:'baitaca',name:'Baitaca',retailFav:'erva',fav:'cachaca',exclusiveVoice:true,origin:'Cantor do fundo da grota · Rincão dos Pintos, São Luiz Gonzaga',sprite:characterSprite('baitaca',[225, 2, 677, 1441],[[0, 0], [677, 0], [677, 1441], [0, 1441]])}
);
const UNIQUE_VISITORS = new Set(['badin','marcio','marcelo','peixinhonabrasa','indavirus','lauro','dianho','mitodosul','loligebien','jayme','baitaca','gaudencio','valter']);
PEOPLE.forEach(p=>p.unique=UNIQUE_VISITORS.has(p.id));

function avatarSprite(){return PEOPLE.find(p=>p.id===G.avatarId)?.sprite??0;}
function activeUniqueVisitors(state=G){
 const taken=new Set();
 const add=i=>{if(PEOPLE[i]?.unique)taken.add(i);};
 state.shop.forEach(c=>add(c.person));
 state.groups.forEach(g=>g.members?.forEach(add));
 // Quem está de visita (presente, desafio, capítulo da história) também já está na bodega.
 if(state.challengeVisit)add(state.challengeVisit.person);
 add(PEOPLE.findIndex(p=>p.id===state.avatarId));
 return taken;
}
function visitorAvailable(i,extra=[]){return !!PEOPLE[i]&&(!PEOPLE[i].unique||!activeUniqueVisitors().has(i)&&!extra.includes(i));}
function groupSeatPosition(g,index){
 if(g.state==='tournamentMove'&&g.travel?.[index])return g.travel[index];
 const t=G.tables.find(t=>t.id===g.table);
 if(!t||!['seated','chat'].includes(g.state))return {x:g.x-index*25,y:g.y+index*8};
 return index<2?{x:t.x+32+index*(t.w-64),y:t.y+t.h+39}:{x:index===2?t.x-27:t.x+t.w+27,y:t.y+t.h/2+69};
}
function normalizeVisitors(state){
 const taken=new Set(),avatar=PEOPLE.findIndex(p=>p.id===state.avatarId);
 if(PEOPLE[avatar]?.unique)taken.add(avatar);
 const reserve=i=>{if(!PEOPLE[i])return 0;if(!PEOPLE[i].unique)return i;if(taken.has(i))return 1;taken.add(i);return i;};
 state.shop.forEach(c=>c.person=reserve(c.person));
 state.groups.forEach(g=>{g.members=g.members.map(reserve);g.person=g.members[0];g.diners?.forEach((d,i)=>d.person=g.members[i]);});
}

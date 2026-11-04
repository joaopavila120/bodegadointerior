// Grazi and the two human forms of Teiniaguá. Keep existing numeric save IDs.
'use strict';
for(const[key,meta]of Object.entries(CUSTOMER_ART_CROPS)){
  EXPANSION_CROPS[key]=meta;
  EXPANSION_ART[key]=new Image();
}
const customerArtReady=Promise.all(Object.keys(CUSTOMER_ART_CROPS).map(key=>{
  expansionImage(key);return expansionImageLoads[key].then(()=>!!EXPANSION_ART[key].naturalWidth);
})).then(results=>results.every(Boolean));
{
  const grazi=PEOPLE.find(p=>p.id==='grazi');
  grazi.sprite=expansionCharacter('grazi-v1');
  PEOPLE.push(
    {id:'princesa',name:'Teiniaguá',worldOnly:true,unique:true,color:'#51617b',origin:'Princesa moura da Salamanca · forma usada na cena de libertação',sprite:expansionCharacter('princesa-v1')},
    {id:'gaucha_chique',name:'Teiniaguá',unique:true,retailFav:'erva',fav:'cafe',color:'#854d50',origin:'Libertada da Salamanca do Jarau · agora visita a bodega como uma gaúcha',sprite:expansionCharacter('gaucha-chique-v1')}
  );
  for(const[id,key]of [['grazi','grazi-v1'],['princesa','princesa-v1'],['gaucha_chique','gaucha-chique-v1']]){
    registerSecondary(id,key,0,4);
    const pose=SECONDARY_POSES.get(PEOPLE.find(p=>p.id===id).sprite);
    pose.idle=0;
    pose.directionHeights=[0,1,2].map(dir=>expansionRowHeight(key,dir*4,4));
    UNIQUE_VISITORS.add(id);
  }
}
Object.assign(DEFAULT_DIALOGUES,{
  grazi:[
    {player:'Buenas, Grazi! Tudo tranquilo?',reply:'Tudo certo, Sadi. Vim pela prosa; a denúncia de saudade é lá na Casona.'},
    {player:'E o som do Márcio?',reply:'No seis, como combinamos. O Marcelo já perguntou se seis em cada caixa conta como doze.'},
    {player:'Vai um café?',reply:'Vai bem. Um café, um descanso e depois sigo meu caminho.'},
    {player:'Gostou do anel?',reply:'Ficou lindo. Só não deixo o Márcio contar o preço em voz alta toda vez que alguém olha.'}
  ],
  princesa:[
    {player:'É tu, Teiniaguá?',reply:'Sou eu, gaúcho. A princesa e a lagartixa eram a mesma alma, presa pelo mesmo encanto.'},
    {player:'Há quanto tempo tu tá aqui?',reply:'Há tanto que eu contava os anos pelas gotas que caíam da pedra.'},
    {player:'Que luz é essa?',reply:'É o carbúnculo. Ele guardou a luz da serra enquanto eu não podia vê-la.'},
    {player:'Tu ouviu o São Dunstano?',reply:'Ouvi o martelo do ferreiro lá de cima. Era um dos poucos sons que chegavam até mim.'},
    {player:'O Diabo te prende aqui?',reply:'Prende o corpo. Minha vontade de sair ele nunca conseguiu prender.'},
    {player:'Tá livre, princesa.',reply:'Então deixa a coroa com o passado. Quero pisar no chão desta terra com meus próprios pés.'},
    {player:'Pra onde tu vai agora?',reply:'Pra onde houver céu aberto, prosa boa e uma porta que eu possa atravessar.'},
    {player:'Aparece na bodega.',reply:'Apareço, Sadi. Desta vez, sem gaiola, sem encanto e sem coroa.'}
  ],
  gaucha_chique:[
    {player:'Buenas, Teiniaguá! Como vai a vida aqui fora?',reply:'Bah, Sadi, até a chuva no rosto parece novidade depois daquele tempo embaixo da terra.'},
    {player:'E a coroa de princesa?',reply:'Ficou com o encanto. Aqui eu prefiro um vestido de prenda e liberdade pra ir e vir.'},
    {player:'Te arrumo uma mesa?',reply:'Uma perto da janela. Passei tanto tempo vendo pedra que agora quero ver o céu.'},
    {player:'Vai levar erva?',reply:'Vou. A primeira cuia que tomei em liberdade valeu mais que o ouro inteiro da Salamanca.'},
    {player:'Aceita um xis?',reply:'Aceito, e bem servido. Só traz guardanapo, que esse bordado não combina com maionese.'},
    {player:'Tu ainda lembra da caverna?',reply:'Lembro. Mas agora posso escolher onde passo a noite. Obrigada por isso, gaúcho.'},
    {player:'Vai dançar no baile?',reply:'Vou aprender uma vaneira. Depois de andar de quatro patas, acertar dois pés já é um progresso!'},
    {player:'Vai querer a conta?',reply:'Vou. E diz pro São Dunstano que qualquer dia levo um café lá na forja.'}
  ]
});
for(const id of ['grazi','princesa','gaucha_chique'])WORLD_TALK[id]=DEFAULT_DIALOGUES[id];

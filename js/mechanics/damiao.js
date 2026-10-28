// Morador comum: acrescentado ao fim para preservar os índices dos saves antigos.
'use strict';
{
  // Compartilha a mesma imagem carregada com o renderizador dos moradores.
  const sheet = ACTION_ART_CROPS.damiao;
  EXPANSION_ART['damiao-v1'] = ACTION_ART.damiao;
  EXPANSION_CROPS['damiao-v1'] = { width: sheet.size[0], height: sheet.size[1], frames: sheet.frames };
  PEOPLE.push({
    id: 'damiao', name: 'Damião', unique: true, wanderingCommon: true,
    retailFav: 'erva', fav: 'xis_salada', color: '#68734b',
    origin: 'Gaúcho da região · freguês da bodega', sprite: expansionCharacter('damiao-v1')
  });
  UNIQUE_VISITORS.add('damiao');
  registerSecondary('damiao', 'damiao-v1', 0, 4);
  SECONDARY_POSES.get(PEOPLE.at(-1).sprite).idle = 0;
}

DEFAULT_DIALOGUES.damiao = [
  { player: 'Buenas, Damião! Como vai a lida?', reply: 'Buenas, tchê! Hoje rendeu. Agora falta um mate e um banco na sombra.' },
  { player: 'Vai um xis no capricho?', reply: 'Vai sim! Bota um guardanapo a mais, que xis bom não se come de camisa limpa.' },
  { player: 'Como tá esse tempo?', reply: 'Saí de casa com frio e já tô dobrando a manga. Esse tempo muda mais que parceiro de truco!' },
  { player: 'Tá indo pra onde?', reply: 'Dar uma volta e resolver umas compras. Mas se aparecer prosa boa, eu atraso sem remorso.' },
  { player: 'Aceita um chimarrão?', reply: 'Mas é claro! Só não ferve a água, que minha língua ainda tem muito causo pra contar.' },
  { player: 'E a pescaria, rendeu?', reply: 'Trouxe história, que peixe mesmo levou minha isca e foi embora sem agradecer.' },
  { player: 'Vai levar erva hoje?', reply: 'Me separa um pacote. Lá em casa a térmica esvazia antes de a visita sentar direito.' },
  { player: 'Tu joga bocha?', reply: 'Jogo! Minha mira é boa; a cancha é que às vezes inventa uma curva.' },
  { player: 'Como anda o truco?', reply: 'Ontem perdi duas e ganhei uma prosa comprida. Já serviu pra não voltar de mãos vazias.' },
  { player: 'Vai pro baile?', reply: 'Se a gaita chamar, eu vou. Só preciso convencer minhas botas de que amanhã tem trabalho.' },
  { player: 'Tá com fome, vivente?', reply: 'Bah, passei pela tua porta e o cheiro da chapa me fez mudar de rumo!' },
  { player: 'O que achou da bodega?', reply: 'Tá ficando um baita lugar, Sadi. Comida boa e gente conhecida: é por isso que eu volto.' },
  { player: 'Tem novidade por aí?', reply: 'O vizinho arrumou a cerca. Agora as galinhas dele entram pelo portão, tudo muito organizado.' },
  { player: 'Quer sentar um pouco?', reply: 'Quero sim. Caminhei tanto hoje que até a sombra pediu descanso.' },
  { player: 'Qual o segredo de um bom churrasco?', reply: 'Brasa com calma e sal na medida. E alguém pra cuidar da carne enquanto eu corto o pão.' },
  { player: 'Até a próxima, Damião!', reply: 'Até, tchê! Guarda um lugarzinho, que uma hora dessas eu volto pra comer.' }
];
WORLD_TALK.damiao = DEFAULT_DIALOGUES.damiao;

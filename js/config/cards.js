// Álbum de cartas colecionáveis, no estilo das figurinhas antigas: frente com a arte e verso com a história.
// A arte de cada carta vai em assets/images/cards/<id>.png (retrato 2:3). Sem o arquivo, a frente mostra o retrato
// do personagem especial ou as iniciais da figura histórica.
'use strict';

const CARD_SETS = [
  { id: 'bodega', name: 'Gente da bodega', icon: '🍺', color: '#8a3a24' },
  { id: 'farrapos', name: 'Heróis farrapos', icon: '⚔️', color: '#2f6a3a' },
  { id: 'missoes', name: 'Missões', icon: '✝️', color: '#7a4a2a' },
  { id: 'sc', name: 'Santa Catarina', icon: '🌉', color: '#2a4f8a' },
  { id: 'vozes', name: 'Vozes e letras do Sul', icon: '🎶', color: '#6a2a6a' },
  { id: 'lendas', name: 'Lendas do Sul', icon: '🔥', color: '#22303f' }
];
// how: como se ganha (aparece no verso e no álbum enquanto a carta falta).
const CARDS = [
  // ---------- Gente da bodega: o amigo dá a carta dele com amizade 30 ----------
  { id: 'valter', set: 'bodega', person: 'valter', name: 'Valter', title: 'O vizinho', text: 'Amigo de lida do pai do Sadi e colorado de coração. Cuida do galpão do vô desde que o velho se foi e conhece cada freguês pelo nome.' },
  { id: 'badin', set: 'bodega', person: 'badin', name: 'Badin', title: 'O Colono', text: 'O humor da colônia italiana de Erechim. A nona dele cura o melhor salame da Serra e ninguém sai da casa de pedra sem um prato de polenta.' },
  { id: 'guri', set: 'bodega', person: 'guri', name: 'Guri', title: 'Gaudério da fronteira', text: 'Guri de Uruguaiana, ligeiro que nem potro novo. Pede ovo de codorna e cerveja, e conta causo que ninguém consegue provar.' },
  { id: 'marcio', set: 'bodega', person: 'marcio', name: 'Márcio', title: 'Gêmeo da Casona', text: 'É o quê? Mora na Casona da Serra com o Marcelo, faz o churrasco na laje e chama tudo de show de bola.' },
  { id: 'marcelo', set: 'bodega', person: 'marcelo', name: 'Marcelo', title: 'Gêmeo da Casona', text: 'Show de bola! Divide a Casona, a churrasqueira e até a risada com o Márcio. Ninguém sabe quem é o mais velho.' },
  { id: 'indavirus', set: 'bodega', person: 'indavirus', name: 'Indavírus', title: 'Repórter de Indaial', text: 'Gustavo Pórco, do Jornal Indavírus. Onde tem bodega nova, galpão velho ou briga de bocha, ele aparece com a câmera, ja.' },
  { id: 'lauro', set: 'bodega', person: 'lauro', name: 'Lauro Bolador', title: 'Rei da cancha', text: 'Parceiro do Indavírus, de Indaial. Joga bocha como ninguém e tem fama de quebrar tudo em que encosta.' },
  { id: 'peixinhonabrasa', set: 'bodega', person: 'peixinhonabrasa', name: 'Peixinho na Brasa', title: 'Mestre da brasa', text: 'De Vera Cruz, Kaiser na mão e peixe no fogo. Jura que o peixe dele é melhor que qualquer costelão.' },
  { id: 'manolima', set: 'bodega', person: 'manolima', name: 'Mano Lima', title: 'O filósofo dos pampas', text: 'Tropeiro e gaiteiro do M’Bororé. Ensina truco pra todo mundo, mas não alivia na mesa.' },
  { id: 'dianho', set: 'bodega', person: 'dianho', name: 'Dianho', title: 'Gângster de galpão', text: 'Fernando Schmidt, de Santa Cruz do Sul. Não bebe álcool, reforma bancada que nem Nicolas Cagezinho e cobra respeito na bodega.' },
  { id: 'mitodosul', set: 'bodega', person: 'mitodosul', name: 'Mito do Sul', title: 'Streamer da colônia', text: 'Almir, gremista, joga Farming Simulator e My Summer Car ao vivo. O chat escolhe até a planta da bodega.' },
  { id: 'loligebien', set: 'bodega', person: 'loligebien', name: 'Loli Gebien', title: 'Chopeiro de Pomerode', text: 'O jovem alemão de tamancos. Só pede chope e jura que a oma faz a melhor cuca do Vale Europeu. Prost!' },
  { id: 'jayme', set: 'bodega', person: 'jayme', name: 'Jayme Caetano Braun', title: 'O pajador de Bossoroca', text: 'Poeta do Rio Grande. Declama verso no balcão e não deixa nenhum desafio sem resposta.' },
  { id: 'baitaca', set: 'bodega', person: 'baitaca', name: 'Baitaca', title: 'Cantor do fundo da grota', text: 'Do Rincão dos Pintos, em São Luiz Gonzaga. Canta enquanto serve, e enquanto não serve também.' },
  // ---------- Heróis farrapos ----------
  { id: 'bento_goncalves', set: 'farrapos', name: 'Bento Gonçalves', title: 'Líder farroupilha', years: '1788–1847', how: 'Comemorando o 20 de Setembro.', text: 'Estancieiro de Triunfo, comandou os farrapos na tomada de Porto Alegre em 20 de setembro de 1835 e foi presidente da República Rio-Grandense.' },
  { id: 'garibaldi', set: 'farrapos', name: 'Giuseppe Garibaldi', title: 'Herói de dois mundos', years: '1807–1882', text: 'Marinheiro italiano que lutou pelos farrapos. Levou dois barcos por terra, em carretas puxadas por bois, até o mar, para tomar Laguna em 1839. Depois ajudou a unificar a Itália.' },
  { id: 'anita', set: 'farrapos', name: 'Anita Garibaldi', title: 'Heroína de dois mundos', years: '1821–1849', text: 'Catarinense de Laguna, lutou a cavalo ao lado de Garibaldi na Revolução Farroupilha e, depois, nas guerras pela unificação da Itália.' },
  { id: 'canabarro', set: 'farrapos', name: 'David Canabarro', title: 'General farroupilha', years: '1796–1867', text: 'Comandou o exército farrapo nos últimos anos da guerra e assinou a Paz de Ponche Verde, em 1845, que encerrou dez anos de luta.' },
  { id: 'netto', set: 'farrapos', name: 'Antônio de Souza Netto', title: 'O general do Seival', years: '1803–1866', text: 'Depois de vencer a Batalha do Seival, proclamou a República Rio-Grandense em 11 de setembro de 1836.' },
  { id: 'lanceiros', set: 'farrapos', name: 'Lanceiros Negros', title: 'Cavalaria farroupilha', years: '1836–1844', text: 'Soldados negros, muitos deles escravizados que lutaram pela promessa de liberdade, formaram uma das tropas mais valentes da Revolução Farroupilha, sob o comando de Joaquim Teixeira Nunes.' },
  // ---------- Missões ----------
  { id: 'sepe', set: 'missoes', name: 'Sepé Tiaraju', title: '“Esta terra tem dono!”', years: '?–1756', text: 'Líder guarani da redução de São Miguel. Comandou a resistência dos povos das Missões na Guerra Guaranítica e morreu em combate em 1756.' },
  { id: 'roque_gonzalez', set: 'missoes', name: 'Roque González', title: 'Padre das Missões', years: '1576–1628', text: 'Jesuíta nascido em Assunção, fundou as primeiras reduções do lado de cá do rio Uruguai, como São Nicolau, em 1626. Foi canonizado em 1988 com os outros mártires das Missões.' },
  // ---------- Santa Catarina ----------
  { id: 'cruz_e_sousa', set: 'sc', name: 'Cruz e Sousa', title: 'Poeta do Desterro', years: '1861–1898', text: 'Filho de pais escravizados, nasceu em Desterro, a atual Florianópolis, e se tornou o maior poeta do simbolismo brasileiro.' },
  { id: 'blumenau', set: 'sc', name: 'Hermann Blumenau', title: 'Fundador de Blumenau', years: '1819–1899', how: 'Servindo na Oktoberfest.', text: 'Farmacêutico alemão que, em 1850, fundou no Vale do Itajaí a colônia que hoje leva o seu nome.' },
  { id: 'victor_meirelles', set: 'sc', name: 'Victor Meirelles', title: 'Pintor da Primeira Missa', years: '1832–1903', how: 'Servindo no baile de capela.', text: 'Nascido em Desterro, pintou “A Primeira Missa no Brasil” e “Batalha dos Guararapes”, quadros que estão em todo livro de história.' },
  { id: 'antonieta', set: 'sc', name: 'Antonieta de Barros', title: 'Professora e deputada', years: '1901–1952', text: 'Professora e jornalista de Florianópolis, foi a primeira mulher negra eleita deputada no Brasil, em 1934. Criou a lei catarinense do Dia do Professor.' },
  { id: 'joao_maria', set: 'sc', name: 'Monge João Maria', title: 'O monge do Contestado', years: 'século XIX', text: 'Peregrino que andava pelo planalto catarinense benzendo, curando e abençoando fontes d’água. A fé no monge marcou a gente que lutou na Guerra do Contestado (1912–1916).' },
  { id: 'hercilio_luz', set: 'sc', name: 'Hercílio Luz', title: 'A ponte da Ilha', years: '1860–1924', text: 'Governador de Santa Catarina que mandou construir a ponte pênsil entre a Ilha e o continente, em Florianópolis. Inaugurada em 1926, a ponte ganhou o nome dele.' },
  // ---------- Vozes e letras do Sul ----------
  { id: 'teixeirinha', set: 'vozes', name: 'Teixeirinha', title: 'Coração de Luto', years: '1927–1985', text: 'Vitor Mateus Teixeira, de Rolante, gravou “Coração de Luto” e virou um dos cantores que mais venderam discos no Brasil. Também fez filmes que lotavam os cinemas do interior.' },
  { id: 'gildo', set: 'vozes', name: 'Gildo de Freitas', title: 'Rei dos trovadores', years: '1919–1983', text: 'Trovador de improviso, varava a noite desafiando outro cantor em verso, sem perder a rima.' },
  { id: 'elis', set: 'vozes', name: 'Elis Regina', title: 'A Pimentinha', years: '1945–1982', text: 'Porto-alegrense, começou cantando no rádio ainda menina e virou uma das maiores vozes da música brasileira.' },
  { id: 'lupicinio', set: 'vozes', name: 'Lupicínio Rodrigues', title: 'O poeta da dor de cotovelo', years: '1914–1974', how: 'Servindo na festa da laje da Casona.', text: 'Compositor de Porto Alegre, autor de “Felicidade” e “Nervos de Aço”. Gremista, escreveu também o hino do Grêmio.' },
  { id: 'pedro_raymundo', set: 'vozes', name: 'Pedro Raymundo', title: 'O gaúcho alegre do rádio', years: '1906–1973', text: 'Gaiteiro catarinense de Imaruí que levou a música gaúcha ao rádio do Rio de Janeiro com “Adeus, Mariana”.' },
  { id: 'noel_guarany', set: 'vozes', name: 'Noel Guarany', title: 'A voz das Missões', years: '1941–1998', text: 'Cantor missioneiro que cantou a história dos povos guaranis e dos peões da fronteira, um dos pais da música nativista.' },
  { id: 'paixao_cortes', set: 'vozes', name: 'Paixão Côrtes', title: 'O Laçador', years: '1927–2018', how: 'Servindo no fandango do CTG.', text: 'Folclorista que pesquisou as danças e canções do gaúcho e ajudou a fundar o movimento tradicionalista. Foi o modelo da estátua do Laçador, em Porto Alegre.' },
  { id: 'barbosa_lessa', set: 'vozes', name: 'Barbosa Lessa', title: 'Fundador do 35 CTG', years: '1929–2002', how: 'Vencendo o rodeio crioulo.', text: 'Escritor e folclorista de Piratini, ajudou a fundar o 35 CTG, o primeiro Centro de Tradições Gaúchas, em 1948.' },
  { id: 'simoes_lopes', set: 'vozes', name: 'Simões Lopes Neto', title: 'Lendas do Sul', years: '1865–1916', how: 'Encontrando o Negrinho do Pastoreio.', text: 'Escritor de Pelotas que guardou em livro o Negrinho do Pastoreio, a Salamanca do Jarau e o Boitatá, nas “Lendas do Sul” e nos “Contos Gauchescos”.' },
  { id: 'erico', set: 'vozes', name: 'Erico Verissimo', title: 'O Tempo e o Vento', years: '1905–1975', text: 'Escritor de Cruz Alta, contou duzentos anos do Rio Grande na saga “O Tempo e o Vento”, com Ana Terra e o Capitão Rodrigo.' },
  { id: 'quintana', set: 'vozes', name: 'Mario Quintana', title: 'Eu passarinho', years: '1906–1994', text: 'Poeta de Alegrete que morou num hotel em Porto Alegre e escreveu: “Eles passarão… eu passarinho!”' },
  // ---------- Lendas do Sul: vencendo cada assombração ----------
  { id: 'negrinho', set: 'lendas', name: 'Negrinho do Pastoreio', title: 'Lenda do pampa', how: 'Encontrando o Negrinho na beira do rio.', text: 'Menino escravizado castigado por perder uma tropilha. Dizem que ele acha o que se perdeu: é só acender uma vela e pedir.' },
  { id: 'lobisomem', set: 'lendas', name: 'Lobisomem', title: 'Sexta de lua cheia', how: 'Vencendo o Lobisomem.', text: 'O sétimo filho homem vira bicho nas noites de sexta-feira e corre sete cemitérios antes de o galo cantar.' },
  { id: 'sanguanel', set: 'lendas', name: 'Sanguanel', title: 'Duende da colônia', how: 'Vencendo o Sanguanel.', text: 'Diabinho de chapéu vermelho das histórias dos imigrantes italianos. Esconde criança no mato, trança crina de cavalo e adora uma charada.' },
  { id: 'boitata', set: 'lendas', name: 'Boitatá', title: 'Cobra de fogo', how: 'Vencendo o Boitatá.', text: 'Uma cobra de fogo que ronda os banhados e os campos à noite e protege a mata de quem quer queimá-la.' },
  { id: 'mula', set: 'lendas', name: 'Mula sem Cabeça', title: 'Fogo no lugar da cabeça', how: 'Vencendo a Mula sem Cabeça.', text: 'Mula que solta fogo pelo pescoço e galopa nas noites de quinta pra sexta. Quem tira o freio de ferro quebra o encanto.' }
];
CARDS.push(
  {id:'teiniagua',set:'lendas',name:'Teiniaguá',title:'O brilho da Salamanca',how:'Derrotando uma Teiniaguá na caverna.',text:'Na lenda da Salamanca do Jarau, a Teiniaguá tem forma de lagartixa com uma pedra brilhante na cabeça. Na caverna do jogo, seu brilho anuncia o perigo.'},
  {id:'onca',set:'lendas',name:'Onça-parda',title:'Passo silencioso',how:'Derrotando uma onça-parda na caverna.',text:'Também chamada de puma, é uma felina de pelagem uniforme e cauda longa. Na aventura da bodega, espera uma abertura antes de saltar.'},
  {id:'saci',set:'lendas',name:'Saci',title:'Uma perna e um redemoinho',how:'Conversando com o Saci à noite nas estradas.',text:'Gorro vermelho, uma perna só e muita travessura. Quando a poeira começa a rodar sozinha, pode ser ele chegando para uma prosa.'},
  {id:'dunstano',set:'lendas',name:'São Dunstano',title:'O ferreiro do refúgio',how:'Conversando com São Dunstano no primeiro andar.',text:'O fantasma de São Dunstano recebe os viajantes no refúgio da caverna. Compra minérios, melhora equipamentos e ensina a voltar inteiro da próxima descida.'}
);
CARDS.forEach((c, n) => { c.n = n + 1; if (c.set === 'bodega') c.how ??= 'Amizade 30 com ' + c.name + '.'; c.how ??= 'Envelope de figurinhas do Atacado ou baú da caverna.'; });

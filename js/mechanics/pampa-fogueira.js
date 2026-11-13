// A última missão: voltar pra casa e sentar em volta do fogo. Sem peleia, sem pressa: é a noite em que todo mundo que o Sadi
// encontrou pelo caminho aparece na frente da bodega, e cada um conta um pedaço do que passou. Quando o fogo baixa, sobra
// o Sadi sozinho. E quem senta do lado dele é o vô.
'use strict';

const FOGUEIRA_RODA = ['lucia', 'anselmo', 'rosa', 'nair', 'valter', 'arlindo', 'badin', 'guri', 'marcio', 'marcelo', 'indavirus', 'lauro', 'peixinhonabrasa', 'dianho', 'mitodosul', 'loligebien', 'baitaca', 'olmiro', 'dunstano', 'hans', 'helga', 'estela', 'ramiro', 'arami', 'saci', 'grazi', 'jasy', 'kurupi', 'sepe', 'damiao', 'princesa', 'zeferino', 'neto'];
const FOGUEIRA_FRENTE = ['bento', 'garibaldi', 'anita', 'lanceiro', 'canabarro', 'manolima', 'jayme', 'padre_romio'];
function fogueiraFalas() {
  const cuia = !!G.relics?.cuia_vo;
  return {
    abre: [
      ['bento', 'Olha quem chegou. O dono da casa, atrasado pra própria festa.'],
      ['sadi', 'Bah… veio todo mundo.'],
      ['anita', 'E tu achou o quê? Que a gente ia atravessar o pampa e não vir cobrar o mate?']
    ],
    brinde: [
      ['bento', 'Vou falar pouco, que discurso eu já ouvi de sobra. Levanta o copo, quem tem copo.'],
      ['bento', 'Pelos que vieram. E pelos que não puderam vir.'],
      ['lanceiro', 'E pelos que vieram duas vezes.']
    ],
    memorias: [
      ['garibaldi', 'Quando eu vi esse bodegueiro pela primeira vez, ele não sabia nem amarrar um barco. Olha agora.'],
      ['sadi', 'Continuo não sabendo, Giuseppe.'],
      ['garibaldi', 'Eu sei. Foi o que salvou a gente: nunca te ocorreu que era impossível.'],
      ['sepe', 'A cruz dos Sete Povos voltou pro lugar dela. Essa terra tem dono, e tem memória.'],
      ['princesa', 'Duzentos anos dentro do cerro, e quem me abriu a porta foi um homem que vende xis.'],
      ['saci', 'E quem escondeu a chave dele três vezes fui eu. Ninguém agradece!'],
      ['indavirus', 'Isso aqui vai dar uma capa de jornal que tu não faz ideia. Lauro, anota.'],
      ['lauro', 'Tô anotando desde a Oktoberfest, Gustavo. Acabou o papel.'],
      ['canabarro', 'Tem gente que eu não sei se tenho direito de olhar nos olhos, hoje.'],
      ['lanceiro', 'Olha assim mesmo, general. É pra isso que a gente veio.']
    ],
    mano: [
      ['manolima', 'Bueno, vivente. Falei que te contava, com um trago na mão. A mão tá ocupada, então é agora.'],
      ['manolima', 'Eu e o teu vô tropeamos juntos muito inverno. Numa enchente, ele perdeu mula, perdeu erva, perdeu até a vontade de falar.'],
      ['manolima', 'Sentou na beira do rio e disse: “Mano, quando eu parar, vou abrir um lugar onde ninguém passe por isso sozinho.”'],
      ['manolima', 'Eu ri. O homem não tinha nem chapéu. Foi assim que nasceu o galpão.'],
      ['sadi', 'Ele nunca me contou isso.'],
      ['manolima', 'Contou o resto, que era mais fácil: perdia no truco de propósito, pra freguês voltar. Era ruim, mas nem tanto.']
    ],
    verso: [
      ['jayme', 'Dá licença, gente, que o pajador não aguenta mais ficar quieto.'],
      ['jayme', '“Quem cruzou este pampa inteiro / com a lança e o mate na mão / não volta só bodegueiro: / volta a casa de um irmão.”'],
      ['valter', 'Isso aí vale um trago, seu Jayme! E o primeiro é por conta da casa.'],
      ['padre_romio', 'Vale uma bênção também. Deus guarde esta casa, e quem chega nela com fome ou com medo.'],
      ['padre_romio', 'E guarde o Saci longe do meu vinho de missa.'],
      ['saci', 'Tarde demais, padre.']
    ],
    cuia: cuia ? [
      ['sadi', 'Espera. Tem uma coisa que tá faltando nessa roda.'],
      ['card', 'O Sadi entra na bodega e volta com a cuia de porongo do vô. Enche de erva, derrama a água e passa pra quem está do lado.<br><br><i>“Pra quem vier depois de mim: o mate é pra repartir.”</i>', 'A cuia do vô'],
      ['nair', 'Faz muito tempo que essa cuia não andava de mão em mão.'],
      ['bento', 'Mate bom. Quem fez?'],
      ['sadi', 'Um homem que perdeu ela num rio, presidente. E deu um jeito de ela voltar.']
    ] : [
      ['sadi', 'Essa roda tá precisando de um mate.'],
      ['card', 'Da mão do Sadi, a cuia sai andando em volta do fogo. Gaúcho, colono, alemão, guarani, encantado: todo mundo toma do mesmo jeito.', 'O mate'],
      ['nair', 'O teu vô fazia assim mesmo: primeiro os outros, ele por último.']
    ],
    viva: [
      ['anita', 'Giuseppe, deixa disso. Quem tem que dizer é ele.'],
      ['sadi', 'Eu? Eu sou da bodega.'],
      ['lanceiro', 'Por isso mesmo.'],
      ['sadi', 'Bom… Viva o Sul!']
    ],
    vo: [
      ['card', 'O fogo baixa. Um a um, o pessoal se despede e vai embora pela estrada. O Sadi fica sozinho, olhando a brasa.', 'Madrugada'],
      ['vo', 'Fogo bom. Tu pôs angico. Quem te ensinou?'],
      ['sadi', 'Vô?'],
      ['vo', 'Fala baixo, guri, que a vila já tá dormindo.'],
      ['vo', '“Sobe, que a bodega não abre sozinha.” Eu escrevi isso num bilhete, lá no fundo da caverna. Achei que tu ia chegar até ali, e olhe lá.'],
      ['vo', 'Nunca pensei que tu ia passar disso. Serra, mata, ilha, pampa. Lança na mão. Bandeira no mastro. Eu só queria que tu vendesse canha sem falir.'],
      ['sadi', 'Eu quase fali, vô. Duas vezes.'],
      ['vo', 'Eu sei. Eu vi. Do balcão a gente enxerga tudo.'],
      ['vo', 'Vou te dizer uma coisa que eu nunca disse pra ninguém, porque gaúcho velho não diz: eu tenho orgulho de ti, guri.'],
      ['vo', 'De ti e dessa gente toda que sentou hoje na minha grama. Era isso que eu queria quando abri o galpão. Olha só o tamanho.'],
      ['sadi', 'Tu fica?'],
      ['vo', 'Fico até clarear. Depois, tu sabe.'],
      ['sadi', 'A bodega não abre sozinha.'],
      ['vo', 'Esse é o meu neto.']
    ],
    fim: '<b>🔥 Raízes do Sul</b><br>Bento livre, a bandeira no mastro, os Lanceiros Negros em paz e a bodega de portas abertas.<br><br>A bodega continua aberta: freguesia, eventos, roça e o Rio Grande inteiro seguem te esperando.<br><br><b>Obrigado por jogar.</b>'
  };
}
function fogueiraConclui() {
  const st = pampaState(); st.fogueira = G.day; G.relics ??= {}; G.relics.bandeira = G.day; AudioEngine.sceneQuiet = false; save(); refreshHUD();
  const f = fogueiraFalas(); talk([['card', f.fim, 'Fim'], ['card', '<b>🚩 A bandeira farrapa</b><br>O Bento deixou a bandeira do Campo dos Menezes com o Sadi. Agora ela fica na prateleira de lembranças da sua casa.', 'Item raro'], ['card', '<b>🏠 Presentes pra casa</b><br>Quem veio pra roda deixou lembrança: a mesa campeira com chimarrão, a poltrona de couro com pelego, o cavalete com a sela e o laço, o tapete de lã e uma lança dos Lanceiros Negros. Já estão arrumados na sua casa: na estante de <b>Coleções e retratos</b> dá pra escolher o que fica à mostra.', 'Presentes']], null, 'Seguir jogando');
}
// O fogo grande da roda: o mesmo fogo dos acampamentos, bem maior, com labareda viva e fagulha subindo. Baixa conforme a noite passa.
function drawFogueiraGrande(x, y, k = 1, t = frameClock) {
  if (k > .25) {
    if (!worldSprite('rural', 6, x - 115, y - 158, 230, 180)) { ctx.save(); ctx.translate(x, y); ctx.scale(2.6, 2.6); ctx.translate(-x, -y); sceneFire(x, y); ctx.restore(); }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(x, y - 60, 170, .3 + .07 * Math.sin(t * 9) + .03 * Math.sin(t * 23), '255,150,60');
    for (let i = 0; i < 6; i++) { const f = ((t * (.9 + i * .13) + i * .31) % 1), fx = x + Math.sin(t * 7 + i * 1.9) * (20 - f * 12), fy = y - 44 - f * 96; ellipse(fx, fy, (20 - f * 15), (28 - f * 19), `rgba(255,${150 + i * 12},70,${.34 * (1 - f)})`); }
    for (let i = 0; i < 16; i++) { const f = ((t * (.22 + i * .018) + i * .37) % 1), sx = x + Math.sin(i * 2.3 + t * 1.1) * (22 + 70 * f), sy = y - 70 - f * 320; ctx.fillStyle = `rgba(255,${180 - f * 90},70,${(1 - f) * .85})`; ctx.fillRect(sx, sy, 3, 3); }
    ctx.restore(); return;
  }
  ellipse(x, y + 10, 104, 26, 'rgba(14,8,4,.5)');
  for (const [dx, a] of [[-44, .28], [40, -.34], [-8, .05], [18, .55], [-26, -.5]]) { ctx.save(); ctx.translate(x + dx, y - 6); ctx.rotate(a); rect(-58, -8, 116, 16, '#3a2414', 5, '#1a0e06'); ctx.restore(); }
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 8, 120, .22 + .05 * Math.sin(t * 3), '255,110,40'); for (let i = 0; i < 7; i++) ellipse(x - 48 + i * 16, y - 6 + (i % 2) * 6, 9, 5, `rgba(255,${100 + i * 12},40,${.5 + .4 * Math.sin(t * 2.6 + i * 1.4)})`); ctx.restore();
}
// A roda: quem fala fica mais perto do fogo, e ninguém fica atrás da parede da bodega. A frente fica aberta, pra ver o fogo.
const FOGUEIRA_ARVORE = { x: 1342, y: 1050 };
function fogueiraRoda(cx, cy) {
  const pos = (de, ate, i, n, rx, ry) => { const a = (de + (ate - de) * (n > 1 ? i / (n - 1) : .5)) * Math.PI / 180; const q = { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry }; if (Math.hypot(q.x - FOGUEIRA_ARVORE.x, (q.y - FOGUEIRA_ARVORE.y) * 1.4) < 150) q.x -= 170; return q; };
  const roda = [], f1 = FOGUEIRA_RODA.slice(0, 14), f2 = FOGUEIRA_RODA.slice(14), meio = Math.ceil(f2.length / 2);
  FOGUEIRA_FRENTE.forEach((id, i) => roda.push({ id, ...pos(125, 415, i, FOGUEIRA_FRENTE.length, 300, 125) }));
  f1.forEach((id, i) => roda.push({ id, ...pos(118, 422, i, f1.length, 490, 170) }));
  f2.slice(0, meio).forEach((id, i) => roda.push({ id, ...pos(112, 215, i, meio, 690, 250) }));
  f2.slice(meio).forEach((id, i) => roda.push({ id, ...pos(325, 428, i, f2.length - meio, 690, 250) }));
  return roda;
}
function fogueiraVo(a, y) { ctx.save(); ctx.filter = 'sepia(.55) brightness(1.1)'; drawVo(a.x, y, a.dx); ctx.restore(); const k = a.alpha ?? 1; ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(a.x, y - 80, 120, .16 * k, '255,220,160'); ctx.restore(); }
function fogueiraCena() {
  const cx = 1650, cy = 880, F = fogueiraFalas(), diz = l => l[0] === 'card' ? { overlay: 'note', text: l[1] } : { say: l[0], text: l[1] };
  const luz = { x: cx, y: cy - 40, r: 560, a: .26, color: '255,130,50' }, janelas = [[cx, 560, 190, .2], [cx - 250, 560, 130, .15], [cx + 250, 560, 130, .15]].map(([x, y, r, a]) => ({ x, y, r, a, color: '255,190,110' }));
  let fogo = 1, noite = .72, clareia = 0, som = 0; const sai = [], gente = fogueiraRoda(cx, cy);
  const props = layers => {
    luz.a = (.24 + .05 * Math.sin(frameClock * 9) + .02 * Math.sin(frameClock * 23)) * (.34 + fogo * .66); luz.r = 280 + 300 * fogo; if ((som -= 1 / 60) <= 0) { som = .12 + Math.random() * .5; AudioEngine.bus = AudioEngine.ambientBus; AudioEngine.pop?.(1500 + Math.random() * 1600, .012 + Math.random() * .016); AudioEngine.bus = null; }
    for (const a of sai) a.alpha = Math.max(0, (a.alpha ?? 1) - .012); if (clareia) { clareia = Math.min(1, clareia + .0022); if (scene?.world) scene.world.night = Math.max(.06, noite * (1 - clareia)); }
    layers.push({ y: cy, draw: () => drawFogueiraGrande(cx, cy, fogo) });
    if (clareia) layers.push({ y: 9e9, draw: () => rect(cx - 2400, cy - 1600, 4800, 3200, `rgba(255,178,110,${.13 * clareia})`) });
  };
  const atores = gente.map(q => ({ actor: q.id, x: q.x, y: q.y, dx: q.x < cx ? 1 : -1, ...(q.id === 'neto' ? { draw: (a, y) => pampaFigura('neto', a.x, y, a.dx, 1, a.alpha ?? 1) } : q.id === 'zeferino' ? { draw: (a, y) => drawZeferino(a.x, y, a.dx) } : {}) }));
  const pula = h => { for (const q of gente) { const a = scene.actors[q.id]; if (a) a.hop = h; } };
  playSteps([...sceneWorld({ map: 'vila', x: cx, y: cy - 330, night: noite, lights: [luz, ...janelas], props }),
    { actor: 'sadi', x: cx, y: 690, dx: 0, dy: 1, speed: 130 }, ...atores, { do: () => { AudioEngine.sceneQuiet = true; } }, { fade: 'in', time: 1.8 }, { do: () => AudioEngine.violaFogo?.(.024) }, { wait: 1.2 }, scenePan(cx, cy - 20, 75), { wait: 2.4 },
    { walk: 'sadi', to: { x: cx, y: 742 } }, { wait: 1 }, ...F.abre.map(diz), { do: () => { AudioEngine.glass?.(); } }, ...F.brinde.map(diz), { do: () => { AudioEngine.glass?.(); AudioEngine.vivas?.(.024); pula(4); } }, { wait: 1.4 }, { do: () => { pula(0); AudioEngine.violaFogo?.(.024); } },
    ...F.memorias.map(diz), ...F.mano.map(diz), { do: () => AudioEngine.violaFogo?.(.022) }, ...F.verso.map(diz), ...F.cuia.map(diz), ...F.viva.map(diz),
    { do: () => { AudioEngine.gritoFarrapo?.(.08); setTimeout(() => AudioEngine.vivas?.(.07), 500); sceneShout('Viva o Sul!', cx, cy - 300, '#ffe27a', 34); fxStars(cx, cy - 220, 16); pula(12); const s = scene.actors.sadi; if (s) s.hop = 12; golpeTreme = Math.max(golpeTreme, .12); } }, { wait: 2.8 },
    { do: () => AudioEngine.hinoFarrapo?.(.024) }, { wait: 5 }, { fade: 'out', time: 1.8 },
    { do: () => { fogo = .18; for (const q of gente) delete scene.actors[q.id]; const s = scene.actors.sadi; if (s) Object.assign(s, { x: cx - 120, y: cy + 100, dx: 1, dy: 0, hop: 0 }); noite = .76; Object.assign(scene.world, { night: noite, x: cx, y: cy + 60, lights: [luz] }); } }, { fade: 'in', time: 2 }, diz(F.vo[0]), { wait: 1.6 },
    { actor: 'vo', x: cx + 118, y: cy + 104, dx: -1, alpha: 0, draw: fogueiraVo }, { do: () => { let k = 0; const t = setInterval(() => { const a = scene?.actors?.vo; if (!a || ++k > 40) { clearInterval(t); return; } a.alpha = k / 40 * .86; }, 60); AudioEngine.heart?.(); } }, { wait: 2.8 },
    ...F.vo.slice(1, 9).map(diz), { do: () => { AudioEngine.despedida?.(.03); } }, ...F.vo.slice(9).map(diz), { do: () => { clareia = .001; AudioEngine.violaFogo?.(.02); } }, { wait: 3.5 }, { do: () => { const a = scene?.actors?.vo; if (a) sai.push(a); AudioEngine.queroquero?.(.02, 2); } }, { wait: 3 }, scenePan(cx, 720, 34), { wait: 3 }, { fade: 'out', time: 2.4 }, { caption: 'Raízes do Sul', time: 3 }], 'fogueira', () => { AudioEngine.sceneQuiet = false; fogueiraConclui(); });
}
function fogueiraComeca() {
  if (pampaState().fogueira) return; pampaState().fogueiraVista = G.day; keys.clear(); save();
  if (!scenesEnabled()) { const F = fogueiraFalas(); pampaTalk([...F.abre, ...F.brinde, ...F.memorias, ...F.mano, ...F.verso, ...F.cuia, ...F.viva, ...F.vo], fogueiraConclui, 'Boa noite'); return; }
  fogueiraCena();
}
function fogueiraPronta() { const st = G.pampa; return !!st?.republica && !st.fogueira && !st.fogueiraVista && missionActive('fogueira'); }
MISSIONS.push({ id: 'fogueira', title: 'A fogueira da libertação', giver: 'bento', side: true, where: 'Na frente da bodega',
  direct: () => startMission(MISSIONS.find(x => x.id === 'fogueira')),
  when: () => !!G.pampa?.republica && !G.pampa?.fogueira && missionDone('porongos') && !scene && !modal && !worldTalkOpen() && !paused,
  goal: () => 'Volte pra frente da bodega: o Bento mandou acender o fogo pra todo mundo', done: () => !!G.pampa?.fogueira, reward: { cash: 1500, xp: 500, rep: 10 }, outroBy: 'sadi',
  outro: ['Ficou brasa até de manhã. Agora é abrir as portas: a bodega não abre sozinha.'] });
{
  const tick = outsideTick; outsideTick = function (dt) {
    tick(dt); if (scene || modal || worldTalkOpen() || paused || worldOut?.map !== 'vila' || !fogueiraPronta()) return;
    const p = front(VILA.bodega, 70); if (Math.hypot(worldOut.x - p.x, worldOut.y - p.y) < 260) fogueiraComeca();
  };
  const shelf = lembrancas; lembrancas = function () { return G.relics?.bandeira ? [...shelf(), 'bandeira'] : shelf(); };
  const keep = window.drawLembranca;
  window.drawLembranca = function (id, x, y) { if (id !== 'bandeira') return keep(id, x, y); rect(x - 2, y - 56, 4, 56, '#5a3e22'); poly([[x + 2, y - 54], [x + 34, y - 54], [x + 2, y - 28]], '#2e7a3a'); poly([[x + 34, y - 54], [x + 2, y - 28], [x + 2, y - 22], [x + 34, y - 48]], '#c8302a'); poly([[x + 34, y - 48], [x + 2, y - 22], [x + 34, y - 22]], '#e8c030'); };
}
// A viola da noite: um dedilhado baixo e aberto, feito pro jogo.
Object.assign(AudioEngine, {
  violaFogo(vol = .024) { const nota = [147, 220, 294, 370, 440, 370, 294, 220, 165, 247, 330, 415, 494, 415, 330, 247, 196, 294, 392, 494, 587, 494, 392, 294, 147, 220, 294, 370, 440, 587, 440, 294]; nota.forEach((f, i) => { this.note(f, .7, 'triangle', vol * (i % 8 ? .72 : 1), i * .26); if (i % 8 === 0) this.note(f / 2, 1.6, 'sine', vol * .7, i * .26); }); }
});

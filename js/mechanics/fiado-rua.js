// Cobrar o fiado na rua: quem pendurou conta no caderninho anda pela Fronteira (um 📒 sobre a cabeça entrega). Chegando
// perto, o E vira "Cobrar o fiado": cara a cara, a pessoa paga, pede prazo ou inventa uma desculpa e sai correndo. Quem
// tem o cusco véio junto tem vantagem: o cachorro cerca o fujão e ele paga de vergonha. Um acerto por pessoa por dia.
'use strict';

const FIADO_RUA = { perDay: 2, hide: 2, fleeSpeed: 240 };
// Conta que dá pra cobrar hoje: anotada noutro dia, ainda aberta, sem cobrança hoje e sem o devedor ter fugido.
function fiadoRuaDebt(person) { return fiadoOpen().find(e => e.person === person && e.day < G.day && e.charged !== G.day && !(e.hideUntil > G.day)) || null; }
function fiadoRuaOdds(e) {
  const r = reliability(e.person), late = G.day - e.due, f = (G.friends[e.person] || 0) / 100;
  return { pay: clamp(.25 + r * .45 + (late > 0 ? .1 : 0) + f * .3, .2, .9), run: late >= 2 ? clamp((1 - r) * .55, .05, .4) : .05 };
}
function fiadoRuaName(i) { return PEOPLE[i].name.split(' ·')[0]; }
// Quem deve e pode andar hoje pela Fronteira (no máximo dois por dia, sempre os mesmos naquele dia).
function fiadoRuaWalkers() {
  const busy = activeUniqueVisitors(), inside = new Set([...(G.shop || []).map(c => c.person), ...(G.groups || []).flatMap(g => g.members || [])]);
  const people = [...new Set(fiadoOpen().map(e => e.person))].filter(i => fiadoRuaDebt(i) && !busy.has(i) && !inside.has(i) && !PEOPLE[i].removed);
  return people.sort((a, b) => dayHash(a, 41) - dayHash(b, 41)).slice(0, FIADO_RUA.perDay);
}
function fiadoRua(w) {
  const e = fiadoRuaDebt(w.person); if (!e) { worldTalk(w); return; }
  const i = e.person, name = fiadoRuaName(i), odds = fiadoRuaOdds(e), roll = Math.random(), ask = 'Ô, ' + name + '! E aquele fiado de ' + money(e.amount) + ' no caderninho?';
  e.charged = G.day; w.wait = 5; w.dx = worldOut.x > w.x ? 1 : -1; worldTalkAt = { x: w.x, y: w.y };
  const say = reply => showRpgBox('worldTalk', { person: i, name, player: ask, reply });
  if (roll < odds.pay) {
    settleFiado(e, e.amount); addFriendship(i, 1); AudioEngine.coins(); effect('+' + money(e.amount), w.x, w.y - 160, '#ffe27a', 18);
    say(pick(['Bah, é mesmo! Toma aqui, tudo certinho. Conta limpa é amizade comprida.', 'Tava contigo na cabeça, Sadi! Aqui, contado e dobrado.', 'Ainda bem que tu me achou, que o dinheiro tava louco pra sumir. Toma!']));
  } else if (roll < odds.pay + odds.run) {
    if (cuscoOut()) {
      // O cusco cerca o fujão: paga de vergonha.
      settleFiado(e, e.amount); AudioEngine.coins(); cuscoBarkSound(); effect('Au! Au!', cusco.x, cusco.y - 70, '#ffd2a0'); effect('+' + money(e.amount), w.x, w.y - 160, '#ffe27a', 18);
      say('Ih, deixei o feijão no fogo… Ai! Tá bom, tá bom, segura esse cusco! Toma o dinheiro!');
    } else {
      e.hideUntil = G.day + FIADO_RUA.hide; w.flee = { t: 0 }; AudioEngine.swoosh?.(.06);
      say(pick(['Ih, acho que deixei o feijão no fogo! Depois a gente se fala!', 'Opa, minha mulher tá me chamando lá em casa! Tchau, Sadi!', 'Bah, olha a hora! Tô atrasado pro… pro… tchau!']));
      floatNote(name + ' saiu correndo. Com o cusco véio junto, ele não escapava!');
    }
  } else {
    e.due = Math.max(e.due, G.day + 3);
    say(pick(['Semana que vem eu acerto, palavra de gaúcho!', 'Tá apertado, Sadi. Me dá uns dias que eu passo na bodega e pago tudo.', 'Juro que pago! Só espera a colheita.']));
  }
  save(); refreshHUD();
}

// O caderninho de fiado: capa marrom, folhas e o R$ da conta.
function drawFiadoCaderno(x, y) {
  ellipse(x, y + 22, 12, 4, '#1c140c44'); rect(x - 12, y - 14, 26, 32, '#f4ecd0', 3, '#5a3a20'); rect(x - 14, y - 16, 8, 36, '#8a4a24', 3, '#4a2a14');
  for (let k = 0; k < 3; k++) rect(x - 4, y - 6 + k * 8, 14, 2, '#c8b890', 1); txt('R$', x + 4, y - 8, 10, '#7a2a14', 'center', 'Arial', false);
}
// ---------- Ligações ----------
{
  // Os devedores entram na Fronteira como passantes (de dia e no começo da noite).
  const spawn = spawnWalkers; spawnWalkers = function (M) {
    spawn(M); if (M.id !== 'vila' || prologueActive() || lateNight() || !M.walkLines?.length) return;
    for (const i of fiadoRuaWalkers()) {
      if (worldWalkers.some(w => w.person === i)) continue;
      const line = pick(M.walkLines), seg = Math.floor(Math.random() * (line.length - 1)), k = Math.random(), a = line[seg], b = line[seg + 1];
      worldWalkers.push({ person: i, kind: 'debtor', line, seg, dir: 1, x: a[0] + (b[0] - a[0]) * k, y: a[1] + (b[1] - a[1]) * k, wait: Math.random() * 3, dx: 1, walk: false });
    }
  };
  // Quem deve: o E vira "Cobrar o fiado".
  const spots = walkerSpots; walkerSpots = function () {
    return spots().map(s => {
      const w = s.id.startsWith('walker:') && worldWalkers.find(x => 'walker:' + x.person === s.id), e = w && !w.flee && fiadoRuaDebt(w.person);
      return e ? { ...s, label: 'Cobrar o fiado · ' + fiadoRuaName(w.person) + ' (' + money(e.amount) + ')', act: () => fiadoRua(w) } : s;
    });
  };
  // Fujão: corre pra longe do Sadi e some.
  const tick = walkersTick; walkersTick = function (dt) {
    tick(dt);
    for (const w of worldWalkers) if (w.flee) {
      w.flee.t += dt; const d = Math.hypot(w.x - worldOut.x, w.y - worldOut.y) || 1, nx = w.x + (w.x - worldOut.x) / d * FIADO_RUA.fleeSpeed * dt, ny = w.y + (w.y - worldOut.y) / d * FIADO_RUA.fleeSpeed * dt;
      if (worldCanWalk(nx, w.y)) w.x = nx; if (worldCanWalk(w.x, ny)) w.y = ny; w.dx = w.x > worldOut.x ? 1 : -1; w.walk = true; w.wait = 0;
    }
    worldWalkers = worldWalkers.filter(w => !w.flee || w.flee.t < 3.5);
  };
  // O caderninho em cima da cabeça de quem deve.
  const land = worldLandscape; worldLandscape = function (M, seen, layers, view) {
    land(M, seen, layers, view); if (M.id !== 'vila') return;
    for (const w of worldWalkers) if (!w.flee && seen(w.x, w.y) && fiadoRuaDebt(w.person)) layers.push({ y: 1e7, draw: () => drawFiadoCaderno(w.x, w.y - 168 + Math.sin(frameClock * 3 + w.x) * 3) });
  };
  const panel = fiadoPanel; fiadoPanel = function () { return panel().replace('alguns somem.</p>', 'alguns somem. Quem deve às vezes anda pela Fronteira (📒 na cabeça): cara a cara, a cobrança rende mais.</p>'); };
}

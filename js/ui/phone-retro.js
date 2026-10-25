// Celular retrô do Sadi: o C abre um aparelho de teclas dos anos 2000, com antena, tela de LCD e teclado.
// A tela inicial é um menu de ícones em pixel (compras, missões, contatos, fiado, estética, álbum e progresso).
// Clicar no ícone, apertar o número (no teclado da tela ou no do computador) ou andar com as setas e confirmar
// abre o app; ◂, a tecla da esquerda ou Backspace voltam pro menu. Fechar o celular sempre volta pro menu.
'use strict';
const PHONE_PIXELS = {
  compras: ['............', '###.........', '..#.........', '..##########', '..#........#', '..#.#.#.#..#', '...#......#.', '...########.', '...#........', '...#########', '....##...##.', '....##...##.'],
  missoes: ['..########..', '.##########.', '.####..####.', '.####..####.', '.####..####.', '.####..####.', '.##########.', '.####..####.', '.##########.', '..########..', '....##......', '...#........'],
  contatos: ['....####....', '...######...', '...######...', '...######...', '....####....', '............', '..########..', '.##########.', '.##########.', '.##########.', '.##########.', '............'],
  fiado: ['..#.#.#.#...', '.##########.', '.#........#.', '.#.######.#.', '.#........#.', '.#.######.#.', '.#........#.', '.#.###....#.', '.#........#.', '.##########.', '............', '............'],
  estetica: ['............', '............', '############', '#..........#', '#.##.......#', '#.##.......#', '#.......#..#', '#......###.#', '#..#..######', '#.###.######', '############', '............'],
  album: ['.#########..', '.#.......###', '.#...#...#.#', '.#..###..#.#', '.#.#####.#.#', '.#..###..#.#', '.#..#.#..#.#', '.#.......#.#', '.#.......#.#', '.#########.#', '...#########', '............'],
  progresso: ['..########..', '############', '#.########.#', '#.########.#', '.##########.', '...######...', '....####....', '.....##.....', '.....##.....', '....####....', '...######...', '...######...'],
  melhorias: ['............', '..#######...', '.########...', '..#######...', '.....##.....', '.....##.....', '.....##.....', '.....##.....', '.....##.....', '.....##.....', '.....##.....', '............'],
  fone: ['.##########.', '############', '####....####', '####....####', '.###....###.']
};
const phonePixelSVG = new Map();
// Cada linha do desenho vira retângulos de um pixel de altura: fica nítido em qualquer tamanho.
function phonePixelIcon(name) {
  if (phonePixelSVG.has(name)) return phonePixelSVG.get(name);
  const rows = PHONE_PIXELS[name] || [], w = Math.max(1, ...rows.map(r => r.length)); let rects = '';
  rows.forEach((r, y) => { for (let x = 0; x < r.length;) { if (r[x] !== '#') { x++; continue; } let e = x; while (r[e] === '#') e++; rects += `<rect x="${x}" y="${y}" width="${e - x}" height="1"/>`; x = e; } });
  const svg = `<svg class="pixel-icon" viewBox="0 0 ${w} ${rows.length}" shape-rendering="crispEdges" fill="currentColor" aria-hidden="true">${rects}</svg>`;
  phonePixelSVG.set(name, svg); return svg;
}
const PHONE_APP_TITLES = { upgrades: 'Melhorias', supplier: 'Compras', missions: 'Missões', contacts: 'Contatos', fiado: 'Fiado', decor: 'Estética' };
let phoneSel = 0;
function phoneBeep(freq = 1400) { AudioEngine.note?.(freq, .05, 'square', .018); }
function phoneMenuButtons() { return [...document.querySelectorAll('#phoneMenu .phone-app')].filter(b => !b.classList.contains('hidden')); }
// O ícone escolhido fica em negativo, como nos menus dos celulares antigos.
function phoneMark(focus = true) {
  const list = phoneMenuButtons(); phoneSel = clamp(phoneSel, 0, Math.max(0, list.length - 1));
  list.forEach((b, i) => b.classList.toggle('sel', i === phoneSel)); if (focus) list[phoneSel]?.focus({ preventScroll: true });
}
function phoneHome() { phoneTab = 'home'; renderPhone(); phoneBeep(1000); phoneMark(); }
function phoneKey(k) {
  if (!phoneOpen) return;
  const home = phoneTab === 'home', list = phoneMenuButtons();
  if (/^[1-9]$/.test(k)) { const b = list[Number(k) - 1]; if (b) { phoneSel = Number(k) - 1; b.click(); } return; }
  if (k === 'end' || k === 'softR' || k === '#') { phoneBeep(700); togglePhone(false); return; }
  if (k === 'call') { action('tab', 'contacts'); return; }
  if (k === '*' || k === '0') { phoneHome(); return; }
  if (home) {
    if (k === 'ok' || k === 'softL') { list[phoneSel]?.click(); return; }
    const step = { left: -1, right: 1, up: -3, down: 3 }[k]; if (!step || !list.length) return;
    phoneSel = clamp(phoneSel + step, 0, list.length - 1); phoneBeep(1800); phoneMark(); return;
  }
  if (k === 'left' || k === 'softL') { phoneHome(); return; }
  if (k === 'up' || k === 'down') $('phoneContent')?.scrollBy({ top: k === 'up' ? -140 : 140, behavior: 'smooth' });
}
// Sinal e bateria: a mata e a caverna pegam mal; a bateria vai descendo ao longo do expediente.
function phoneSignal() { const m = worldOut?.map; return m === 'caverna' ? 0 : ['mata', 'trecho', 'laguna', 'navio'].includes(m) ? 1 : m === 'serra' ? 2 : m === 'sc' ? 3 : 4; }
function phoneBatteryLevel() { const f = G.phase === 'prep' ? 0 : clamp((G.elapsed || 0) / DAY, 0, 1); return clamp(3 - Math.floor(f * 3), 1, 3); }
function phoneText(id, text) { const el = $(id); if (el && el.textContent !== text) el.textContent = text; }
function phoneBadges() {
  const set = (id, text, needed = false) => { const b = document.querySelector(`#phoneMenu [data-act="tab"][data-id="${id}"]`); if (!b) return; const s = b.querySelector('small'); if (s && s.textContent !== text) s.textContent = text; b.classList.toggle('needed', needed); };
  try {
    const d = G.deliveries?.length || 0, m = Object.values(G.missions || {}).filter(x => x?.status === 'active').length, f = fiadoOpen().length;
    set('supplier', d ? d + ' a caminho' : '', tutorialStockMissing().length > 0);
    set('missions', m ? m + (m === 1 ? ' ativa' : ' ativas') : '');
    set('fiado', f ? f + ' em aberto' : '');
  } catch (_) {}
}
function phoneAppTile(act, icon, name, info, extra = '') { return `<button class="phone-app" data-act="${act}"><span>${phonePixelIcon(icon)}</span><b>${name}</b><small>${info}</small>${extra}</button>`; }
phoneShortcutsHTML = function () {
  const got = Object.keys(G.achievements || {}).length;
  return phoneAppTile('phoneAlbum', 'album', 'Álbum', cardsOwned() + '/' + CARDS.length, G.cardsNew ? '<span class="new">novo</span>' : '') + phoneAppTile('phoneGuide', 'progresso', 'Progresso', got + '/' + ACHIEVEMENTS.length);
};
{
  const render = renderPhone;
  renderPhone = function () {
    if (phoneTab !== 'home' && !PHONE_APP_TITLES[phoneTab]) phoneTab = 'home';
    render();
    const ph = $('phone'); if (!ph) return;
    const home = phoneTab === 'home'; ph.classList.toggle('home', home);
    phoneText('phoneTitle', home ? 'Menu' : PHONE_APP_TITLES[phoneTab]);
    phoneText('phoneSoftL', home ? 'Abrir' : 'Voltar');
    phoneText('phoneEvent', eventInfo().icon + ' Hoje: ' + eventInfo().name + '  ▸');
    phoneText('phoneClock', tutorialActive() || prologueActive() ? '--:--' : gameTimeText());
    phoneText('phoneOperator', 'SADI CEL · ' + (prologueActive() ? 'ROÇA DO VÔ' : 'DIA ' + dayNumber() + ' ' + calendar().name.slice(0, 3).toUpperCase()));
    const sig = 'phone-signal s' + phoneSignal(), bat = 'phone-battery b' + phoneBatteryLevel();
    if ($('phoneSignal').className !== sig) $('phoneSignal').className = sig;
    if ($('phoneBattery').className !== bat) $('phoneBattery').className = bat;
    for (const el of ph.querySelectorAll('[data-icon]:empty')) el.innerHTML = phonePixelIcon(el.dataset.icon);
    phoneBadges();
    phoneMenuButtons().forEach((b, i) => { if (b.dataset.num !== String(i + 1)) b.dataset.num = i + 1; });
    if (home) phoneMark(false);
  };
  const toggle = togglePhone;
  togglePhone = function (force) {
    const was = phoneOpen; toggle(force);
    if (was && !phoneOpen) phoneTab = 'home';
    if (!was && phoneOpen) { phoneBeep(1200); if (phoneTab === 'home') { phoneSel = 0; phoneMark(); } }
  };
  const act = action;
  action = function (name, id) {
    if (name === 'phoneKey') { phoneKey(id); return; }
    const r = act(name, id);
    if (name === 'tab' && phoneOpen) { phoneBeep(); const c = $('phoneContent'); if (c) c.scrollTop = 0; $('phone').querySelector('.phone-back')?.focus({ preventScroll: true }); }
    return r;
  };
  // Com o celular aberto, os números abrem os apps e as setas andam pelo menu (ou rolam o app aberto).
  document.addEventListener('keydown', e => {
    if (!phoneOpen || modal || ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target?.tagName)) return;
    const k = /^[1-9]$/.test(e.key) && !e.repeat ? e.key : { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', Backspace: 'left' }[e.key];
    if (!k) return; e.preventDefault(); e.stopImmediatePropagation(); phoneKey(k);
  }, true);
}

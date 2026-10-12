// Exportar e importar o save: baixa o jogo num arquivo .json e carrega de volta (outro navegador, outro computador ou
// depois de limpar os dados do navegador). O arquivo passa pela mesma checagem do jogo antes de valer.
'use strict';

function exportSave() {
  if (started) save();
  const mode = started ? saveMode() : false, raw = localStorage.getItem(saveKey(mode));
  if (!raw) { alert('Ainda não tem jogo salvo para baixar.'); return; }
  let day = 1; try { day = JSON.parse(raw).day || 1; } catch (_) {}
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([raw], { type: 'application/json' })), download: 'bodega-do-sadi-dia-' + day + '.json' });
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function importSave() {
  const input = Object.assign(document.createElement('input'), { type: 'file', accept: '.json,application/json' });
  input.onchange = () => { const f = input.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => loadSaveText(String(r.result)); r.readAsText(f); };
  input.click();
}
function loadSaveText(text) {
  let d = null; try { d = JSON.parse(text); } catch (_) {}
  if (!d || !Number.isFinite(d.cash) || !d.player || !Array.isArray(d.tables)) { alert('Esse arquivo não é um jogo salvo da bodega.'); return false; }
  if (!confirm('Carregar o jogo do dia ' + (d.day || '?') + '? Ele substitui o jogo salvo neste navegador.')) return false;
  const mode = d.testMode ? true : d.eventMode ? 'eventos' : false, key = saveKey(mode);
  if (started) showMainMenu();
  const old = localStorage.getItem(key); localStorage.setItem(key, text);
  if (!readSave(mode)) { if (old === null) localStorage.removeItem(key); else localStorage.setItem(key, old); alert('Não deu para ler esse jogo salvo: ele é de uma versão diferente da bodega.'); return false; }
  startGame(false, mode); return true;
}

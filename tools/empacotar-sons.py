"""Junta os sons gravados (assets/audio/sons/*.mp3) num só sons.js em base64.

Abrindo o jogo direto do arquivo (file://), o navegador não deixa o fetch ler os mp3; um <script> com os dados passa.
Rodar de novo sempre que um mp3 da pasta mudar."""
import base64, json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SONS = ROOT / 'assets' / 'audio' / 'sons'
data = {p.stem: base64.b64encode(p.read_bytes()).decode('ascii') for p in sorted(SONS.glob('*.mp3'))}
body = ',\n'.join(f'  {json.dumps(k)}: "{v}"' for k, v in data.items())
(SONS / 'sons.js').write_text('// Gerado por tools/empacotar-sons.py: os mp3 desta pasta em base64 (para tocar também em file://).\n'
                              'window.BODEGA_SONS = {\n' + body + '\n};\n', encoding='utf-8')
print(len(data), 'sons ·', round((SONS / 'sons.js').stat().st_size / 1024), 'KB')

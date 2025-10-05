from pathlib import Path
import sys
sys.stdout.reconfigure(encoding="utf-8")
text = Path('scripts/install-themes.js').read_text(encoding='utf-8')
start = text.index("name: 'sidebar-nav'")
print(text[start:start+400])

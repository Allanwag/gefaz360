# Gefaz360 — gestão da fazenda do talhão à xícara

ERP rural em arquivo único (HTML/CSS/JS, sem servidor): café, milho, soja, sorgo e trigo,
com pulverização (PVgest), pós-colheita de café, qualidade (COB/SCAA), financeiro,
RH/turmas, oficina, mapa de talhões (KML/KMZ) e ano-safra bienal com bienalidade do cafeeiro.

**Os dados ficam no navegador (localStorage) — a página ser pública não expõe nada.**

## Rotina de segurança dos dados

1. **Backup semanal:** Cadastros & Dados → *Exportar JSON (backup)*. Guarde o arquivo.
2. Fotos e PDFs de Documentos ficam fora do JSON (IndexedDB) — guarde os originais.
3. Use **uma aba** por vez (há sincronização entre abas, mas uma só evita confusão).

## Publicação (GitHub Pages)

1. GitHub Desktop → **File → Add local repository** → esta pasta (`Documents\gefaz360`).
2. **Publish repository** (desmarcar "Keep this code private" se quiser, tanto faz para os dados).
3. No site do GitHub: **Settings → Pages → Branch: `main` / `(root)` → Save**.
4. Em ~1 minuto: `https://allanwag.github.io/gefaz360/`.

# Matabuks — Samirismo

Painel React/Vite existente e publicado de Samira no Wild Rift. Preserve a identidade aprovada e as seções. Não recrie o projeto.

- Repo: https://github.com/fernandessilvasamuel50-art/matabucks.
- Produção: https://matabuks-samira-fernandessilvasamuel50-arts-projects.vercel.app.
- Vercel: prj_btJAZlLCRzqEuYLadb3E2CyjEar1, equipe team_QVBZXqHYuJyAgIL5yYOTszgb.
- **Dados oficiais atuais: data/baseline.json + Issues autenticadas do repo. Leia docs/CHATGPT_TRACKER.md antes de cadastrar ou corrigir partidas.**
- A conexão GitHub grava match/correction/checkpoint com marcador `<!-- matabuks:tracker:v1 -->`. Só registros de fernandessilvasamuel50-art são aceitos. Leia estado, evite duplicatas, grave, releia e confira /api/tracker após cache.
- Novas partidas não exigem arquivos, commits, push ou deploy. São eventos separados: não substitua todo o histórico.
- Global Config ecfg_baj0r0oupbp4pvcpg9mphdckmgwv, chave tracker, foi preservado para rollback. Não recebe novas partidas após migração; não mantenha dois históricos divergentes.
- A derrota 2026-10-30-6 já existe. Marcas **11** confirmadas pelo usuário foram registradas na Issue #1. Score 6356, -96, 5/6/3. Não duplicar.
- Depois dessa derrota houve cinco partidas novas no Global Config: foram preservadas nas Issues #3–#7. O checkpoint mais recente, Issue #8, é **6088 pontos, Mestre III, 8 marcas, 1011 partidas**. Não restaure 11 marcas como se ainda fosse o estado atual. O arquivo data/last-known.json é só a imagem de contingência do frontend, não o histórico de novas partidas.
- Campos ausentes continuam ausentes. Não invente conquistas, partidas intermediárias, horário ou marcas (escudos/bônus). Totais históricos de partidas/vitórias/derrotas são estimativas.
- Não exponha credenciais nem crie POST público sem autenticação. Ignore outros autores. /api/events exige sessão do proprietário e Origin; enquanto o OAuth não estiver configurado, a alternativa manual abre confirmação autenticada no GitHub. Leia docs/LOGIN.md; não declare login direto pronto sem teste real.
- Novos eventos revert/preferences permitem reversões auditáveis e preferências globais pelo ChatGPT. Correções devem incluir expected para detectar conflitos. Não sobrescreva todo o histórico. Consulte integration.audit/ignored/warnings após gravar.
- Prints locais passam por OCR conservador e revisão. Ausência de medalha não é confirmação de zero. Backup importado só gera plano de reconciliação; não restaure checkpoints antigos sobre novos.
- Não adicionar instalação/PWA, manifest ou service worker: o usuário excluiu essa opção. Preserve a fileira única de skins e a estrutura visual atual.
- Build/checks: npm ci, npm test, npm run build. Para frontend, confira desktop/celular, uma fileira de skins, rostos, modais e redução de movimento.
- O fonte está expandido. Não rode antigos scripts de reconstrução sobre ele.
- docs/ASSETS.md descreve medalhas e artes; docs/RECUPERACAO.md registra a recuperação original.

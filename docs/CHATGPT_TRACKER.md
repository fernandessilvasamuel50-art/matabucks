# ChatGPT → Matabuks: onde atualizar partidas

## Identificação rápida

- Repositório confirmado: https://github.com/fernandessilvasamuel50-art/matabucks.
- Proprietário autorizado: **fernandessilvasamuel50-art**.
- Site: https://matabuks-samira-fernandessilvasamuel50-arts-projects.vercel.app
- Vercel: projeto `matabuks-samira`, ID `prj_btJAZlLCRzqEuYLadb3E2CyjEar1`, equipe `team_QVBZXqHYuJyAgIL5yYOTszgb`.
- **Fonte oficial atual:** checkpoint histórico imutável em `data/baseline.json` + registros autenticados nas **Issues deste repositório**. A API compõe os dois, recalcula e remove duplicidades.
- **Integração de escrita: GitHub**, já testada. **Não edite arquivos, não faça commits e não faça deploy para cadastrar partidas.**
- Leitura pública do estado final: `GET /api/tracker`.
- Leitura autenticada: ferramenta GitHub `fetch` em `https://api.github.com/repos/fernandessilvasamuel50-art/matabucks/issues?state=all&per_page=100&sort=created&direction=asc`. Percorra as páginas de Link, inclua registros fechados e exclua pull requests.
- Escrita: **create_issue** neste repositório. Edição: **fetch_issue** e **update_issue**.

## Migração e checkpoint

O Global Config `ecfg_baj0r0oupbp4pvcpg9mphdckmgwv`, chave `tracker`, continua preservado para rollback. Nesta sessão a operação de itens rejeitou o ID válido antes da requisição: `INVALID_ARGUMENT`, padrão `^ecfg_`. A falha não é corrigida trocando IDs ou aumentando permissões.

O checkpoint foi conservado integralmente em `data/baseline.json`: 6356 pontos, 1006 partidas, 507 vitórias, 499 derrotas e seis partidas detalhadas. A correção confirmada para **11 marcas** está na **Issue #1**. Nenhuma partida foi criada para corrigir marcas.

Antes do deploy final, a fonte original já continha cinco partidas posteriores. Elas foram importadas fielmente nas Issues **#3–#7**, mantendo seus IDs originais; o checkpoint **#8** preserva o estado mais recente: **6088 pontos, Mestre III, 8 marcas, 1011 partidas, 508 vitórias, 503 derrotas, WR estimado 50,2%**. As 11 marcas são uma correção histórica, não o estado atual depois dessas cinco partidas. `data/last-known.json` é apenas a última imagem de contingência do frontend; não é uma segunda fonte para novas partidas.

Após esta migração, **não escreva novas partidas no Global Config**. Não há sincronização com Google Sheets. Não mantenha duas fontes concorrentes.

## Formato

O corpo contém o marcador literal `<!-- matabuks:tracker:v1 -->`, seguido por um bloco cercado com três crases e linguagem `json`. Dentro dele, um objeto com `schema:"matabuks/v1"`, `kind`, `id` estável e os campos do tipo. A função `issueBody(event)` em `lib/tracker.js` gera esse formato.

Somente Issues criadas pela conta proprietária são aceitas; outros autores, PRs e dados inválidos são ignorados. Os registros são públicos, assim como o painel. Nunca inclua credenciais ou dados privados de outros jogadores.

Tipos: `match`, `correction`, `checkpoint`, `revert`, `preferences` e `probe`. O último é técnico e nunca altera estatísticas.

Para `match`, o campo `match` tem obrigatoriamente `date` (YYYY-MM-DD, data do registro) e `result` (Vitória ou Derrota). Opcionais:

- `k,d,a`: inteiros não negativos, os três juntos.
- `delta`: variação assinada; `scoreAfter`: score final confirmado.
- `marksAfter`: marcas finais confirmadas; não deduza por resultado, por causa de escudos/bônus.
- `mvp:true`, `svp:true`, `rank:"S"` ou `rank:"A"`, `legendaryS:true`.
- `triplekills,quadrakills,pentakills`: quantidades confirmadas. Duas pentas = `pentakills:2`. Uma penta não significa uma triple adicional.
- `gold,performanceScore,teamScore` (ex.: 30-33), `nickname,champion,mode`.

Desconhecidos ficam ausentes, não zero/false. MVP exige vitória e SVP exige derrota. S/A e multikills podem coexistir com MVP/SVP.

## Procedimento idempotente por print

1. Leia a API e as Issues, incluindo fechadas. Confira conta e campeão; imagens de referência não são partidas.
2. Extraia somente fatos visíveis/confirmados. Não invente horário.
3. Procure o ID oficial, se disponível, e os IDs existentes. Compare data, resultado, KDA, delta, score final, ouro e placar. **A derrota 2026-10-30-6, 5/6/3, -96, score 6356 já existe no baseline. Não cadastrar novamente.**
4. Use um ID estável com caracteres `[A-Za-z0-9_.:/-]`. O formulário usa `matchId(match)`. Reutilize o ID em repetição; se a evidência não distingue duas partidas legítimas, peça esclarecimento.
5. Crie uma Issue com título `[tracker] ...`, marcador e bloco JSON válido. A conexão deve publicar como fernandessilvasamuel50-art.
6. Releia para confirmar autor, corpo, ID e campos. Em gravação com resposta incerta, leia antes de repetir.
7. O servidor acrescenta sem substituir o histórico. Deduplica por ID e pela assinatura conhecida (data/resultado/KDA/delta/score final). Recalcula partidas, vitórias, derrotas, WR e conquistas comprovadas.
8. Confira a API após cache: 180 segundos mais a consulta do navegador a cada 30 segundos. Normalmente leva alguns minutos. Não use deploy para atualizar dados.
9. Confirme um único registro, score, marcas e totais pertinentes antes de comunicar sucesso.

Se `scoreAfter` divergir de score anterior + delta, a pontuação final confirmada prevalece e `integration.warnings` pede reconciliação. Não invente partidas intermediárias. Sem pontos conhecidos, conta-se a partida e conserva-se o score anterior, com variação desconhecida.

## Exemplos e correções

Correção real já aplicada na Issue #1:

```json
{"schema":"matabuks/v1","kind":"checkpoint","id":"confirmed-marks-2026-10-30-match-6","updates":{"marks":11}}
```

Exemplo de formato de partida usando a derrota **já registrada** (não criar novamente):

```json
{"schema":"matabuks/v1","kind":"match","id":"2026-10-30-6","match":{"date":"2026-10-30","result":"Derrota","k":5,"d":6,"a":3,"delta":-96,"scoreAfter":6356,"gold":14548,"performanceScore":268,"teamScore":"30-33"}}
```

Uma correção usa `kind:"correction"`, ID próprio, `targetId` da partida e `patch` só com os campos confirmados. Inclua `expected` com os campos conhecidos da partida lida imediatamente antes (sem id/sourceIssue). A API rejeita/aponta correções concorrentes quando a versão anterior não corresponde. Use `unset:["mvp"]`, por exemplo, para remover uma conquista atribuída indevidamente e voltar a desconhecido. Não remova date/result; remova k/d/a juntos. A partida continua a mesma e o total não aumenta. Prefira novos eventos auditáveis a editar registros anteriores. Fechar uma Issue **não** a remove do tracker.

Conquista desconhecida numa partida do baseline pode já estar no total histórico: a API pede reconciliação sem somar às cegas. Correção de pontos do baseline exige confirmar o checkpoint atual. Correções em partidas posteriores recalculam sua contribuição sem duplicar.

Checkpoint aceita `marks,score,top200Cutoff,top200CutoffDate,laneLevel,elo` confirmados. A data do corte só deve ser preenchida se conhecida; a data de uma partida não confirma a data do ranking. Não deduza promoção de elo somente por marcas.

Reverter uma alteração, sem apagar o registro nem as partidas posteriores:

```json
{"schema":"matabuks/v1","kind":"revert","id":"revert:ID-UNICO","targetEventId":"ID-DO-EVENTO-ANTERIOR"}
```

Uma nova reversão pode apontar para a reversão anterior para restaurar o efeito. Baseline não é removido por reversão: corrija suas partidas com correction. Checkpoints posteriores continuam prevalecendo. Após reverter pontos antigos, confira warnings e reconcilie o checkpoint atual antes de anunciar os totais.

Preferências globais que o próprio ChatGPT pode atualizar sem deploy:

```json
{"schema":"matabuks/v1","kind":"preferences","id":"preferences:ID-UNICO","updates":{"heroSkin":"original","effects":"subtle","lightweight":false}}
```

Skins aceitas: original, psyops, velho-oeste, soul-fighter, cromatizadora, curtindo-verao, guerreira-cinzas, celulas-supremas. Efeitos: full/subtle/off. Preferências locais de um dispositivo prevalecem sobre as globais; Aparência permite voltar ao padrão. Atualizações de dados e preferências não mudam código/layout. Novas funcionalidades e mudanças de frontend continuam exigindo commit/build/deploy.

## Concorrência e estimativas

Cada evento é uma Issue separada: duas escritas não sobrescrevem um JSON compartilhado nem apagam partidas anteriores. A composição usa ordem do número da Issue e deduplica IDs. Cadastre lotes na ordem cronológica confirmada.

1006 partidas, 507 vitórias, 499 derrotas e 50,4% vieram de um baseline estimado por taxa arredondada. Novas partidas são contadas exatamente, mas o total permanece identificado como estimativa. Não calcule KDA vitalício com o histórico parcial. SVPs e quadras contam confirmados desde a migração, sem inventar um total vitalício.

## Segurança e disponibilidade

`GET /api/tracker` continua público e somente leitura. `POST /api/events` exige sessão autenticada do proprietário, cookie HttpOnly criptografado e verificação de Origin. Nunca funciona como rota anônima de escrita. O frontend não recebe token GitHub. O login opcional usa Auth.js e valida o ID GitHub estável 234553185, além do login. Sessão de até 8 horas, state/PKCE e revalidação do usuário no GitHub antes de cada escrita. Cada gravação relê o diário, valida/deduplica, cria uma Issue individual e a relê antes de confirmar.

**Estado de ativação:** o login direto depende do OAuth do aplicativo, distinto da integração GitHub do ChatGPT. `GET /api/events` informa configured/authenticated; configured:false significa que o caminho direto não está habilitado. Enquanto isso, Registrar partida prepara a prévia e mantém confirmação autenticada no GitHub ou envio ao ChatGPT. Não declare o login direto concluído sem consentimento OAuth e teste real. Consulte LOGIN.md para a configuração pendente, sem pedir tokens no chat.

Pela conexão ChatGPT, create_issue continua realizando a escrita, independentemente do login do site. Leia integration.audit e warnings: uma correção persistida com ignored:true não foi aplicada e deve ser reconciliada. A interface só marca Publicado após identificar o evento na leitura do painel.

Prints são lidos localmente com Tesseract.js. Até quatro imagens da MESMA partida podem ser combinadas. Campos conflitantes ficam vazios; listas com vários KDAs não selecionam um jogador automaticamente. Medalhas sempre precisam de confirmação humana. Nenhuma imagem de referência de elo/skin é uma partida. A leitura assistida local não substitui a interpretação completa do ChatGPT e nunca grava sem revisão.

Backups: Exportar e recuperar gera JSON com snapshot, eventos e SHA-256 (integridade, não assinatura de autoria), ou CSV das partidas. Importar um backup apenas confere e prepara reconciliação; não substitui automaticamente o estado. Leia a API atual, compare IDs, restaure somente eventos realmente ausentes, em ordem, e preserve checkpoints posteriores. Se houver divergência, peça confirmação do checkpoint final em vez de inventar partidas. Dados importados só entram por escrita autenticada do proprietário.

O repo público permite leitura server-side sem token. Runtime Cache reduz chamadas; entre reconciliações completas a API busca somente Issues alteradas, preservando os registros anteriores. Há releitura completa a cada seis horas. Se GitHub estiver indisponível ou limitar leitura, a API retorna a última leitura válida com `integration.stale:true` e respeita um intervalo antes de tentar de novo; sem leitura válida retorna 503. O frontend preserva os últimos dados e sinaliza a falha. Não declare sucesso com estado antigo. Cache é efêmero; persistência é GitHub. Paginação incompleta falha explicitamente, sem cortar histórico.

Se a conexão estiver indisponível, use o formulário manual autenticado ou aguarde reconexão. Não peça tokens, não substitua baseline, não volte a gravar silenciosamente no Global Config. Tornar o repo privado exige configurar leitura autenticada antes.

## Prova de escrita

A Issue **#2** é um probe técnico reversível, sem partida fictícia. A prévia Vercel `dpl_4DsLfMnGSXLZpGbyTgk7wzg62Kww` confirmou `probeActive:true` com as estatísticas preservadas. O registro foi revertido para `active:false`, fechado e relido pela conexão GitHub. A conferência final da API publicada é registrada no relatório de manutenção.

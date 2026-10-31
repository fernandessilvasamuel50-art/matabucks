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

Após esta migração, **não escreva novas partidas no Global Config**. Não há sincronização com Google Sheets. Não mantenha duas fontes concorrentes.

## Formato

O corpo contém o marcador literal `<!-- matabuks:tracker:v1 -->`, seguido por um bloco cercado com três crases e linguagem `json`. Dentro dele, um objeto com `schema:"matabuks/v1"`, `kind`, `id` estável e os campos do tipo. A função `issueBody(event)` em `lib/tracker.js` gera esse formato.

Somente Issues criadas pela conta proprietária são aceitas; outros autores, PRs e dados inválidos são ignorados. Os registros são públicos, assim como o painel. Nunca inclua credenciais ou dados privados de outros jogadores.

Tipos: `match`, `correction`, `checkpoint` e `probe`. O último é técnico e nunca altera estatísticas.

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

Uma correção usa `kind:"correction"`, ID próprio, `targetId` da partida e `patch` só com os campos confirmados. Também se pode editar a Issue original com update_issue, preservando seu ID. A partida continua a mesma e o total não aumenta. Fechar uma Issue **não** a remove do tracker.

Conquista desconhecida numa partida do baseline pode já estar no total histórico: a API pede reconciliação sem somar às cegas. Correção de pontos do baseline exige confirmar o checkpoint atual. Correções em partidas posteriores recalculam sua contribuição sem duplicar.

Checkpoint aceita `marks,score,top200Cutoff,laneLevel,elo` confirmados. Não deduza promoção de elo somente por marcas.

## Concorrência e estimativas

Cada evento é uma Issue separada: duas escritas não sobrescrevem um JSON compartilhado nem apagam partidas anteriores. A composição usa ordem do número da Issue e deduplica IDs. Cadastre lotes na ordem cronológica confirmada.

1006 partidas, 507 vitórias, 499 derrotas e 50,4% vieram de um baseline estimado por taxa arredondada. Novas partidas são contadas exatamente, mas o total permanece identificado como estimativa. Não calcule KDA vitalício com o histórico parcial. SVPs e quadras contam confirmados desde a migração, sem inventar um total vitalício.

## Segurança e disponibilidade

Não há POST público de gravação. GitHub autentica e controla escrita; nenhum token é exposto ao navegador. O formulário **Registrar partida** prepara dados, valida, mostra prévia e abre uma Issue preenchida. O usuário precisa confirmar Create/Submit issue no GitHub com a conta proprietária. Fechar sem publicar não salva. Pela conexão ChatGPT, create_issue faz essa etapa.

O repo público permite leitura server-side sem token. Runtime Cache reduz chamadas. Se GitHub estiver indisponível ou limitar leitura, a API retorna a última leitura válida com `integration.stale:true`; sem leitura válida retorna 503. O frontend preserva os últimos dados e sinaliza a falha. Não declare sucesso com estado antigo. Cache é efêmero; persistência é GitHub. Paginação incompleta falha explicitamente, sem cortar histórico.

Se a conexão estiver indisponível, use o formulário manual autenticado ou aguarde reconexão. Não peça tokens, não substitua baseline, não volte a gravar silenciosamente no Global Config. Tornar o repo privado exige configurar leitura autenticada antes.

## Prova de escrita

A Issue **#2** é um probe técnico reversível, sem partida fictícia. A leitura local confirmou `probeActive:true`, score 6356, marcas 11 e 1006 partidas. Reverta para `active:false`, releia e confira a API de produção para concluir o teste. O relatório final de manutenção registra o resultado.

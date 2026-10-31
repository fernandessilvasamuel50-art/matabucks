# Atualizações do Matabuks pelo ChatGPT

## Localização

- Projeto: Matabuks — Samirismo.
- Produção: https://matabuks-samira-fernandessilvasamuel50-arts-projects.vercel.app
- Projeto Vercel: `matabuks-samira`, ID `prj_btJAZlLCRzqEuYLadb3E2CyjEar1`.
- Equipe Vercel: `team_QVBZXqHYuJyAgIL5yYOTszgb`.
- Repositório: consulte o remoto Git `origin`. O deploy original era direto, sem vínculo GitHub. O destino remoto ainda depende de um repositório acessível; não invente uma URL.
- Fonte oficial de dados: **Global Config**, ID `ecfg_baj0r0oupbp4pvcpg9mphdckmgwv`, chave **`tracker`**.
- A API `GET /api/tracker` usa `get("tracker")` de `@vercel/global-config`. O código recuperado não lê Google Sheets; não presuma sincronização com uma planilha.
- O React consulta a API ao abrir e a cada 30 segundos. A API usa cache compartilhado de 5 segundos e stale-while-revalidate de 30 segundos.

## Ferramentas autenticadas

Use a integração **Vercel**, mantendo os IDs de configuração e equipe acima.

Leitura: `get_edge_config_items({edgeConfigId, teamId})`; selecione o valor do item `tracker`. A leitura pública em `/api/tracker` é útil para conferir a publicação, mas pode ter cache.

Escrita: `patch_edge_config_items({edgeConfigId, teamId, requestBody:{items:[{operation:"upsert",key:"tracker",value:trackerCompleto}]}})`.

**`upsert` substitui o valor inteiro da chave.** Primeiro leia, preserve os campos existentes e mescle o histórico completo. Nunca envie apenas a nova partida como valor de `tracker`.

Essas ferramentas usam a autenticação da integração; não precisam de tokens na conversa, no frontend ou no GitHub. Não existe rota pública de escrita nesta aplicação.

## Estado verificado em 30/10/2026

`GET /api/tracker` retornou HTTP 200 com `version:3`, `score:6356`, `previousScore:6452`, `lastDelta:-96`, `marks:12`. O registro `2026-10-30-6` já existe: derrota, KDA 5/6/3, ouro 14548, desempenho 268, placar 30-33. **Não o cadastre novamente.**

O usuário confirmou escrita bem-sucedida em outra conversa do ChatGPT. Nesta sessão Codex, leitura dos itens e escrita foram rejeitadas **antes da requisição**, com `INVALID_ARGUMENT`, padrão `^ecfg_`, apesar do ID válido. O teste temporário não foi criado. Não anuncie escrita comprovada nesta sessão nem tente outro ID.

## Estrutura

`tracker` contém checkpoint (`score`, `previousScore`, `lastDelta`, `updatedAt`, `version`), ranking, totais históricos e `history`, em ordem do mais recente para o mais antigo.

Uma partida confirmada existente:

```json
{
  "id": "2026-10-30-6",
  "date": "2026-10-30",
  "result": "Derrota",
  "k": 5, "d": 6, "a": 3,
  "delta": -96,
  "scoreAfter": 6356,
  "teamScore": "30-33",
  "gold": 14548,
  "performanceScore": 268
}
```

Obrigatórios para uma partida deste fluxo: `id` estável, `date` do registro e `result` confirmado (`Vitória` ou `Derrota`). Para alterar o Champion Score, exija `scoreAfter` confirmado ou `delta` confirmado com checkpoint anterior confiável. Quando KDA for conhecido, registre `k`, `d`, `a` juntos como inteiros não negativos. Sem evidência, omita os campos ou preserve `null`; não use zero para representar desconhecido.

Opcionais: `delta`, `scoreAfter`, `k`, `d`, `a`, `teamScore`, `gold`, `performanceScore`, `mvp`, `triplekills`, `quadrakills`, `pentakills`, `rank`, `nickname`, `champion`, horário e identificador oficial da partida quando disponíveis. Campos novos devem ser compatíveis com os existentes.

## Procedimento idempotente

1. Leia o item atual e guarde uma cópia transitória. Confirme projeto e equipe.
2. Extraia apenas os fatos comprovados no print ou confirmados pelo usuário. Data de registro não é automaticamente horário da partida.
3. Procure primeiro o identificador oficial; depois o `id` existente. Compare também data, resultado, KDA, variação, pontuação final, ouro e placar. O exemplo acima já registrado deve resultar em nenhuma escrita.
4. Se não houver ID oficial, atribua um ID local estável após ler os IDs existentes. Não gere novo ID em uma repetição da mesma atualização. Duas partidas reais podem ter o mesmo KDA; se a evidência não distinguir, peça esclarecimento antes de gravar.
5. Acrescente o novo registro preservando todos os anteriores e os campos desconhecidos do tracker. Para uma correção, altere o mesmo registro, sem acrescentar cópia.
6. Atualize o checkpoint de pontos. Exemplo já aplicado: 6452 - 96 = 6356. Se o score final confirmado divergir do esperado, mantenha esse score como referência e registre a diferença para reconciliação; não invente partidas intermediárias.
7. Atualize somente totais sustentados pelos dados. Partidas/vitórias/derrotas históricos (1006/507/499) e WR 50,4% são estimativas derivadas de uma taxa inicial arredondada, não números oficiais da Riot. O histórico parcial não permite recalcular KDA vitalício. Não altere marcas sem confirmação; 12 é o último valor informado antes da derrota.
8. Releia imediatamente antes de escrever. Se o conteúdo mudou, refaça a mesclagem sobre a versão nova. Grave o objeto completo usando `upsert`.
9. Releia pela integração e confira registro, quantidade de ocorrências, todos os IDs anteriores, score e campos preservados. Em timeout de gravação, leia antes de tentar novamente.
10. Consulte `/api/tracker` até refletir o estado atual, respeitando cache e atualização do frontend. Confira faixa e últimas partidas. Informe resultado e eventuais pendências ao usuário.

## Conquistas e correções

- Registre `mvp:true` ou contagens de triples/quadras/pentas somente com prova. Ausência de prova não significa `false` ou zero.
- Preserve os totais históricos confirmados e o baseline. Some apenas conquistas novas e comprovadas. Ao corrigir um registro, aplique a diferença entre a conquista antiga conhecida e a nova; repetir a correção não pode somar de novo.
- `triplekillsConfirmedSinceBaseline` representa triplas confirmadas desde o início do acompanhamento. Não é total vitalício.
- O frontend atual mostra um destaque por partida, com precedência penta, triple, MVP e rank. `quadrakills` pode ser armazenado, mas não tem destaque próprio implementado. Não prometa renderização que não existe.
- Uma correção retroativa de score não deve reescrever o checkpoint atual sem reconciliar registros posteriores. Preserve evidências e peça os dados faltantes.

## Concorrência e indisponibilidade

O Global Config é persistente e independente dos deploys. Porém a ferramenta atual substitui a chave inteira e **não expõe comparação de versão/digest na escrita**. A releitura reduz conflitos, mas não torna a operação atômica. Execute um único escritor por vez; não atualize simultaneamente em chats diferentes. `version` é informativo, não um bloqueio.

Se precisar de escrita simultânea com garantia, será necessária uma operação autenticada de compare-and-swap ou outra solução que serialize alterações. Essa garantia não foi implementada nesta manutenção de cabeçalho. Não restaure um snapshot antigo sobre dados mais novos.

Se a ferramenta estiver indisponível, preserve o registro proposto sem aplicá-lo, confira a API e explique o erro. Reabra/reconecte a integração Vercel pela interface do usuário e tente ler novamente; as ferramentas de gerenciamento disponíveis nesta sessão não oferecem reinicialização/reconexão. Não desinstale a conexão como tentativa automática e não peça tokens. Aumentar permissões não corrige uma falha de validação de esquema.

Teste seguro de escrita, quando a ferramenta voltar: crie uma chave temporária exclusiva fora de `tracker`, leia para confirmar, remova só essa chave e leia para confirmar a remoção. Compare `tracker` antes e depois. Nunca crie uma partida fictícia ou altere estatísticas reais para testar acesso.

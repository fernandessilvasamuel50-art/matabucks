# Matabuks — Samirismo

Código do painel existente, recuperado da Vercel. React 18, Vite, Motion e Lucide; sem migração ou recriação da aplicação.

```sh
npm ci
npm run dev
npm run build
```

O fonte já está expandido e contém os ajustes de emblemas, marcas, retratos, favicon e rota da versão de produção `dpl_JAfV8vFBPzyJsyao286TeFhPCzi3`. O antigo build reconstruía arquivos usando 17 partes e `patch.cjs`; o build atual compila diretamente os mesmos arquivos, permitindo manutenção pelo Git. Imagens estão incluídas em `public/img`; não precisam ser baixadas de outro deploy durante o build.

Dados reais são lidos em `/api/tracker` no ambiente Vercel, combinando `data/baseline.json` com os eventos autenticados nas Issues deste repositório. A integração GitHub do ChatGPT cria registros sem commits/deploys por partida. O Global Config original foi preservado para rollback; não recebe novos registros depois da migração. O servidor Vite isolado não executa funções Vercel; para validar a atualização real, use uma implantação com a API. Não copie credenciais para o frontend.

Consulte [docs/CHATGPT_TRACKER.md](docs/CHATGPT_TRACKER.md) para partidas e [docs/RECUPERACAO.md](docs/RECUPERACAO.md) para a origem e verificação do código. Novas partidas não exigem commit ou deploy.

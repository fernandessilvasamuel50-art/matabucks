# Login direto do proprietário

O caminho ChatGPT → conexão GitHub → Issues → /api/tracker já funciona sem credenciais novas. O login no próprio site é um segundo caminho, opcional, com implementação preparada e bloqueada por padrão quando falta configuração.

## Dependência externa ainda necessária

Na inspeção da equipe/project Vercel não havia conectores Vercel Connect e nenhuma credencial OAuth para este aplicativo. A integração GitHub do ChatGPT não fornece seu token nem um client_id/client_secret para o site. Ela deve continuar sendo usada diretamente pelo ChatGPT; não extraia credenciais do gerenciador Git do computador para reaproveitá-las no site.

Para ativar o caminho implementado, o proprietário precisa cadastrar/autorizar um OAuth App dedicado no GitHub, com homepage da produção e callback:

https://matabuks-samira-fernandessilvasamuel50-arts-projects.vercel.app/api/auth/callback/github

Depois configurar no ambiente **production** do projeto Vercel existente:

- AUTH_GITHUB_ID: identificador público desse aplicativo.
- AUTH_GITHUB_SECRET: segredo do aplicativo, somente no armazenamento criptografado da Vercel.
- AUTH_SECRET: valor aleatório forte, gerado para o aplicativo e mantido somente no servidor.
- AUTH_ORIGIN: URL canônica acima, sem barra final.

Use o painel/conexões oficiais para configurar os valores; não os cole no chat ou em arquivos versionados. `.env.example` contém apenas os nomes. Um novo deploy é necessário para ativar configuração de código/autenticação; partidas posteriores continuam sem deploy.

O fluxo Auth.js solicita read:user e public_repo para criar Issues no repositório público. O escopo public_repo também cobre outros repositórios públicos do titular: essa abrangência deve estar clara no consentimento. Se desejar escopo limitado a um só repositório, migre este login para GitHub App/Vercel Connect devidamente instalado, preservando a mesma validação e diário. Não tente simular uma credencial ou copiar client_id de um app alheio.

## Validação obrigatória após configurar

1. Abrir a URL canônica, entrar pelo GitHub e confirmar a conta proprietária.
2. GET /api/events deve retornar configured:true e authenticated:true, sem tokens.
3. Testar uma gravação técnica probe:true, reler a Issue e /api/tracker, depois probe:false e reler. Não criar partidas fictícias.
4. POST anônimo deve ser 401; Origin externo deve ser 403; conta diferente deve falhar no login.
5. Conferir confirmação de persistência e sincronização do painel antes de afirmar que o login direto está pronto.

O token do provedor fica no JWT criptografado de cookie HttpOnly/Secure/SameSite da sessão Auth.js. A resposta pública de sessão contém apenas o nome da conta. O token é usado somente no servidor; jamais em localStorage, JSON de backup ou JavaScript público.

Referências: https://authjs.dev/reference/core e https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps.

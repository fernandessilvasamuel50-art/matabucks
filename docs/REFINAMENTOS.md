# Refinamentos de 31/10/2026

O projeto existente foi preservado. Nenhuma recriação, migração de framework ou segunda base de partidas.

## Entregue

- Asas e aros de Mestre/Grão-Mestre restaurados das referências, em WebP transparente responsivo. Prompt e origem em ASSETS.md.
- Histórico com filtros por resultado, conquistas e datas; detalhes, fonte original e correções sem cadastrar outra partida.
- Eventos de reversão auditáveis, inclusive reversão da reversão; checkpoints posteriores preservados. Proteção contra correções concorrentes baseada na versão esperada.
- Sessão de hoje/último dia, gráficos de Champion Score e marcas em séries separadas, janelas 7/30 dias/histórico, desempenho nas últimas 10/20/50 partidas e recordes com abertura da partida de origem.
- Projeção Top 200 condicionada a amostra suficiente e saldo positivo; cenário ilustrativo separado. Corte sem data confirmada é identificado como tal.
- Upload de até quatro prints da mesma partida, OCR local carregado sob demanda, combinação conservadora de campos e revisão obrigatória. Vários KDAs/confiança baixa/conflitos não viram fatos confirmados. Medalhas não são inferidas pelo texto OCR.
- Cartões PNG de partida/sessão com escolha das informações; JSON com checksum, CSV e conferência de arquivo para reconciliação pelo ChatGPT.
- Aparência por dispositivo, skin do cabeçalho, efeitos suaves/desligados e modo leve. Preferências globais também podem ser publicadas pelo ChatGPT.
- Mobile validado em 320/390/768 px e desktop. Skins continuam em uma fileira. Nenhum manifest, service worker ou opção de instalação/PWA.
- Acesso do ChatGPT mantido pela conexão GitHub, sem commit/deploy para dados. Teste reversível repetido na Issue #2, sem partidas fictícias.

## Pendente de ativação externa

O login proprietário e POST autenticado estão implementados, mas **não habilitados em produção** sem OAuth dedicado. Não há conector Vercel Connect nem credenciais OAuth existentes para este aplicativo. A integração GitHub do ChatGPT não compartilha seus segredos com o site. Consulte LOGIN.md. Enquanto isso, o formulário conserva a confirmação autenticada no GitHub e o envio ao ChatGPT.

Recuperar backup prepara uma reconciliação segura, sem sobrescrever o histórico de forma automática. OCR local é assistência conservadora de texto; enviar prints ao ChatGPT continua sendo o caminho para interpretação completa da tela.

## Validação

23 testes de domínio, diário, autenticação, correções concorrentes, reversões, estatísticas, OCR ambíguo e backups. Build Vite concluído. npm audit sem vulnerabilidades após corrigir a dependência transitiva Zod. Navegador: filtros, gráfico sem marcas inventadas, bloqueio de duplicação, edição sem alteração vazia, OCR com imagem de histórico, cartão PNG baixado, backup exportado e reimportado com zero eventos ausentes, modo leve e larguras responsivas.

Estado real preservado durante os testes: 6088 pontos, Mestre III, 8 marcas, 1011 partidas estimadas, 11 partidas detalhadas. Leituras futuras da API têm precedência sobre este registro histórico.

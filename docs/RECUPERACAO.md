# Proveniência do fonte

- Projeto Vercel original: `prj_btJAZlLCRzqEuYLadb3E2CyjEar1`.
- Deployment indicado pelo usuário: `dpl_EWxB2QmStGDs66YknN7spSbV8zUV`.
- Versão mais recente verificada antes da manutenção: `dpl_JAfV8vFBPzyJsyao286TeFhPCzi3`.
- As 17 partes `part-000` até `part-016` foram recuperadas integralmente, com SHA-1 validado contra os IDs de arquivo da Vercel. A concatenação ordenada recuperou `src.jsx`, `style.css`, `index.html` e o avatar.
- O último deployment contém também `patch.cjs`, `bootstrap.cjs` e `asset-pack.tar.gz`. O leitor direto truncava esses arquivos; um build de prévia no mesmo projeto os exportou em linhas curtas dos logs autenticados, sem publicar o fonte no site e sem mudar o domínio de produção.
- Hashes SHA-1 conferidos: bootstrap `3ca0f68bcf569615c35f019f624eef38a8941581`; patch `a01d50188f126f9ecc0bb5595ec79cfb0f13349a`; imagens `b08393637b2242b38c7b1d4ee68840b1a3893d1e`.
- A reconstrução original e a aplicação do patch foram executadas sem modificações. As oito skins foram recuperadas da produção; as seis imagens WebP vieram do pacote original.
- Antes de editar, o build do fonte expandido gerou os mesmos bundles de produção: `index-CLu_b9z6.js` (298293 bytes) e `index-D-GLaWFJ.css` (24757 bytes). A comparação SHA-256 dos conteúdos é registrada na verificação local.
- O ZIP `matabuks-deployment-original.zip`, entregue junto desta manutenção, conserva os arquivos originalmente enviados à versão mais recente. Esses arquivos não contêm configuração de escrita nem credenciais.

## Correção do cabeçalho

O CSS original usava `/img/hero-samira.jpg`, arquivo ausente. A manutenção troca essa referência pela arte já existente `/img/samira-original.jpg` e enquadra a imagem na região esquerda e central do banner. Os elementos de título, sombra, classificação e Rota do Dragão e todas as outras seções foram preservados.

## Limites conhecidos

Na recuperação inicial, a integração GitHub não oferecia criação de repositório. O usuário posteriormente forneceu `fernandessilvasamuel50-art/matabucks`, confirmado e autorizado; o código recuperado foi enviado a esse remoto. A escrita Global Config continuou bloqueada por validação do conector. A manutenção posterior adotou um checkpoint preservado e eventos autenticados nas Issues do mesmo GitHub, conforme `CHATGPT_TRACKER.md`; o Global Config original permanece preservado para rollback.

# Gefaz360 — gestão da fazenda do talhão à xícara

ERP rural estático para café, milho, soja, sorgo e trigo, com pulverização (PVgest),
pós-colheita e qualidade do café (COB/SCAA), financeiro, RH/turmas, oficina,
documentos, mapas KML/KMZ/GeoJSON e ano-safra bienal.

O app é composto por `index.html`, `app.css` e `app.js`. Não exige servidor de
aplicação: os registros ficam no `localStorage` do navegador e os anexos no
IndexedDB do mesmo navegador/perfil.

## Ordens de serviço operacionais

A aba **Ordens de serviço** cobre o ciclo operacional completo: planejamento,
atribuição de responsável, prioridade, prazo, talhão e máquina; início, pausa,
retomada, conclusão ou cancelamento; progresso físico, realizado, checklist e
histórico de apontamentos. As OS podem ser filtradas por situação, aparecem nos
alertas da visão geral e, quando vinculadas, integram a Oficina e a linha do tempo
do talhão. Ordens antigas de manutenção são migradas automaticamente sem perder
descrição, máquina, peças ou mão de obra.

## Segurança e recuperação

1. Em **Cadastros & Dados**, use **Exportar backup completo**. O JSON inclui
   registros, fotos e PDFs disponíveis no navegador.
2. Se algum anexo estiver ausente, o arquivo recebe `-incompleto` no nome e o app
   mantém um aviso visível. Não trate esse arquivo como cópia integral.
3. Importações, exclusões e ações críticas criam um ponto de recuperação local.
   Alterações normais também exibem **Desfazer** imediatamente após a gravação.
4. Mantenha cópias do backup em outro dispositivo. Armazenamento do navegador pode
   ser apagado pelo usuário, por políticas corporativas ou por limpeza automática.
5. O app não envia os registros a um servidor, mas quem tiver acesso ao mesmo
   perfil do navegador poderá lê-los. Para dados reais, proteja o dispositivo e o
   perfil do sistema operacional.

Importações validam todos os anexos antes da gravação e usam novos identificadores
para preservar os arquivos atuais. Documentos excluídos e anexos substituídos
permanecem no IndexedDB para permitir recuperação mesmo após fechar a aba.
Essa retenção consome espaço: nesta versão, não há limpeza automática desses
arquivos. O backup exporta somente os documentos do banco ativo.

Se o banco existente não puder ser lido, o aplicativo bloqueia novos lançamentos
e abre a tela **Recuperar dados**, com opções para baixar o conteúdo original,
importar um backup válido ou restaurar o ponto de recuperação. A recuperação
preserva uma cópia do conteúdo ilegível na chave `pvgest-erp-v1-unread` antes da
substituição. Uma falha de armazenamento impede a substituição.

Medições já acertadas ou consolidadas ficam bloqueadas para edição e exclusão,
pois seus valores já foram transferidos ao financeiro ou à colheita. Confira-as
antes de processar; o desfazer imediato permite voltar à etapa anterior. Esta
versão não oferece estorno de acertos antigos.

## Executar localmente

Sirva a pasta por HTTP; abrir o HTML diretamente com `file://` pode limitar APIs do
navegador. Qualquer servidor estático funciona, por exemplo:

```bash
npx serve .
```

## Testes

Os testes não têm dependências externas:

```bash
npm test
```

Além da suíte automatizada, valide no navegador os fluxos de OS, backup/importação,
documentos, baixa financeira, venda por lote e mapa antes de publicar.

## Publicação

No GitHub Pages, selecione a branch `main` e a pasta raiz. A metatag CSP e as
proteções no código funcionam no Pages, mas o GitHub Pages não aplica o arquivo
`_headers`. Para cabeçalhos HTTP como `X-Frame-Options`, CSP em header e
`Permissions-Policy`, publique a mesma pasta em um host estático compatível com
`_headers` (por exemplo, Cloudflare Pages ou Netlify).

Consulte [SECURITY.md](SECURITY.md) antes de colocar dados reais em produção.

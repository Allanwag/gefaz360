# Segurança do Gefaz360

## Modelo de dados

O Gefaz360 é local-first. Registros ficam no `localStorage`; fotos e PDFs ficam no
IndexedDB. Não há autenticação nem sincronização remota. Portanto, o isolamento
depende do dispositivo e do perfil do navegador.

## Controles implementados

- Content Security Policy, política de referenciador e bloqueio de execução em
  frames de terceiros;
- validação de tipos, limites, referências e versões na importação de backups;
- anexos restritos a imagens/PDF, até 20 MB cada e 200 MB por backup;
- limites para KML/KMZ/GeoJSON e expansão de arquivos compactados;
- confirmação, ponto de recuperação e desfazer para mutações críticas;
- lançamentos financeiros derivados são gerenciados pelo registro de origem;
- saída de texto e atributos gerados a partir de dados são escapados.

## Limites conhecidos de hospedagem

O GitHub Pages não permite configurar cabeçalhos HTTP personalizados. A CSP também
é declarada por `<meta>`, e o bloqueio de frame é complementado em JavaScript. Para
produção, prefira um host que aplique `_headers` ou configure equivalentes no CDN.

## Relato de vulnerabilidades

Não publique dados, backups ou anexos numa issue. Envie ao mantenedor apenas passos
de reprodução e um arquivo de teste sem informações reais.

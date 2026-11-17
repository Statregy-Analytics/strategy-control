# Picomatch: mitigação temporária verificada

Em 17/11/2026, o advisory GHSA-fc5q-39xc-vjpf afeta todas as versões publicadas de picomatch até 4.0.7. Não existe release corrigida no registro consultado.

O postinstall aplica uma proteção conservadora ao parser: recusa padrões com `+(...)` ou `*(...)` antes de gerar uma expressão regular. Isso elimina os extglobs repetidos usados no vetor reportado, inclusive as variantes `+(*)` e `+(*a)`. Os demais globs comuns do build continuam testados. Padrões repetidos, mesmo quando seguros ou escapados, passam a ser recusados: limitação deliberada desta mitigação, não mudança no produto.

A versão fica fixada em 4.0.7. O script verifica SHA-256 do arquivo original e do corrigido e recusa código diferente. Instalação limpa foi testada fora do checkout que mantém os servidores locais.

`npm run audit:security` continua executando `npm audit --audit-level=high --json` para a árvore inteira. O relatório original ainda contém o advisory: não alegamos que o registry considera o pacote corrigido. O gate só aceita esse advisory exato e seus efeitos transitivos quando versão, caminho instalado, intervalo afetado, SHA-256 corrigido e regressões em subprocesso com timeout passam. Novos advisories altos/críticos, fonte alterada, outra cópia do pacote, mudança de intervalo, erro de rede ou relatório inconsistente bloqueiam. Moderados seguem o mesmo limiar anterior do workflow.

Não há `continue-on-error`, `--omit=dev`, redução de severidade nem auditoria desativada. Os testes cobrem padrões vulneráveis, globs usuais, alteração do código instalado, alerta novo e falha de relatório.

## Remoção

Quando houver uma versão oficial corrigida, remover conjuntamente o override, o postinstall, a mitigação e a política específica, atualizar o lockfile, restaurar o gate direto de npm audit e executar instalação limpa, lint, testes e build. Não atualizar a versão ou os hashes apenas para fazer o CI passar.

Fonte oficial: https://github.com/advisories/GHSA-fc5q-39xc-vjpf

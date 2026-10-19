# Perfil administrativo — edição por seção, 19/10/2026

Referência: Figma Admin, arquivo `i2jizg7UtPyg3KjAOvuFtI`, C24 `1930:281`. Escopo: QA 11, 12, 13 e 15. O desenho define a interface; endpoints não acrescentam campos nem ações.

## Implementação

- Removido Editar global. Lápis nos cinco blocos previstos; uma seção por vez.
- Campos permanecem no mesmo lugar, inclusive os documentos e dados pessoais sem escrita disponível. Profissional/financeiro mantém os cinco campos; vigência, moeda e flags obrigatórias são preservadas sem novos controles.
- Salvar só habilita após mudança. Descartar e sair/trocar cliente com rascunho pedem confirmação; Continuar editando preserva o formulário. Escrita bloqueia controles e navegação.
- Erro no topo e no campo; renda familiar menor que individual usa a mensagem do Figma. Sucesso temporário “Alterações salvas”. Falha parcial mantém rascunho e informa que parte já foi salva; repetição não reenvia operações já confirmadas.
- Preferências usam as ações do cabeçalho, preservando o país retornado pela API. Outros consumidores do componente continuam usando o comportamento anterior.
- Escritas usam o transporte existente de autenticação/idempotência. Respostas antigas não reabrem edição após trocar cliente/sair.

## Limites da integração

| Bloco | Disponível | Dependência do backend |
| --- | --- | --- |
| Identificação | Nome principal, nascimento, contatos e endereço existente com país. Coleções secundárias e seus metadados são preservados. | Não há escrita correspondente para documentos tipados, estado civil, nacionalidade, filiação, bairro ou preferência de contato. Permanecem visíveis e somente leitura. Sem país no endereço, não se inventa um cadastro novo. |
| Profissional/financeiro | Profissão, empresa e três valores do Figma. | Exige metadados de vigência/moeda já retornados. Ausência gera erro, sem defaults fictícios. Perfil financeiro é versionado pelo endpoint existente. |
| Segurança | Nome exibido do usuário vinculado, quando confirmado com a consulta administrativa. | Senha, 2FA, status e sessões não têm operação de edição confirmada neste fluxo; continuam somente leitura. Nenhuma credencial é alterada. |
| Compliance | Descrição de um alerta principal já existente, preservando classificação/status. | Sem alerta existente, o lápis fica indisponível. Falta contrato próprio para observações livres; não se cria flag arbitrária para contornar. |

Esses limites impedem considerar todos os campos do desenho integralmente homologados.

## Validação

- Admin local em 8080, API de homologação, cadastro fictício Jane Austin Doe. Profissão/empresa/rendas mantêm a composição original. Empresa alterada e restaurada; renda familiar 12.000 → 12.001 → 12.000 aceita pela API. Valores originais restaurados; o histórico registra as versões de teste.
- Renda familiar inválida mostra erro no topo/campo sem escrita. Uma seção bloqueia os demais lápis; salvar sem mudanças fica desabilitado. Confirmação de descarte e saída com preferências alteradas mantém o rascunho ao continuar editando.
- Preferência de tema Claro → Escuro → Claro e complemento de endereço Apto 45 → Apto 45 QA → Apto 45 salvos e restaurados pela tela; país mantido sem campo adicional. Segurança abriu com o nome correto e os demais campos somente leitura; encerrada sem escrita. Cláudio abriu com Empresa Teste e renda familiar 18.000, com Salvar desabilitado antes de mudanças.
- Revisão visual desktop e celular 390 px: campos no mesmo bloco e sem transbordamento (343/343 px na coluna principal). Ícones de edição locais carregaram em 16 × 16 px.
- Testes automatizados cobrem estado, concorrência, falhas parciais, repetição, preservação de zeros/nulos, metadados, coleções secundárias e ausência de documentos sensíveis nos payloads.
- Não foram realizadas transações financeiras, aprovações documentais, alterações de senha, 2FA ou permissões.

O restante do QA permanece conforme a matriz de triagem; esta rodada não aprova todo o Marco 3.

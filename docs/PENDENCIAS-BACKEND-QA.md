# Pendências do backend para homologação

A interface segue o Figma. Precisamos dos estados e operações abaixo sem acrescentar campos ou ações às telas.

## Aprovação de documentos e edição do perfil

O front de Aprovar/Reprovar documentos está integrado conforme C27–C28. Falta confirmar:

- Aprovar o documento do cadastro remove a pendência e libera a edição do perfil?
- Como consultar o estado da revisão cadastral, a data de envio e a permissão de edição, para apresentar C26 corretamente?
- Na reprovação, motivo e mensagem chegam ao cliente e permitem reenvio? Hoje enviamos os dois juntos em `notes`, pois esse é o contrato disponível.
- Qual é o catálogo de motivos de reprovação? O front usa apenas “Foto ilegível”, confirmado no Figma.

Confirmar também os defaults do cliente novo em C25: risco sem classificação, compliance pendente, status Prospect e preferências do sistema. O front preserva os valores reais retornados e não simula desbloqueio ou classificação.

Referência: [Figma C25 a C28](https://www.figma.com/design/i2jizg7UtPyg3KjAOvuFtI/S.A?node-id=1932-281). Evidências técnicas e limites em [Aprovação de documentos](QA-2026-10-19-APROVACAO-DOCUMENTOS.md).

## Edição dos campos existentes no perfil

- Confirmar escrita para documentos tipados, estado civil, nacionalidade, filiação, bairro e preferência de contato que já aparecem no desenho. Os campos sem operação confirmada permanecem somente leitura.
- Definir edição das observações de compliance sem obrigar a criação de um alerta. Hoje só é possível alterar a descrição de um alerta existente.
- Confirmar as operações previstas para segurança e sessões. O front não altera senha, 2FA ou status por meio de endpoints de outro domínio.

Detalhamento: [Edição por seção](QA-2026-10-19-EDICAO-POR-SECAO.md).

## Contratos e carteira

- Corrigir ou esclarecer o contrato encerrado do Cláudio ainda incluído no saldo investido. Na conferência de 19/10, a API retornou R$ 261.500,00 investidos e R$ 286.500,00 no total; o front não desconta valores por conta própria.
- Disponibilizar valor base, atual e bloqueado por participante para os campos do Figma. Capital e saldo do contrato inteiro não substituem o saldo do cliente.

Evidências: [Carteira e extrato](QA-2026-10-19-CARTEIRA-VAZIA.md) e [Devolutiva do Marco 3](MARCO-3-DEVOLUTIVA-BACKEND.md).

## Cadastro e autenticação

- Garantir unicidade do e-mail usado como login e revisar as duplicidades apontadas pelo QA.
- Definir o contrato de sessão com cookies HttpOnly para Admin e portal: login, refresh, logout, CORS e proteção CSRF. Essa proteção exige suporte do servidor/BFF.
- Investigar o incidente de identidade relatado em 17/10 às 18:16. As proteções adicionadas ao front não encerram a análise da causa.

Referência e contexto: [Triagem do QA](QA-2026-10-17-TRIAGEM.md).

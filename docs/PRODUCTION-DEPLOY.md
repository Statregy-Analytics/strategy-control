# Deploy de produção

O deploy de produção é executado pelo GitHub Actions após cada push na branch
`main`. Também pode ser iniciado manualmente pela aba **Actions**.

O workflow valida o projeto, gera a SPA e envia os arquivos por SSH para uma
pasta identificada pelo SHA do commit. Ao final, o link simbólico `current` é
trocado de forma atômica para a nova release.

## Configuração no GitHub

Crie o environment `production` em **Settings > Environments** e restrinja o
deploy à branch `main`. Cadastre nele os secrets:

- `SSH_HOST`: hostname ou IP do servidor;
- `SSH_USER`: usuário de deploy sem acesso administrativo;
- `SSH_PORT`: porta SSH, normalmente `22`;
- `SSH_DEPLOY_PATH`: diretório absoluto dedicado ao frontend, sem `/` no final;
- `SSH_PRIVATE_KEY`: chave privada exclusiva do GitHub Actions;
- `SSH_KNOWN_HOSTS`: chave pública do host no formato de `known_hosts`.

Se a API de produção não usar a URL padrão da aplicação, crie também a variável
de environment `VITE_API_URL`.

As credenciais FTP antigas não são utilizadas neste workflow.

## Configuração no servidor

1. Instale `rsync` e mantenha o servidor SSH ativo.
2. Crie um usuário exclusivo para deploy e adicione a chave pública correspondente
   ao `SSH_PRIVATE_KEY` em seu `authorized_keys`.
3. Dê a esse usuário permissão de escrita somente em `SSH_DEPLOY_PATH`.
4. Configure o document root do Nginx/Apache para
   `SSH_DEPLOY_PATH/current`.
5. Como a aplicação usa Vue Router em modo history, direcione rotas não
   encontradas para `index.html`.

Exemplo para Nginx:

```nginx
root /caminho/do/frontend/current;

location / {
    try_files $uri $uri/ /index.html;
}
```

Para obter `SSH_KNOWN_HOSTS`, execute `ssh-keyscan` a partir de uma máquina
confiável e confira a fingerprint com a informada pelo provedor antes de salvar
o resultado no GitHub. Não faça essa descoberta automaticamente durante o
deploy, pois isso removeria a validação da identidade do servidor.

## Rollback

As releases anteriores permanecem em `SSH_DEPLOY_PATH/releases`. Para voltar a
uma delas, atualize o link simbólico no servidor:

```bash
ln -sfn /caminho/do/frontend/releases/COMMIT_SHA /caminho/do/frontend/current.next
mv -Tf /caminho/do/frontend/current.next /caminho/do/frontend/current
```

Depois de confirmar que uma release está estável, releases antigas podem ser
removidas manualmente conforme a política de retenção do servidor.

# Strategy Administração (strategy-admin)

Gerenciamento da strategy analytics

## Install the dependencies
```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```


### Lint the files
```bash
yarn lint
# or
npm run lint
```


### Format the files
```bash
yarn format
# or
npm run format
```


### Build the app for production
```bash
quasar build
```

### Deploy de produção

Cada push na branch `main` dispara validação, build e deploy atômico por SSH.
Consulte [docs/PRODUCTION-DEPLOY.md](docs/PRODUCTION-DEPLOY.md) para configurar
o servidor e os secrets do environment `production` no GitHub.

### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).

# strategy-control — instruções de desenvolvimento

Este diretório contém o projeto completo (backend + frontend) e scripts para facilitar o desenvolvimento local com Docker.

Sumário:

- Backend: `backend/README.md` (instruções de desenvolvimento, uso do `./scripts/dev_up`, troubleshooting de `node_modules`)
- Frontend: `frontend/README.md`

Iniciar ambiente de desenvolvimento (backend + frontend):

```bash
# do diretório raiz (admin)
./scripts/dev_up
```

Se encontrar erro do tipo "Cannot find module 'joi'" dentro do container do backend, veja a seção "Desenvolvimento com Docker (script `dev_up`)" em `backend/README.md` — ela explica a causa (bind-mount sobrescrevendo node_modules) e traz comandos úteis para resolução.

---

Para detalhes dos serviços, abra:

- backend: `backend/README.md`
- frontend: `frontend/README.md`

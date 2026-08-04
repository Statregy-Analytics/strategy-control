import { api } from 'src/boot/axios'

// Workspace padrão (seed). Sobrescreva via parâmetro quando necessário.
export const DEFAULT_WORKSPACE_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'

// Roles disponíveis na API (ver docs/Api/seed.sql)
export const USER_ROLES = {
  ADMIN: 'Admin',
  OPERADOR: 'Operador',
  CLIENTE: 'Cliente',
  SYSTEM: 'System',
}

export const USER_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
}

/**
 * Cria um usuário (rota administrativa).
 * Endpoint: POST /api/v1/admin/users
 *
 * @param {{ name: string, email: string, password: string, status?: string,
 *           workspaceId?: string|null, roles?: string[] }} payload
 * @returns {Promise<object>}
 */
export async function createUser({
  name,
  email,
  password,
  status = USER_STATUS.ACTIVE,
  workspaceId = DEFAULT_WORKSPACE_ID,
  roles = [USER_ROLES.CLIENTE],
}) {
  const { data } = await api.post('/api/v1/admin/users', {
    name,
    email,
    password,
    status,
    workspaceId,
    roles,
  })
  return data?.data ?? data
}

/**
 * Atalho para criar um usuário com a role "Cliente" — para acesso à área do cliente
 * (separada do administrador).
 *
 * @param {{ name: string, email: string, password: string, workspaceId?: string|null }} payload
 * @returns {Promise<object>}
 */
export async function createClientUser({ name, email, password, workspaceId = DEFAULT_WORKSPACE_ID }) {
  return createUser({
    name,
    email,
    password,
    status: USER_STATUS.ACTIVE,
    workspaceId,
    roles: [USER_ROLES.CLIENTE],
  })
}

/**
 * Lista usuários com paginação/filtros.
 * Endpoint: GET /api/v1/admin/users
 *
 * @param {{ page?: number, pageSize?: number, workspaceId?: string, status?: string,
 *           role?: string, search?: string }} [params]
 * @returns {Promise<object>} resposta paginada { pagination, data, ... }
 */
export async function listUsers(params = {}) {
  const { data } = await api.get('/api/v1/admin/users', { params })
  return data
}

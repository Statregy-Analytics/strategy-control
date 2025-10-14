import { api } from 'src/boot/axios'

export default function useAdvisorsApi() {
  const list = async () => {
    const res = await api.get('/advisors')
    return res.data
  }
  const get = async (id) => {
    const res = await api.get(`/advisors/${id}`)
    return res.data
  }
  const create = async (payload) => {
    const res = await api.post('/advisors', payload)
    return res.data
  }
  const update = async (id, payload) => {
    const res = await api.put(`/advisors/${id}`, payload)
    return res.data
  }
  const remove = async (id) => {
    await api.delete(`/advisors/${id}`)
    return true
  }

  return { list, get, create, update, remove }
}

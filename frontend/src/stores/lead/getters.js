import useCliente from 'src/composables/Fakes/useCliente'
const { getClientIdName } = useCliente()
const getters = {
  clientSelected: (state) => {
    return getClientIdName(state.compare)
  },
}
export default { ...getters }

const getters = {
  clientSelected: (state) => state.compare.map((item) => ({
    id: item.id,
    name: item.primaryName,
  })),
}

export default { ...getters }

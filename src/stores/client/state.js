const state = () => ({
  data: [],
  loading: false,
  pagination: {
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  },
  compare: [],
  selectId: [],
})

export default state

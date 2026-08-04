const state = () => {
  return {
    authenticated: null,
    selectedInitial: null,
    auth: {
      conectetion: null,
      token: null,
      validateToken: null,
    },
    user: null,
    passwordReset: null,
    finished: null,
  }
}

export default state

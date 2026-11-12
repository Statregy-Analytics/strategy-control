// A transport/rate-limit failure does not prove that credentials expired.
export const isAuthenticationFailure = (error) => [401, 403].includes(error?.response?.status)

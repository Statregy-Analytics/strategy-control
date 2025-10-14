const app = require('./app')

const port = process.env.PORT || 3333
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port} (USE_FAKES=${process.env.USE_FAKES})`)
})

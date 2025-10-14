import { boot } from 'quasar/wrappers'
import filtersString from './filtersString.js'
export default boot(({ app }) => {
  app.config.globalProperties.$filtersString = filtersString
})

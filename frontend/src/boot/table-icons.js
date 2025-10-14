import { boot } from 'quasar/wrappers'
import * as TablerIcons from '@tabler/icons-vue'

export default boot(({ app }) => {
  for (const [key, component] of Object.entries(TablerIcons)) {
    app.component(key, component)
  }
})

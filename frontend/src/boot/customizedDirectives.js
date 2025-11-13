import { currencyMask } from '../directives/currencyMask'
import { selectPlaceholder } from 'src/directives/SelectPlaceholder'

export default ({ app }) => {
  app.directive('currency-mask', currencyMask)
  app.directive('select-placeholder', selectPlaceholder)
}

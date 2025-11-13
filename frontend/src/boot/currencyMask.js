import { currencyMask } from '../directives/currencyMask'

export default ({ app }) => {
  app.directive('currency-mask', currencyMask)
}

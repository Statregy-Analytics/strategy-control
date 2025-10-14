import { useQuasar, QSpinner, QSpinnerComment, QSpinnerInfinity } from 'quasar'

export default function useNotification() {
  const $q = useQuasar()
  const time = 2500
  const actions = { icon: 'close', 'aria-label': 'Dismiss', color: 'dark' }
  const pos = 'bottom'
  const ParttensLoading = {
    message: 'Carregando.. Por favor, aguarde...',
    boxClass: 'bg-transparent',
    spinnerColor: 'primary',
    spinner: QSpinner,
  }
  const spinners = {
    commnet: QSpinnerComment,
    pattern: QSpinner,
    infinity: QSpinnerInfinity,
  }
  /**
   *
   * @param {string|null} message mensagem da notificação a ser ixibida se estiver null vai
   * exibir mensagem padrão "Tudo certo!"
   * @param {number|null} getTime quantos segundos vai aparece a notificações se for passaro $time
   * @return {$q.notify}
   */
  const successNotify = (message, getTime = time, positionNot = pos) => {
    $q.notify({
      position: positionNot,
      message: message || 'Tudo certo!',
      icon: 'check_circle',
      iconColor: 'green-4',
      iconSize: '16px',
      timeout: getTime,
      classes: 'notify-success',
    })
  }
  /**
   *
   * @param {string|null} message mensagem da notificação a ser ixibida se estiver null vai
   * exibir mensagem padrão "Tudo certo!"
   * @param {number|null} getTime quantos segundos vai aparece a notificações se for passaro $time
   * @return {$q.notify}
   */
  const successNotifyLp = (message, getTime = time, positionNot = pos) => {
    $q.notify({
      position: positionNot,
      message: message || 'Tudo certo!',
      icon: 'check_circle',
      iconColor: 'green-4',
      iconSize: '16px',
      timeout: getTime,
    })
  }
  /**
   *
   * @param {string|null} message mensagem da notificação a ser ixibida se estiver null vai
   * exibir mensagem padrão "Ops... precisamos recomeça."
   * @param {number|null} getTime quantos segundos vai aparece a notificações se for passaro $time
   * @return {$q.notify}
   */
  const alternativeNotify = (message, getTime = time, positionNot = pos) => {
    $q.notify({
      color: 'primary',
      position: positionNot,
      message: message || 'Ops... precisamos recomeça.',
      actions: [actions],
      timeout: getTime,
    })
  }
  /**
   *
   * @param {string|null} message mensagem da notificação a ser ixibida se estiver null vai
   * exibir mensagem padrão "Informação adquirida!"
   * @param {number|null} getTime quantos segundos vai aparece a notificações se for passaro $time
   * @return {$q.notify}
   */
  const errorNotify = (message, getTime = time, positionNot = pos) => {
    $q.notify({
      type: 'negative',
      position: positionNot,
      message: message || 'Falha!',
      actions: [actions],
      timeout: getTime,
    })
  }
  /**
   *
   * @param {string|null} message mensagem da notificação a ser ixibida se estiver null vai
   * exibir mensagem padrão "Informação adquirida!"
   * @param {number|null} getTime quantos segundos vai aparece a notificações
   * @return {$q.notify}
   */
  const infoNotify = (message, getTime = time, positionNot = pos) => {
    $q.notify({
      type: 'info',
      position: positionNot,
      message: message || 'Informação adquirida!',
      actions: [actions],
      timeout: getTime,
    })
  }
  /**
   *
   * @param {Array|object} obj erros que seram ixibidos um apos o outros
   * @param {number|null} getTime quantos segundos vai aparece a notificações
   * @return {errorNotify()}
   */
  const multError = (obj, getTime = 1) => {
    // let qua = 2
    for (const key in obj) {
      getTime++
      let formatInt = parseInt(`${getTime}000`)
      errorNotify(obj[key], formatInt, 'bottom-right')
    }
  }
  /**
   *
   * @param {string|null} message mensagem para aparece na tela | "Carregando.. Por favor, aguarde..."
   * @param {string|null} boxClass className | "bg-tranparent"
   * @param {string|null} spinnerColor cor do spinner | primary
   * @return {$q.loading.show()}
   */
  const showLoading = (
    message = ParttensLoading.message,
    boxClass = ParttensLoading.boxClass,
    spinnerColor = ParttensLoading.spinnerColor,
    spinnerItem = 'pattern',
  ) => {
    $q.loading.show({
      spinner: spinners[spinnerItem],
      message: message,
      boxClass: boxClass,
      spinnerColor: spinnerColor,
    })
  }
  const hideLoading = () => {
    $q.loading.hide()
  }
  const playSoundMessage = () => {
    const sound = new Audio('/sound/level-up-message.mp3')
    sound.play()
  }
  const showChatNotify = (avatar, message) => {
    playSoundMessage()
    $q.notify({
      message: message,
      color: 'accent',
      textColor: 'white',
      avatar: avatar,
      progress: true,
      position: 'top-right',
      timeout: 20000,
      actions: [
        {
          icon: 'close',
          color: 'dark',
          round: true,
          handler: () => {
            /* ... */
          },
        },
      ],
    })
  }
  return {
    successNotifyLp,
    errorNotify,
    successNotify,
    infoNotify,
    alternativeNotify,
    multError,
    showLoading,
    hideLoading,
    showChatNotify,
  }
}

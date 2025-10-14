export default function useWatch() {
  const getDate = (tempLast) => {
    var dia,
      hora,
      minutos,
      segundos,
      temp,
      status = true
    //

    var nowHours = new Date()
    var current_date = nowHours.getTime()

    // var tempLast = new Date(tempInitial.setMinutes(tempInitial.getMinutes() +2))
    var segundos_f = (tempLast - current_date) / 1000

    dia = parseInt(segundos_f / 86400)
    segundos_f = segundos_f % 86400

    hora = parseInt(segundos_f / 3600)
    segundos_f = segundos_f % 3600

    minutos = parseInt(segundos_f / 60)
    segundos = parseInt(segundos_f % 60)

    let hour = hora >= 10 ? hora : '0' + hora
    let minutes = minutos >= 10 ? minutos : '0' + minutos
    let seconds = segundos >= 10 ? segundos : '0' + segundos

    temp = dia + ' dias - ' + hour + 'h:' + minutes + 'm:' + seconds + 's'

    status = nowHours >= tempLast
    // if(nowHours >= tempLast){
    //    status = true
    // }

    return { dia, hour, minutes, seconds, status, tempLast, temp }
  }
  /**
   *
   * @param {array} arrayitens
   */
  const countArray = (arrayitens) => {
    const cont = 0
    let timer = setInterval(() => {
      cont + 1
      if (arrayitens.length < cont) {
        clearInterval(timer)
      }
    }, 1000)
  }
  return {
    getDate,
    countArray,
  }
}

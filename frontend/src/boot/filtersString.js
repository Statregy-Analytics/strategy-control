const filtersStrings = {
  /**
   * Resolvendo URL de images
   * @param {string} url
   * @returns string
   */
  resolveUrl(url) {
    const isImg = url.replace('img:', '')
    if (url.startsWith('img:')) {
      const url = new URL(`../assets/${isImg}`, import.meta.url).origin + '/' + isImg
      return 'img:' + url
    }
    return url
  },
  /**
   * Formata valores numericos
   * @param {number|float} value numero para ser convertido para formato ex.:2.999,00
   * @returns valor convertido para 2 casas decimais e pontuação de milhar
   */
  formatPartternCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  },
  /**
   *
   * @param {date} date data para se formatada para o formato brasileiro
   * @example 2025-01-01T00:00:00.000Z
   * @returns date formatada para o formato brasileiro dd/mm/yyyy
   * @description Formata uma data para o formato brasileiro (dd/mm/yyyy)
   */
  formatDateBR(date) {
    if (!date) return ''
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' }
    const dateObj = new Date(date)
    return dateObj.toLocaleDateString('pt-BR', options)
  },

  /**
   * Formata CPF (apenas exibição). Recebe string de 11 dígitos ou NULL e retorna 000.000.000-00
   */
  formatCpf(value) {
    if (!value) return ''
    const s = String(value).replace(/\D/g, '')
    if (s.length !== 11) return value
    return `${s.substring(0, 3)}.${s.substring(3, 6)}.${s.substring(6, 9)}-${s.substring(9, 11)}`
  },

  getBankObjct(bank) {
    const banks = {
      banco_do_brasil: { name: 'Banco do Brasil', code: '001', icon: 'img:icons/banco_brasil.png' },
      nubank: { name: 'Nubank', code: '000', icon: 'img:icons/NubankLogo.svg' },
      santander: { name: 'Santander', code: '033', icon: 'img:icons/santander_Brasil.svg' },
      inter: { name: 'Inter', code: '002', icon: 'img:icons/santander_Brasil.svg' },
      caixa_economicaa: {
        name: 'Caixa Econômica Federal',
        code: '104',
        icon: 'img:icons/CaixaEconomica.svg',
      },
      bradesco: { name: 'Bradesco', code: '237', icon: 'img:icons/banner_bradesco.png' },
      itau: { name: 'Itaú Unibanco', code: '341', icon: 'img:icons/CaixaEconomica.svg' },
      // Adicione outros bancos conforme necessário
    }
    return banks[bank] || { name: 'Banco Desconhecido', code: bank }
  },
}

export default filtersStrings

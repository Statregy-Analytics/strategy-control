export const selectPlaceholder = {
  mounted(el, binding) {
    const placeholder = binding.value || 'Selecione uma opção'

    // Aguarda o componente ser renderizado
    setTimeout(() => {
      const qSelect = el.__vueParentComponent || el.__vue__
      if (qSelect && qSelect.proxy) {
        // Define o placeholder se não existir
        if (!qSelect.proxy.$attrs.placeholder) {
          el.querySelector('.q-field__native').setAttribute('placeholder', placeholder)
        }
      }
    }, 100)
  }
}

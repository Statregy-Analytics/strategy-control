export default function useLogic() {
  const values = Array.from({ length: 12 }, (_, i) => {
    return {
      name: `value${i + 1}`,
      label: `Value${i + 1}`,
      field: `value${i + 1}`,
      align: 'right',
      classes: (val) => `${returnClass(val)}`,
    }
  })
  const value0 = {
    name: 'value',
    label: 'Value',
    field: 'value',
    align: 'right',
    classes: (val) => `${returnClass(val)}`,
  }
  const columnsLogic = [
    {
      name: 'label',
      label: 'Label',
      field: 'label',
      align: 'left',
      classes: 'border-right-3 q-ml-md',
    },
    value0,
    ...values,
  ]
  const returnClass = (value) => {
    const arrayValue = [value]
    const logicaContrato = arrayValue.some((objeto) => objeto.label == 'Contrato atrelado')
    const classText = ['', logicaContrato ? '' : ''].filter(Boolean).join(' ')
    return classText
  }

  const rowLogic = [
    {
      label: 'Informações',
      value: 'Janeiro/25',
      value1: 'Fevereiro/25',
      value2: 'Março/25',
      value3: 'Abril/25',
      value4: 'Maio/25',
      value5: 'Junho/25',
      value6: 'julho/25',
      value7: 'Agosto/25',
      value8: 'Setembro/25',
      value9: 'Outubro/25',
      value10: 'Novembro/25',
      value11: 'Dezembro/25',
    },
    {
      label: 'Contrato atrelado',
      value: '300,00_',
      value1: '300,00_',
      value2: '300,00_',
      value3: '300,00_',
      value4: '300,00_',
      value5: '300,00_',
      value6: '300,00_',
      value7: '300,00_',
      value8: '300,00_',
      value9: '300,00_',
      value10: '300,00_',
      value11: '300,00_',
    },
    {
      label: 'Valor Base [R$]',
      value: '0,00 (-0%)',
      value1: '0,00 (-0%)',
      value2: '0,00 (-0%)',
      value3: '0,00 (-0%)',
      value4: '0,00 (-0%)',
      value5: '0,00 (-0%)',
      value6: '0,00 (-0%)',
      value7: '0,00 (-0%)',
      value8: '0,00 (-0%)',
      value9: '0,00 (-0%)',
      value10: '0,00 (-0%)',
      value11: '0,00 (-0%)',
    },
    {
      label: 'Data da Distrubuição',
      value: '300,0040',
      value1: '300,0040',
      value2: '300,0040',
      value3: '300,0040',
      value4: '300,0040',
      value5: '300,0040',
      value6: '300,0040',
      value7: '300,0040',
      value8: '300,0040',
      value9: '300,0040',
      value10: '300,0040',
      value11: '300,0040',
    },
    {
      label: 'Valor da Distribuição [R$]',
      value: '300,00',
      value1: '300,00',
      value2: '300,00',
      value3: '300,00',
      value4: '300,00',
      value5: '300,00',
      value6: '300,00',
      value7: '300,00',
      value8: '300,00',
      value9: '300,00',
      value10: '300,00',
      value11: '300,00',
    },
  ]
  return {
    columnsLogic,
    rowLogic,
  }
}

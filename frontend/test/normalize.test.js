import { describe, it, expect } from 'vitest'
import {
  titleCase,
  normalizeStateValue,
  normalizeClientForDisplay,
} from '../src/utils/normalize.js'

describe('titleCase', () => {
  it('capitalizes first letters and keeps small words lowercase when not first', () => {
    expect(titleCase('joão da silva')).toBe('João da Silva')
  })

  it('keeps small word at start capitalized', () => {
    expect(titleCase('da silva')).toBe('Da Silva')
  })

  it('handles hyphenated words', () => {
    expect(titleCase('são-paulo')).toBe('São-Paulo')
  })

  it('trims and collapses spaces', () => {
    expect(titleCase('  maria   clara  ')).toBe('Maria Clara')
  })
})

describe('normalizeStateValue', () => {
  it('uppercases 2-letter UF', () => {
    expect(normalizeStateValue('sp')).toBe('SP')
  })

  it('uppercases single-letter values', () => {
    expect(normalizeStateValue('r')).toBe('R')
  })

  it('returns longer strings unchanged', () => {
    expect(normalizeStateValue('SomeProvince')).toBe('SomeProvince')
  })
})

describe('normalizeClientForDisplay', () => {
  it('normalizes name-like fields and state fields', () => {
    const client = {
      name: 'joão da silva',
      apelido: 'joãozinho',
      nacionalidade: 'brasileiro',
      naturalidade_cidade: 'bauru',
      naturalidade_uf: 'sp',
      rg_expedicao_uf: 'rj',
      rua: 'av das startups',
      pais: 'brasil',
      residential: {
        city: 'são paulo',
        street: 'rua central',
        neighborhood: 'centro',
        state: 'sp',
      },
    }

    const normalized = normalizeClientForDisplay(client)
    expect(normalized.name).toBe('João da Silva')
    expect(normalized.apelido).toBe('Joãozinho')
    expect(normalized.nacionalidade).toBe('Brasileiro')
    expect(normalized.naturalidade_cidade).toBe('Bauru')
    expect(normalized.naturalidade_uf).toBe('SP')
    expect(normalized.rg_expedicao_uf).toBe('RJ')
    expect(normalized.rua).toBe('Av das Startups')
    expect(normalized.pais).toBe('Brasil')
    expect(normalized.residential.city).toBe('São Paulo')
    expect(normalized.residential.street).toBe('Rua Central')
    expect(normalized.residential.neighborhood).toBe('Centro')
    expect(normalized.residential.state).toBe('SP')
  })
})

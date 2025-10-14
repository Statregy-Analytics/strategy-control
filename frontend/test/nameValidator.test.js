import { describe, it, expect } from 'vitest'
import { isFullName } from '../src/utils/validators/nameValidator.js'

describe('isFullName', () => {
  it('returns false for single name', () => {
    expect(isFullName('João')).toBe(false)
  })

  it('returns true for two names', () => {
    expect(isFullName('João Silva')).toBe(true)
  })

  it('trims extra spaces and validates', () => {
    expect(isFullName('  Maria   Clara  ')).toBe(true)
  })

  it('returns false for empty string', () => {
    expect(isFullName('')).toBe(false)
  })

  it('returns false for null', () => {
    expect(isFullName(null)).toBe(false)
  })

  it('returns false for single-letter name', () => {
    expect(isFullName('A')).toBe(false)
  })

  it('accepts hyphenated first names', () => {
    expect(isFullName('Ana-Maria Costa')).toBe(true)
  })

  it('accepts names with apostrophes', () => {
    expect(isFullName("O'Neill Patrick")).toBe(true)
  })

  it('accepts names with suffixes', () => {
    expect(isFullName('João Silva Jr.')).toBe(true)
  })

  it('accepts long multi-part names', () => {
    expect(isFullName('José da Silva Pereira de Souza')).toBe(true)
  })
})

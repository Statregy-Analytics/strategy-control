import test from 'node:test'
import assert from 'node:assert/strict'
import {
  numberInputValue,
  decimalInputValue,
  decimalInputDisplay,
} from '../src/services/numberInputValue.js'

test('localized signed decimal editing accepts comma or point without inventing zero', () => {
  for (const text of ['-0,80', '-0.80', '-.8']) assert.equal(decimalInputValue(text), -0.8)
  assert.equal(decimalInputValue('12,00'), 12)
  assert.equal(decimalInputValue('0,00'), 0)
  for (const value of ['', ' ', '-', '1,2,3', '1.234,56', 'text', false, null, Infinity])
    assert.equal(decimalInputValue(value), null)
})

test('localized display preserves known zero and precision while missing data stays empty', () => {
  assert.equal(decimalInputDisplay(0), '0,00')
  assert.equal(decimalInputDisplay(-0.8), '-0,80')
  assert.equal(decimalInputDisplay(12), '12,00')
  assert.equal(decimalInputDisplay(0.805), '0,805')
  for (const value of [null, undefined, '', false, NaN, Infinity])
    assert.equal(decimalInputDisplay(value), '')
})

test('native number mode keeps its original numeric contract separate from localized text', () => {
  assert.equal(numberInputValue('50'), 50)
  assert.equal(numberInputValue('0'), 0)
  assert.equal(numberInputValue('0.5'), 0.5)
  assert.equal(numberInputValue('0,5'), null)
  assert.equal(numberInputValue(false), null)
  assert.equal(numberInputValue(' '), null)
})

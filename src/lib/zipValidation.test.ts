import { describe, it, expect } from 'vitest'
import { isValidZip, formatZipInput } from './zipValidation'

describe('zipValidation', () => {
  describe('isValidZip', () => {
    it('accepts valid 5-digit zip codes', () => {
      expect(isValidZip('12345')).toBe(true)
      expect(isValidZip('00000')).toBe(true)
      expect(isValidZip('99999')).toBe(true)
    })

    it('rejects invalid zip codes', () => {
      expect(isValidZip('1234')).toBe(false)
      expect(isValidZip('123456')).toBe(false)
      expect(isValidZip('1234a')).toBe(false)
      expect(isValidZip('')).toBe(false)
    })

    it('trims whitespace before validating', () => {
      expect(isValidZip('  12345  ')).toBe(true)
    })
  })

  describe('formatZipInput', () => {
    it('strips non-digits', () => {
      expect(formatZipInput('12a34')).toBe('1234')
      expect(formatZipInput('12-34-5')).toBe('12345')
    })

    it('limits to 5 characters', () => {
      expect(formatZipInput('123456')).toBe('12345')
    })

    it('returns empty string for empty input', () => {
      expect(formatZipInput('')).toBe('')
    })
  })
})

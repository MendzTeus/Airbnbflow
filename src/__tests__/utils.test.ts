import { describe, it, expect } from 'vitest'
import { cn } from '../lib/utils'

// Tests for the cn utility

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional arguments', () => {
    expect(cn('foo', { bar: true, baz: false })).toBe('foo bar')
  })

  it('merges conflicting tailwind classes', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })
})

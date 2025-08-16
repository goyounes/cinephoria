import randomImageName from './randomImageName.js'

describe('randomImageName', () => {
  test('should generate a random string', () => {
    const name = randomImageName()
    expect(typeof name).toBe('string')
    expect(name.length).toBeGreaterThan(0)
  })

  test('should generate unique names', () => {
    const name1 = randomImageName()
    const name2 = randomImageName()
    expect(name1).not.toBe(name2)
  })

  test('should respect custom byte length', () => {
    const name = randomImageName(16)
    expect(name.length).toBe(32) // 16 bytes = 32 hex chars
  })

  test('should only contain hex characters', () => {
    const name = randomImageName()
    expect(name).toMatch(/^[a-f0-9]+$/)
  })

  test('should use default 32 bytes when no parameter provided', () => {
    const name = randomImageName()
    expect(name.length).toBe(64) // 32 bytes = 64 hex chars
  })
})
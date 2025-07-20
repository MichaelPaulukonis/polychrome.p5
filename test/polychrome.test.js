import { beforeAll, describe, test, expect } from 'vitest'
import { config } from '@vue/test-utils'
import { vi } from 'vitest'

// Manually set up the mock for this test file
beforeAll(() => {
  global.p5 = {
    createCanvas: vi.fn(),
    background: vi.fn(),
    fill: vi.fn(),
    text: vi.fn(),
    colorMode: vi.fn(),
    HSB: 'HSB',
    createGraphics: vi.fn(() => ({
      width: 100,
      height: 200,
      push: vi.fn(),
      pop: vi.fn(),
      translate: vi.fn(),
      resetMatrix: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      image: vi.fn(),
      remove: vi.fn()
    })),
    color: vi.fn(),
    random: vi.fn(),
    radians: vi.fn((degrees) => degrees * Math.PI / 180),
    width: 800,
    height: 600,
    mouseX: 0,
    mouseY: 0
  }

  config.mocks = {
    $nuxt: {
      context: {}
    }
  }
})

describe('Polychrome Setup', () => {
  test('p5.js mock is properly configured', () => {
    expect(global.p5).toBeDefined()
    expect(global.p5.createCanvas).toBeDefined()
    expect(global.p5.colorMode).toBeDefined()
    expect(global.p5.HSB).toBe('HSB')
  })

  test('can mock canvas operations', () => {
    global.p5.createCanvas(800, 600)
    global.p5.background(0)

    expect(global.p5.createCanvas).toHaveBeenCalledWith(800, 600)
    expect(global.p5.background).toHaveBeenCalledWith(0)
  })

  test('canvas dimensions are available', () => {
    expect(global.p5.width).toBe(800)
    expect(global.p5.height).toBe(600)
  })
})

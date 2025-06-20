import { config } from '@vue/test-utils'
import { vi } from 'vitest'

// Mock p5.js for testing
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

// Mock Nuxt context
config.mocks = {
  $nuxt: {
    context: {}
  }
}

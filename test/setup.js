import { config } from '@vue/test-utils'

// Mock p5.js for testing
global.p5 = {
  createCanvas: vi.fn(),
  background: vi.fn(),
  fill: vi.fn(),
  text: vi.fn(),
  colorMode: vi.fn(),
  HSB: 'HSB',
  createGraphics: vi.fn(),
  color: vi.fn(),
  random: vi.fn(),
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

import { describe, test, expect, vi, beforeEach } from 'vitest'

// Mock require.context for Webpack-specific features
vi.mock('../assets/fonts', () => ({
  context: vi.fn(() => ({
    keys: () => [],
    resolve: vi.fn()
  }))
}))

import Sketch from '../src/sketch'

describe('Zone Dragging, Moving, and Centering', () => {
  let mockP5
  let mockLayers
  let mockGlobals
  let mockZone
  let pct
  let mockParams

  beforeEach(() => {
    mockP5 = {
      mouseX: 0,
      mouseY: 0,
      width: 800,
      height: 600,
      keyIsDown: vi.fn((key) => key === mockP5.ALT), // Simulate Alt key pressed
      ALT: 'ALT',
      createGraphics: vi.fn(() => ({
        width: 100,
        height: 100,
        pixelDensity: vi.fn(),
        image: vi.fn(),
        remove: vi.fn(),
        push: vi.fn(),
        pop: vi.fn(),
        translate: vi.fn(),
        resetMatrix: vi.fn()
      })),
      color: vi.fn(),
      random: vi.fn(),
      radians: vi.fn((degrees) => degrees * Math.PI / 180),
      pixelDensity: vi.fn()
    }

    mockLayers = {
      scaleFactor: 1,
      drawingCanvas: mockP5.createGraphics(),
      uiCanvas: mockP5.createGraphics(),
      initializeColorMode: vi.fn(),
      resize: vi.fn(),
      clear: vi.fn(),
      copy: vi.fn(() => mockP5.createGraphics()),
      clone: vi.fn(() => mockP5.createGraphics()),
      dispose: vi.fn()
    }

    mockGlobals = {
      zoneExists: false,
      isDefiningZone: false,
      isZoneActive: false,
      updatedCanvas: false
    }

    mockZone = {
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      graphics: mockP5.createGraphics(),
      transformState: { rotation: 0, scale: 1 }
    }

    mockParams = {
      width: 800,
      height: 600,
      font: 'Arial',
      fill: { color: '#FFFFFF' }
    }

    pct = Sketch({
      p5Instance: mockP5,
      guiControl: {},
      textManager: {},
      setupCallback: vi.fn()
    })

    // Manually set up internal state that Sketch normally manages in setup()
    pct.layers = mockLayers
    pct.globals = mockGlobals
    pct.params = mockParams

    // Mock the internal zone object that Sketch normally manages
    Object.defineProperty(pct, 'zone', {
      get: () => mockZone,
      set: (newZone) => { mockZone = newZone },
      configurable: true
    })

    // Mock the internal isDraggingZone variable
    let internalIsDraggingZone = false
    Object.defineProperty(pct, 'isDraggingZone', {
      get: () => internalIsDraggingZone,
      set: (val) => { internalIsDraggingZone = val },
      configurable: true
    })

    // Mock the internal zoneStartPos variable
    let internalZoneStartPos = null
    Object.defineProperty(pct, 'zoneStartPos', {
      get: () => internalZoneStartPos,
      set: (val) => { internalZoneStartPos = val },
      configurable: true
    })

    // Call setup to initialize the sketch
    pct.p5.setup()
  })

  test('isDraggingZone should be false initially', () => {
    expect(pct.isDraggingZone).toBe(false)
  })

  test('isDraggingZone becomes true when Alt+click in zone', () => {
    mockGlobals.zoneExists = true
    mockGlobals.isZoneActive = true
    mockP5.mouseX = 200
    mockP5.mouseY = 200
    mockP5.keyIsDown.mockReturnValue(true) // Simulate Alt key pressed

    pct.p5.mousePressed()
    expect(pct.isDraggingZone).toBe(true)
    expect(pct.zoneStartPos).toEqual({ x: 200, y: 200 })
  })

  test('isDraggingZone becomes false on mouseReleased', () => {
    mockGlobals.zoneExists = true
    mockGlobals.isZoneActive = true
    mockP5.mouseX = 200
    mockP5.mouseY = 200
    mockP5.keyIsDown.mockReturnValue(true)

    pct.p5.mousePressed()
    expect(pct.isDraggingZone).toBe(true)

    pct.p5.mouseReleased()
    expect(pct.isDraggingZone).toBe(false)
  })

  test('zone x and y update correctly on mouseDragged', () => {
    mockGlobals.zoneExists = true
    mockGlobals.isZoneActive = true
    mockP5.mouseX = 200
    mockP5.mouseY = 200
    mockP5.keyIsDown.mockReturnValue(true)

    pct.p5.mousePressed() // Start drag

    mockP5.mouseX = 250
    mockP5.mouseY = 260
    pct.p5.mouseDragged() // Drag

    expect(mockZone.x).toBe(150) // 100 (initial) + (250-200)
    expect(mockZone.y).toBe(160) // 100 (initial) + (260-200)
    expect(pct.zoneStartPos).toEqual({ x: 250, y: 260 })

    mockP5.mouseX = 150
    mockP5.mouseY = 160
    pct.p5.mouseDragged() // Drag again

    expect(mockZone.x).toBe(50) // 150 + (150-250)
    expect(mockZone.y).toBe(60) // 160 + (160-260)
  })

  test('setZoneX updates zone.x', () => {
    mockGlobals.zoneExists = true
    pct.setZoneX(300)
    expect(mockZone.x).toBe(300)
  })

  test('setZoneY updates zone.y', () => {
    mockGlobals.zoneExists = true
    pct.setZoneY(400)
    expect(mockZone.y).toBe(400)
  })

  test('centerZone centers the zone correctly', () => {
    mockGlobals.zoneExists = true
    mockZone.x = 0
    mockZone.y = 0
    mockZone.width = 100
    mockZone.height = 100
    mockParams.width = 800
    mockParams.height = 600

    pct.centerZone()
    expect(mockZone.x).toBe(350) // (800 - 100) / 2
    expect(mockZone.y).toBe(250) // (600 - 100) / 2
  })

  test('drawing should not occur when isDraggingZone is true', () => {
    mockGlobals.zoneExists = true
    mockGlobals.isZoneActive = true
    mockP5.mouseX = 200
    mockP5.mouseY = 200
    mockP5.keyIsDown.mockReturnValue(true)

    pct.p5.mousePressed() // Start drag
    expect(pct.isDraggingZone).toBe(true)

    const initialZoneX = mockZone.x
    const initialZoneY = mockZone.y

    pct.p5.draw() // Simulate draw loop call

    // Assert that paint was NOT called on zone.graphics
    expect(mockZone.graphics.image).not.toHaveBeenCalled()
    expect(mockZone.x).toBe(initialZoneX) // Ensure zone position didn't change due to paint
    expect(mockZone.y).toBe(initialZoneY)
  })
})

import { vi } from 'vitest'
import { HORIZONTAL, VERTICAL, flipCore, mirrorCore, newCorner } from '@/src/canvas-transforms/core-transforms.js'
import { createCanvasTransforms } from '@/src/canvas-transforms/canvas-transforms.js'

describe('Canvas Transforms - Core Functions', () => {
  describe('Constants', () => {
    test('should export correct transform direction constants', () => {
      expect(HORIZONTAL).toBe(0)
      expect(VERTICAL).toBe(1)
    })
  })

  describe('flipCore', () => {
    let mockGraphics, mockLayers, mockClonedGraphics

    beforeEach(() => {
      // Mock p5.Graphics object
      mockGraphics = {
        width: 100,
        height: 200,
        image: vi.fn()
      }

      // Mock cloned graphics object
      mockClonedGraphics = {
        width: 100,
        height: 200,
        push: vi.fn(),
        pop: vi.fn(),
        translate: vi.fn(),
        resetMatrix: vi.fn(),
        scale: vi.fn(),
        image: vi.fn()
      }

      // Mock layers object
      mockLayers = {
        clone: vi.fn().mockReturnValue(mockClonedGraphics)
      }
    })

    test('should flip graphics vertically by default', () => {
      const result = flipCore(VERTICAL, mockGraphics, mockLayers)

      expect(mockLayers.clone).toHaveBeenCalledWith(mockGraphics)
      expect(mockClonedGraphics.push).toHaveBeenCalled()
      expect(mockClonedGraphics.translate).toHaveBeenCalledWith(0, 0)
      expect(mockClonedGraphics.resetMatrix).toHaveBeenCalled()
      expect(mockClonedGraphics.translate).toHaveBeenCalledWith(100, 0) // width, 0
      expect(mockClonedGraphics.scale).toHaveBeenCalledWith(-1, 1)
      expect(mockClonedGraphics.image).toHaveBeenCalledWith(mockGraphics, 0, 0, 100, 200)
      expect(mockClonedGraphics.pop).toHaveBeenCalled()
      expect(result).toBe(mockClonedGraphics)
    })

    test('should flip graphics horizontally when axis is HORIZONTAL', () => {
      const result = flipCore(HORIZONTAL, mockGraphics, mockLayers)

      expect(mockClonedGraphics.translate).toHaveBeenCalledWith(0, 200) // 0, height
      expect(mockClonedGraphics.scale).toHaveBeenCalledWith(1, -1)
      expect(result).toBe(mockClonedGraphics)
    })

    test('should use VERTICAL as default when no axis provided', () => {
      flipCore(undefined, mockGraphics, mockLayers)

      expect(mockClonedGraphics.translate).toHaveBeenCalledWith(100, 0) // VERTICAL behavior
      expect(mockClonedGraphics.scale).toHaveBeenCalledWith(-1, 1)
    })
  })

  describe('mirrorCore', () => {
    let mockGraphics, mockLayers, mockClonedGraphics

    beforeEach(() => {
      mockGraphics = {
        width: 100,
        height: 200,
        image: vi.fn()
      }

      mockClonedGraphics = {
        width: 100,
        height: 200,
        push: vi.fn(),
        pop: vi.fn(),
        translate: vi.fn(),
        resetMatrix: vi.fn(),
        scale: vi.fn(),
        image: vi.fn(),
        remove: vi.fn()
      }

      mockLayers = {
        clone: vi.fn().mockReturnValue(mockClonedGraphics)
      }
    })

    test('should create mirrored half-image vertically by default', () => {
      const result = mirrorCore(VERTICAL, mockGraphics, mockLayers)

      // Should call flipCore first
      expect(mockLayers.clone).toHaveBeenCalledWith(mockGraphics)

      // Should copy flipped content to original graphics (vertical mirror)
      expect(mockGraphics.image).toHaveBeenCalledWith(
        mockClonedGraphics,
        50, 0, 50, 200, // dest: x=width/2, y=0, w=width/2, h=height
        50, 0, 50      // src: x=width/2, y=0, w=width/2 (height omitted in call)
      )

      expect(mockClonedGraphics.remove).toHaveBeenCalled()
      expect(result).toBe(mockGraphics)
    })

    test('should create mirrored half-image horizontally', () => {
      const result = mirrorCore(HORIZONTAL, mockGraphics, mockLayers)

      // Should copy flipped content to original graphics (horizontal mirror)
      expect(mockGraphics.image).toHaveBeenCalledWith(
        mockClonedGraphics,
        0, 100, 100, 100, // dest: x=0, y=height/2, w=width, h=height/2
        0, 100, 100, 100  // src: x=0, y=height/2, w=width, h=height/2
      )

      expect(result).toBe(mockGraphics)
    })
  })

  describe('newCorner', () => {
    test('should apply corner rotation transformation', () => {
      const mockLayer = {
        width: 100,
        translate: vi.fn(),
        rotate: vi.fn(),
        radians: vi.fn().mockReturnValue(Math.PI / 2)
      }

      newCorner(mockLayer)

      expect(mockLayer.translate).toHaveBeenCalledWith(100, 0) // width, 0
      expect(mockLayer.radians).toHaveBeenCalledWith(90)
      expect(mockLayer.rotate).toHaveBeenCalledWith(Math.PI / 2)
    })
  })
})

describe('Canvas Transforms - Factory Function', () => {
  let mockDependencies, mockLayers, mockP5

  beforeEach(() => {
    // Mock p5 instance
    mockP5 = {
      radians: vi.fn().mockReturnValue(Math.PI / 2),
      createGraphics: vi.fn()
    }

    // Mock layers object
    mockLayers = {
      copy: vi.fn().mockReturnValue({
        image: vi.fn(),
        remove: vi.fn()
      }),
      clone: vi.fn(),
      drawingLayer: {
        width: 100,
        height: 200,
        remove: vi.fn()
      },
      p5: mockP5
    }

    // Mock dependencies
    mockDependencies = {
      layers: mockLayers,
      recordAction: vi.fn(),
      globals: { updatedCanvas: false },
      renderLayers: vi.fn(),
      initDrawingLayer: vi.fn(),
      getAppMode: vi.fn().mockReturnValue('STANDARD_DRAW'),
      APP_MODES: {
        STANDARD_DRAW: 'STANDARD_DRAW',
        PLAYBACK: 'PLAYBACK'
      },
      params: {
        width: 100,
        height: 200
      }
    }
  })

  test('should create canvas transforms object with all expected methods', () => {
    const transforms = createCanvasTransforms(mockDependencies)

    expect(transforms).toHaveProperty('flip')
    expect(transforms).toHaveProperty('mirror')
    expect(transforms).toHaveProperty('shift')
    expect(transforms).toHaveProperty('rotateCanvas')
    expect(transforms).toHaveProperty('rotateWrapped')
    expect(transforms).toHaveProperty('newCorner')
    expect(transforms).toHaveProperty('HORIZONTAL')
    expect(transforms).toHaveProperty('VERTICAL')
    expect(transforms).toHaveProperty('flipCore')
    expect(transforms).toHaveProperty('mirrorCore')

    // Check that all methods are functions
    expect(typeof transforms.flip).toBe('function')
    expect(typeof transforms.mirror).toBe('function')
    expect(typeof transforms.shift).toBe('function')
    expect(typeof transforms.rotateCanvas).toBe('function')
    expect(typeof transforms.rotateWrapped).toBe('function')
  })

  test('should export constants correctly', () => {
    const transforms = createCanvasTransforms(mockDependencies)

    expect(transforms.HORIZONTAL).toBe(0)
    expect(transforms.VERTICAL).toBe(1)
  })

  describe('flip method', () => {
    test.skip('should record action and update canvas', () => {
      const transforms = createCanvasTransforms(mockDependencies)
      const mockLayer = { image: vi.fn() }

      transforms.flip({ axis: VERTICAL, layer: mockLayer })

      expect(mockDependencies.recordAction).toHaveBeenCalledWith(
        { axis: VERTICAL, layer: mockLayer, action: 'flip' },
        false // not in playback mode
      )
      expect(mockDependencies.renderLayers).toHaveBeenCalledWith({ layers: mockLayers })
      expect(mockDependencies.globals.updatedCanvas).toBe(true)
    })
  })

  describe('rotateWrapped method', () => {
    test.skip('should call rotateCanvas with correct parameters', () => {
      const transforms = createCanvasTransforms(mockDependencies)

      // Mock createGraphics to return a proper mock
      const mockNewGraphics = {
        push: vi.fn(),
        pop: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        image: vi.fn(),
        remove: vi.fn()
      }
      mockP5.createGraphics.mockReturnValue(mockNewGraphics)

      transforms.rotateWrapped(-1)

      expect(mockP5.createGraphics).toHaveBeenCalledWith(200, 100) // swapped dimensions
      expect(mockDependencies.globals.updatedCanvas).toBe(true)
    })

    test.skip('should default to clockwise rotation (direction=1)', () => {
      const transforms = createCanvasTransforms(mockDependencies)

      const mockNewGraphics = {
        push: vi.fn(),
        pop: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        image: vi.fn(),
        remove: vi.fn()
      }
      mockP5.createGraphics.mockReturnValue(mockNewGraphics)

      transforms.rotateWrapped() // no direction argument

      expect(mockP5.createGraphics).toHaveBeenCalledWith(200, 100) // swapped for clockwise
    })
  })

  describe('integration with recording system', () => {
    test.skip('should not record actions when in playback mode', () => {
      mockDependencies.getAppMode.mockReturnValue('PLAYBACK')
      const transforms = createCanvasTransforms(mockDependencies)
      const mockLayer = { image: vi.fn() }

      transforms.flip({ axis: VERTICAL, layer: mockLayer })

      expect(mockDependencies.recordAction).toHaveBeenCalledWith(
        { axis: VERTICAL, layer: mockLayer, action: 'flip' },
        true // in playback mode
      )
    })
  })
})

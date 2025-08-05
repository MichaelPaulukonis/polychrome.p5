import { describe, test, expect, beforeEach } from 'vitest'
import { isMouseInZone, setZoneX, setZoneY, centerZone, calculateZoneRect } from '../../src/zone/zone-manipulation'

describe('Zone Manipulation Functions', () => {
  let mockP5
  let mockLayers
  let mockZone
  let mockParams

  beforeEach(() => {
    mockP5 = {
      mouseX: 0,
      mouseY: 0
    }
    mockLayers = {
      scaleFactor: 1
    }
    mockZone = {
      x: 100,
      y: 100,
      width: 200,
      height: 150
    }
    mockParams = {
      width: 800,
      height: 600
    }
  })

  describe('isMouseInZone', () => {
    test('should return true if mouse is inside the zone', () => {
      mockP5.mouseX = 150
      mockP5.mouseY = 150
      expect(isMouseInZone(mockP5, mockLayers, mockZone)).toBe(true)
    })

    test('should return false if mouse is outside the zone', () => {
      mockP5.mouseX = 50
      mockP5.mouseY = 50
      expect(isMouseInZone(mockP5, mockLayers, mockZone)).toBe(false)
    })

    test('should return true if mouse is on the zone edge', () => {
      mockP5.mouseX = 100 // On left edge
      mockP5.mouseY = 150
      expect(isMouseInZone(mockP5, mockLayers, mockZone)).toBe(true)

      mockP5.mouseX = 200 // On top edge
      mockP5.mouseY = 100
      expect(isMouseInZone(mockP5, mockLayers, mockZone)).toBe(true)

      mockP5.mouseX = 300 // On right edge
      mockP5.mouseY = 200
      expect(isMouseInZone(mockP5, mockLayers, mockZone)).toBe(true)

      mockP5.mouseX = 200 // On bottom edge
      mockP5.mouseY = 250
      expect(isMouseInZone(mockP5, mockLayers, mockZone)).toBe(true)
    })

    test('should handle scaleFactor correctly', () => {
      mockLayers.scaleFactor = 2
      mockP5.mouseX = 100 // This translates to 200 offscreen
      mockP5.mouseY = 100 // This translates to 200 offscreen
      mockZone.x = 150
      mockZone.y = 150
      mockZone.width = 100
      mockZone.height = 100
      // Mouse (100,100) scaled is (200,200). Zone is (150,150) to (250,250).
      expect(isMouseInZone(mockP5, mockLayers, mockZone)).toBe(true)

      mockP5.mouseX = 50 // This translates to 100 offscreen
      mockP5.mouseY = 50 // This translates to 100 offscreen
      expect(isMouseInZone(mockP5, mockLayers, mockZone)).toBe(false)
    })
  })

  describe('setZoneX', () => {
    test('should update zone.x', () => {
      setZoneX(mockZone, 50)
      expect(mockZone.x).toBe(50)
    })
  })

  describe('setZoneY', () => {
    test('should update zone.y', () => {
      setZoneY(mockZone, 75)
      expect(mockZone.y).toBe(75)
    })
  })

  describe('centerZone', () => {
    test('should center the zone horizontally and vertically', () => {
      mockZone.width = 100
      mockZone.height = 50
      mockParams.width = 800
      mockParams.height = 600

      centerZone(mockZone, mockParams)

      expect(mockZone.x).toBe((800 - 100) / 2) // 350
      expect(mockZone.y).toBe((600 - 50) / 2) // 275
    })

    test('should handle different canvas and zone sizes', () => {
      mockZone.width = 500
      mockZone.height = 300
      mockParams.width = 1000
      mockParams.height = 400

      centerZone(mockZone, mockParams)

      expect(mockZone.x).toBe((1000 - 500) / 2) // 250
      expect(mockZone.y).toBe((400 - 300) / 2) // 50
    })
  })

  describe('calculateZoneRect', () => {
    test('should calculate the correct rectangle from top-left to bottom-right', () => {
      const startPos = { x: 10, y: 20 }
      const endPos = { x: 110, y: 120 }
      const rect = calculateZoneRect(startPos, endPos)
      expect(rect).toEqual({ x: 10, y: 20, width: 100, height: 100 })
    })

    test('should calculate the correct rectangle from bottom-right to top-left', () => {
      const startPos = { x: 110, y: 120 }
      const endPos = { x: 10, y: 20 }
      const rect = calculateZoneRect(startPos, endPos)
      expect(rect).toEqual({ x: 10, y: 20, width: 100, height: 100 })
    })

    test('should calculate the correct rectangle from top-right to bottom-left', () => {
      const startPos = { x: 110, y: 20 }
      const endPos = { x: 10, y: 120 }
      const rect = calculateZoneRect(startPos, endPos)
      expect(rect).toEqual({ x: 10, y: 20, width: 100, height: 100 })
    })

    test('should calculate the correct rectangle from bottom-left to top-right', () => {
      const startPos = { x: 10, y: 120 }
      const endPos = { x: 110, y: 20 }
      const rect = calculateZoneRect(startPos, endPos)
      expect(rect).toEqual({ x: 10, y: 20, width: 100, height: 100 })
    })

    test('should return a zero-sized rectangle for identical start and end points', () => {
      const startPos = { x: 50, y: 50 }
      const endPos = { x: 50, y: 50 }
      const rect = calculateZoneRect(startPos, endPos)
      expect(rect).toEqual({ x: 50, y: 50, width: 0, height: 0 })
    })
  })
})

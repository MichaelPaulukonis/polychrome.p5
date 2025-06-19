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

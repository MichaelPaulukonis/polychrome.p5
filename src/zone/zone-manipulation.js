
export const isMouseInZone = (p5, layers, zone) => {
  const offscreenX = p5.mouseX * layers.scaleFactor
  const offscreenY = p5.mouseY * layers.scaleFactor
  return (
    offscreenX >= zone.x &&
    offscreenX <= zone.x + zone.width &&
    offscreenY >= zone.y &&
    offscreenY <= zone.y + zone.height
  )
}

export const setZoneX = (zone, x) => {
  zone.x = x
}

export const setZoneY = (zone, y) => {
  zone.y = y
}

export const centerZone = (zone, params) => {
  zone.x = (params.width - zone.width) / 2
  zone.y = (params.height - zone.height) / 2
}

export const calculateZoneRect = (startPos, endPos) => {
  const x = Math.min(startPos.x, endPos.x)
  const y = Math.min(startPos.y, endPos.y)
  const width = Math.abs(startPos.x - endPos.x)
  const height = Math.abs(startPos.y - endPos.y)
  return { x, y, width, height }
}

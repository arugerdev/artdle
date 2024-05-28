function componentToHex (c) {
  var hex = c.toString(16)
  return hex.length == 1 ? '0' + hex : hex
}

export function rgbToHex (r, g, b) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
}

export function hexToRGB (hex) {
  var long = parseInt(hex.toString().replace(/^#/, ''), 16)
  return [(long >>> 16) & 0xff, (long >>> 8) & 0xff, long & 0xff]
}

export function getColorOnPos (canvas, x, y) {
  const cx = canvas.getContext('2d')
  x = Math.floor(x)
  y = Math.floor(y)
  const imageData = cx.getImageData(0, 0, canvas.width, canvas.height)
  const index = (y * canvas.width + x) * 4

  return rgbToHex(
    imageData.data[index],
    imageData.data[index + 1],
    imageData.data[index + 2]
  )
}

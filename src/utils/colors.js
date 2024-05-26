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

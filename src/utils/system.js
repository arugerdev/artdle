export function isMacOs () {
  return window.navigator.appVersion.indexOf('Mac') !== -1
}

export function isMobile () {
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i
  ]

  return toMatch.some(toMatchItem => {
    return navigator.userAgent.match(toMatchItem)
  })
}

import { useState, useEffect } from 'react'

const useImage = src => {
  const [image, setImage] = useState(null)

  useEffect(() => {
    const img = new window.Image()
    img.src = src
    img.onload = () => setImage(img)
  }, [src])

  return image
}

export default useImage

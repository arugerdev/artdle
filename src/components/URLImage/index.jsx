import { Image } from 'react-konva'
import { useMemo } from 'react'
import useImage from '../../hooks/useImage'

export const URLImage = ({ src }) => {
  const image = useImage(src)

  return useMemo(() => {
    return image ? <Image image={image} /> : null
  }, [image])
}

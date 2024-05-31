/* eslint-disable react/prop-types */
import { Button, Link } from '@nextui-org/react'
import {
  FacebookIcon,
  LinkedinIcon,
  ShareIcon,
  TwitterIcon,
  WhatsappIcon
} from '../../assets/icons'
import { CopyDetail } from '../copyDetail'
import { ToolBarButton } from '../toolBarButton'

export const ShareButton = ({ data, dailyWord }) => {
  return (
    <ToolBarButton
      icon={<ShareIcon className='w-full h-full' />}
      onPress={null}
      isDisabled={false}
      modal
      modalContent={
        data && (
          <>
            <CopyDetail
              title='Link'
              toCopy={`https://artdle.com/api/draw?id=${data.id}`}
            />
            <h1 className='w-full text-center font-extrabold pt-4'>
              Redes sociales
            </h1>
            <section className='w-full h-full grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-px md:gap-4 p-0 md:p-4'>
              <Button
                as={Link}
                href={`https://twitter.com/intent/post?text=Mira%20lo%20que%20he%20dibujado%20hoy%20en%20Artdle.com!%0ALa%20palabra%20de%20hoy%20es%20${dailyWord}%0A&url=https%3A%2F%2Fartdle.com%2Fapi%2Fdraw%3Fid%3D${data.id}`}
                className='bg-[#00acee]'
                target='_blank'
                color='primary'
                startContent={
                  <TwitterIcon className='w-full h-full p-px text-white' />
                }
              >
                Compartir
              </Button>
              <Button
                as={Link}
                href={`https://www.linkedin.com/shareArticle?mini=true&url=https%3A//artdle.com/api/draw?id=${data.id}`}
                className='bg-[#0e76a8]'
                target='_blank'
                color='primary'
                startContent={
                  <LinkedinIcon className='w-full h-full p-px text-white' />
                }
              >
                Compartir
              </Button>
              <Button
                as={Link}
                href={`https://www.facebook.com/sharer/sharer.php?u=https%3A//artdle.com/api/draw?id=${data.id}`}
                className='bg-[#3b5998]'
                target='_blank'
                color='primary'
                startContent={
                  <FacebookIcon className='w-full h-full p-px text-white' />
                }
              >
                Compartir
              </Button>
              <Button
                as={Link}
                href={`https://wa.me/?text=Mira%20lo%20que%20he%20dibujado%20hoy%20en%20Artdle.com!%0ALa%20palabra%20de%20hoy%20es%20${dailyWord}%0Ahttps%3A%2F%2Fartdle.com%2Fapi%2Fdraw%3Fid%3D${data.id}`}
                className='bg-[#25D366]'
                target='_blank'
                color='primary'
                startContent={
                  <WhatsappIcon className='w-full h-full p-px text-white' />
                }
              >
                Compartir
              </Button>
            </section>
          </>
        )
      }
      name={'Compartir dibujo'}
      placement='top'
      description={
        'Puedes copiar el enlace al dibujo o compartirlo por redes sociales como Twitter'
      }
    />
  )
}

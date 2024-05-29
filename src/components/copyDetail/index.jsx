/* eslint-disable react/prop-types */
import { Snippet } from '@nextui-org/react'

export const CopyDetail = ({
  props,
  className = '',
  title = 'Titulo del copyDetail',
  toCopy = 'Copia esto'
}) => {
  return (
    <section
      className={`${className} flex flex-row w-full min-w-[300px] gap-4 justify-center items-center`}
    >
      <strong className='min-w-1/3 w-auto text-sm text-nowrap'>{title} </strong>
      <Snippet
        {...props}
        hideSymbol
        codeString={toCopy.toString()}
        className='w-full truncate items-center justify-end flex-row-reverse'
      >
        <strong className='truncate'>{toCopy}</strong>
      </Snippet>
    </section>
  )
}

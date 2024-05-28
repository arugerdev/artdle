import {
  Calendar,
  Select,
  SelectItem,
  Accordion,
  AccordionItem,
  Input
} from '@nextui-org/react'
import { Topbar } from '../../components/topbar/index'
import { useEffect, useState } from 'react'
import { getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { DrawList } from '../../components/drawList'
import { Toaster } from 'react-hot-toast'

export default function ExplorePage () {
  const [date, setDate] = useState(today(getLocalTimeZone()))
  const [orderBy, setOrderBy] = useState(['$.0'])
  const [filterName, setFilterName] = useState('')
  const [selectedKeys, setSelectedKeys] = useState(new Set(['1']))

  useEffect(() => {
    setSelectedKeys(new Set(['1']))
  }, [])

  return (
    <main className='flex flex-col gap-8 justify-start items-center h-full w-full min-w-screen min-h-screen'>
      <Toaster></Toaster>
      <Topbar />
      <section className='flex flex-col p-4 gap-4 w-full max-w-[1560px]'>
        <h1 className='text-4xl font-extrabold'>Explorar dibujos</h1>
        <h2 className='text-xl font-medium border-b-2 border-b-[#555] p-0'>
          Filtros
        </h2>
        <Accordion
          isCompact
          variant='shadow'
          title='Filtros'
          className='w-full'
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
        >
          <AccordionItem
            key='1'
            aria-label='Por nombre del dibujo'
            title='Por nombre del dibujo'
          >
            <Input
              className='my-4'
              placeholder='Dibujo de...'
              variant='faded'
              label={<strong>Nombre del dibujo</strong>}
              labelPlacement='outside'
              isClearable
              value={filterName}
              onValueChange={setFilterName}
            />
          </AccordionItem>
          <AccordionItem
            key='2'
            aria-label='Por día dibujado'
            title='Por día dibujado'
          >
            <Calendar
              minValue={parseDate('2024-05-21')}
              value={date}
              onChange={setDate}
              maxValue={today(getLocalTimeZone())}
            />
          </AccordionItem>
        </Accordion>

        <Select
          label='Ordenar por...'
          placeholder='Ordenar por...'
          defaultSelectedKeys={['date']}
          className='max-w-xs'
          selectedKeys={orderBy}
          onSelectionChange={setOrderBy}
        >
          <SelectItem value={'date'}>
            Fecha de creacción (Mas nuevos)
          </SelectItem>
          <SelectItem value={'disdate'}>
            Fecha de creacción (Mas viejos)
          </SelectItem>
          {/* <SelectItem value={'likes'}>Mejor valoración</SelectItem>
          <SelectItem value={'dislikes'}>Peor valoración</SelectItem> */}
        </Select>
      </section>

      <DrawList
        className='max-w-[1560px]'
        day={
          selectedKeys.currentKey == 2
            ? `${date.year}-${date.month}-${date.day}`
            : null
        }
        subscribe={false}
        orderBy={orderBy.currentKey}
        showDailyWord={selectedKeys.currentKey == 2}
        filterName={filterName === '' ? '*' : filterName}
      />
    </main>
  )
}

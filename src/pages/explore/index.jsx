import { Calendar, Select, SelectItem } from '@nextui-org/react'
import { Topbar } from '../../components/topbar/index'
import { useEffect, useState } from 'react'
import { getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { DrawList } from '../../components/draw-list'
import { Toaster } from 'react-hot-toast'

export default function ExplorePage () {
  const [date, setDate] = useState(today(getLocalTimeZone()))
  const [orderBy, setOrderBy] = useState(['$.0'])

  return (
    <main className='flex flex-col gap-8 justify-start items-center h-full w-full min-w-screen min-h-screen'>
      <Toaster></Toaster>
      <Topbar />
      <section className='flex flex-col p-4 gap-4'>
        <h1 className='text-4xl font-extrabold pb-12'>Explorar dibujos</h1>
        <Calendar
          minValue={parseDate('2024-05-21')}
          value={date}
          onChange={setDate}
          maxValue={today(getLocalTimeZone())}
        />
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
        day={`${date.year}-${date.month}-${date.day}`}
        subscribe={false}
        orderBy={orderBy.currentKey}
        showDailyWord
      />
    </main>
  )
}

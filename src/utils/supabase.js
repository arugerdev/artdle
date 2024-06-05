import { createClient } from '@supabase/supabase-js'
import toast from 'react-hot-toast'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

supabase.auth.getSession().then(data => {
  if (!data.data.session) {
    supabase.auth.signInAnonymously()
  }
})

export default supabase

export function getDailyWord (day) {
  return supabase
    .from('daily_word')
    .select('*')
    .eq('day', day)
    .then(data => {
      console.log (data.data)
      if (data.data.length > 0) {
      console.log (data.data)
        return data.data[0].word
      }
      else 
        toast('No existe palabra de este dia, lo sentimos...')
    })
    .catch(err => {
      toast.error('Ha ocurrido un error, intentalo mas tarde: ' + err)
    })
}
export function getUserData (id) {
  return supabase.auth.getUser(id).then(data => {
    return data
  })
}

export async function getAuthData () {
  return supabase.auth.getUser().then(user => {
    return user
  })
}

export async function loginWithGoogle () {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google'
  })

  if (error) throw error

  return data
}

export async function signOut () {
  const { data, error } = await supabase.auth.signOut()

  if (error) throw error

  return data
}

export function removeLike (user, data, setCounter) {
  setCounter(old => old - 1)
  supabase
    .from('likes')
    .delete()
    .eq('liked_by', user.data.user.id)
    .eq('liked_to', data.id)
    .then(() => {
      toast.success('Like quitado')
    })
    .catch(err => {
      toast.error('Ha ocurrido un error al intentar eliminar el like: ' + err)
    })
}

export function addLike (user, data, setCounter) {
  setCounter(old => old + 1)

  supabase
    .from('likes')
    .insert({ liked_by: user.data.user.id, liked_to: data.id })
    .then(() => {
      toast.success('Like añadido')
    })
    .catch(err => {
      toast.error('Ha ocurrido un error al intentar añadir el like: ' + err)
    })
}
export function sendReport (
  user,
  data,
  text,
  callBack = () => {},
  loading = () => {}
) {
  supabase
    .from('reports')
    .insert({
      report_text: text,
      draw_id: data.id,
      created_by: user.data.user.id
    })
    .then(() => {
      toast.success('Reporte enviado! ')
    })
    .catch(err => {
      toast.error('Ha ocurrido un error al enviar el reporte: ' + err)
    })
    .finally(() => {
      callBack()
      loading(false)
    })
}

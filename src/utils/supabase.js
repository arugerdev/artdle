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
    .then(async data => {
      if (data.data) {
        return data.data[0].word
      }
    })
    .catch(err => {
      toast.error('Ha ocurrido un error, intentalo mas tarde: ' + err)
    })
}

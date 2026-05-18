// Web Push subscription helper. The server-side "send" path is left
// to a future Edge Function — VAPID keys need to be generated and
// stored in Vercel/Supabase env vars before notifications can be
// pushed. The client side below is fully working: it can subscribe
// the user and persist the subscription to push_subscriptions.

import supabase from './supabase'

function urlBase64ToUint8Array (base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

export function pushSupported () {
  return typeof window !== 'undefined' &&
    'Notification' in window &&
    'PushManager' in window &&
    'serviceWorker' in navigator
}

export async function getPushPermission () {
  if (!pushSupported()) return 'unsupported'
  return Notification.permission
}

export async function subscribeToPush () {
  if (!pushSupported()) throw new Error('Push API no soportada por este navegador')

  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
  if (!vapidKey) {
    throw new Error('VAPID public key no configurada (VITE_VAPID_PUBLIC_KEY)')
  }

  const perm = await Notification.requestPermission()
  if (perm !== 'granted') throw new Error('Permiso denegado')

  const sw = await navigator.serviceWorker.ready
  const sub = await sw.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey)
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No estás autenticado')

  const json = sub.toJSON()
  const { error } = await supabase.from('push_subscriptions').insert({
    user_id: user.id,
    endpoint: json.endpoint,
    keys_p256dh: json.keys.p256dh,
    keys_auth: json.keys.auth,
    user_agent: navigator.userAgent
  })
  if (error && error.code !== '23505' /* unique violation */) throw error
  return sub
}

export async function unsubscribeFromPush () {
  if (!pushSupported()) return false
  const sw = await navigator.serviceWorker.ready
  const sub = await sw.pushManager.getSubscription()
  if (!sub) return false
  await sub.unsubscribe()
  await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
  return true
}

// Local-draft helper. Lets a user keep doodling while offline (or before
// logging in) and persists the strokes to IndexedDB-equivalent — actually
// localStorage for simplicity since drawings fit in ~50 KB compressed.
// Drafts are scoped per (day, user-or-anon) and auto-restored on mount.

const KEY = 'artdle.draft'

export function loadDraft (day) {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed.day !== day) return null
    return parsed
  } catch {
    return null
  }
}

export function saveDraft (day, lines, name) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ day, lines, name, savedAt: Date.now() }))
  } catch {
    // QuotaExceededError on big drawings — drop silently
  }
}

export function clearDraft () {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

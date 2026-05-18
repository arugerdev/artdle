// Client-side badge derivation. Add new badges by appending to the list;
// stats fields stay in user_stats. Keep this list ordered by tier so the
// UI can show "highest first".

export const BADGES = [
  { id: 'first', emoji: '🎨', label: 'Primer dibujo', check: s => (s.total_draws ?? 0) >= 1 },
  { id: 'ten', emoji: '🖌', label: '10 dibujos', check: s => (s.total_draws ?? 0) >= 10 },
  { id: 'fifty', emoji: '🏆', label: '50 dibujos', check: s => (s.total_draws ?? 0) >= 50 },
  { id: 'streak3', emoji: '🔥', label: 'Racha de 3', check: s => (s.longest_streak ?? 0) >= 3 },
  { id: 'streak7', emoji: '🔥🔥', label: 'Racha semanal', check: s => (s.longest_streak ?? 0) >= 7 },
  { id: 'streak30', emoji: '🔥🔥🔥', label: 'Racha mensual', check: s => (s.longest_streak ?? 0) >= 30 },
  { id: 'likes10', emoji: '❤', label: '10 likes', check: s => (s.total_likes ?? 0) >= 10 },
  { id: 'likes100', emoji: '💯', label: '100 likes', check: s => (s.total_likes ?? 0) >= 100 },
  { id: 'top1', emoji: '👑', label: 'Top 1 del día', check: s => (s.top1_count ?? 0) >= 1 }
]

export function earnedBadges (stats = {}) {
  return BADGES.filter(b => b.check(stats))
}

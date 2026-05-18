// Icon set powered by lucide-react. Names kept identical to the original
// hand-rolled SVGs so every consumer keeps working without import edits.
// Lucide icons are rounded by default (stroke-linecap: round, linejoin:
// round) and respond to className for sizing.

import {
  Pencil,
  Eraser,
  PaintBucket,
  Trash2,
  Undo2,
  Redo2,
  Download,
  Send,
  Pipette,
  Heart,
  MoreHorizontal,
  Info,
  Flag,
  Share2,
  Play,
  Slash,
  Square,
  FileCode2
} from 'lucide-react'

// Lucide accepts width/height props that override `size`. Setting both to
// '1em' makes the icon scale with the parent's font-size — and any className
// like `w-6 h-6` still wins, which is what the rest of the app relies on.
const baseProps = {
  width: '1em',
  height: '1em',
  strokeWidth: 1.75,
  'aria-hidden': true,
  focusable: false,
  role: 'presentation'
}

const wrap = (Lc, extra = {}) => {
  const Wrapped = props => <Lc {...baseProps} {...extra} {...props} />
  Wrapped.displayName = `Icon(${Lc.displayName ?? Lc.name ?? 'lucide'})`
  return Wrapped
}

export const PencilIcon = wrap(Pencil)
export const EraserIcon = wrap(Eraser)
export const BucketIcon = wrap(PaintBucket)
export const PaperIcon = wrap(Trash2) // "clear" action
export const UndoIcon = wrap(Undo2)
export const RedoIcon = wrap(Redo2)
export const DownloadIcon = wrap(Download)
export const SendIcon = wrap(Send)
export const ColoPickerIcon = wrap(Pipette) // legacy typo name kept
export const HeartIcon = wrap(Heart)
export const FilledHeartIcon = wrap(Heart, { fill: 'currentColor' })
export const OptionsIcon = wrap(MoreHorizontal)
export const InfoIcon = wrap(Info)
export const ReportIcon = wrap(Flag)
export const ShareIcon = wrap(Share2)
export const PlayIcon = wrap(Play, { fill: 'currentColor' })
export const LineIcon = wrap(Slash)
export const RectIcon = wrap(Square)
export const SvgExportIcon = wrap(FileCode2)

// Brand glyphs intentionally NOT switched to Lucide — recognisability
// matters more than visual consistency for social share buttons.
export const TwitterIcon = props => (
  <svg
    aria-hidden='true'
    fill='none'
    focusable='false'
    height='1em'
    role='presentation'
    viewBox='0 0 24 24'
    width='1em'
    {...props}
  >
    <path
      d='M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z'
      fill='currentColor'
    />
  </svg>
)
export const WhatsappIcon = props => (
  <svg
    aria-hidden='true'
    fill='none'
    focusable='false'
    height='1em'
    role='presentation'
    viewBox='0 0 24 24'
    width='1em'
    {...props}
  >
    <path
      d='M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z'
      fill='currentColor'
    />
  </svg>
)
export const FacebookIcon = props => (
  <svg
    aria-hidden='true'
    fill='none'
    focusable='false'
    height='1em'
    role='presentation'
    viewBox='0 0 24 24'
    width='1em'
    {...props}
  >
    <path
      d='M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z'
      fill='currentColor'
    />
  </svg>
)
export const LinkedinIcon = props => (
  <svg
    aria-hidden='true'
    fill='none'
    focusable='false'
    height='1em'
    role='presentation'
    viewBox='0 0 24 24'
    width='1em'
    {...props}
  >
    <path
      d='M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z'
      fill='currentColor'
    />
  </svg>
)

// Phosphor-backed icon set. Defaults to weight="duotone" — rounded
// filled-secondary with a bold outline, very iOS-native. Component
// names are kept identical to previous exports so callers don't need
// to change anything.

import {
  Pencil,
  Eraser,
  PaintBucket,
  Trash,
  ArrowCounterClockwise,
  ArrowClockwise,
  DownloadSimple,
  PaperPlaneTilt,
  Eyedropper,
  Heart,
  DotsThree,
  Info,
  Flag,
  ShareNetwork,
  Play,
  LineSegment,
  Square,
  FileSvg,
  Sun,
  Moon,
  DesktopTower,
  TwitterLogo,
  FacebookLogo,
  LinkedinLogo,
  WhatsappLogo
} from '@phosphor-icons/react'

const baseProps = {
  weight: 'duotone',
  size: 18,
  'aria-hidden': true
}

const wrap = (Ic, extra = {}) => {
  const W = props => <Ic {...baseProps} {...extra} {...props} />
  W.displayName = `Icon(${Ic.displayName ?? Ic.name ?? 'phosphor'})`
  return W
}

export const PencilIcon = wrap(Pencil)
export const EraserIcon = wrap(Eraser)
export const BucketIcon = wrap(PaintBucket)
export const PaperIcon = wrap(Trash)          // "clear" action
export const UndoIcon = wrap(ArrowCounterClockwise)
export const RedoIcon = wrap(ArrowClockwise)
export const DownloadIcon = wrap(DownloadSimple)
export const SendIcon = wrap(PaperPlaneTilt, { weight: 'fill' })
export const ColoPickerIcon = wrap(Eyedropper) // legacy typo kept
export const HeartIcon = wrap(Heart)
export const FilledHeartIcon = wrap(Heart, { weight: 'fill' })
export const OptionsIcon = wrap(DotsThree, { weight: 'bold' })
export const InfoIcon = wrap(Info)
export const ReportIcon = wrap(Flag)
export const ShareIcon = wrap(ShareNetwork)
export const PlayIcon = wrap(Play, { weight: 'fill' })
export const LineIcon = wrap(LineSegment)
export const RectIcon = wrap(Square)
export const SvgExportIcon = wrap(FileSvg)
export const SunIcon = wrap(Sun, { weight: 'fill' })
export const MoonIcon = wrap(Moon, { weight: 'fill' })
export const MonitorIcon = wrap(DesktopTower)

// Brand logos — Phosphor has its own brand glyphs, use those for consistency
export const TwitterIcon = wrap(TwitterLogo, { weight: 'fill' })
export const FacebookIcon = wrap(FacebookLogo, { weight: 'fill' })
export const LinkedinIcon = wrap(LinkedinLogo, { weight: 'fill' })
export const WhatsappIcon = wrap(WhatsappLogo, { weight: 'fill' })

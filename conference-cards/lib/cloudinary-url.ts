// Client-safe helper to inject Cloudinary delivery transformations into existing URLs
// Adds f_auto,q_auto and optional width cap using c_limit,w_{width}
// Only modifies URLs that point to res.cloudinary.com and contain /image/upload/

export interface CloudinaryOptimizeOptions {
  width?: number // desired width or max width cap (with c_limit)
  quality?: 'auto' | number
  format?: 'auto' | string
  crop?: 'limit' | 'fill' | 'fit' | string
}

const UPLOAD_SEGMENT = '/image/upload/'

function isCloudinaryUrl(url: string): boolean {
  try {
    const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
    return u.hostname.endsWith('res.cloudinary.com') && u.pathname.includes(UPLOAD_SEGMENT)
  } catch {
    return false
  }
}

export function optimizeCloudinaryUrl(src: string, options: CloudinaryOptimizeOptions = {}): string {
  if (!src || !isCloudinaryUrl(src)) return src

  const { width, quality = 'auto', format = 'auto', crop = 'limit' } = options

  // Split at /image/upload/
  const index = src.indexOf(UPLOAD_SEGMENT)
  if (index === -1) return src

  const prefix = src.slice(0, index + UPLOAD_SEGMENT.length) // includes trailing '/'
  const suffix = src.slice(index + UPLOAD_SEGMENT.length)

  // Build our transform segment
  const parts: string[] = []
  if (format) parts.push(`f_${format}`)
  if (quality) parts.push(`q_${quality}`)
  if (width && width > 0) parts.push(`c_${crop}`, `w_${Math.round(width)}`)

  const transform = parts.join(',')
  if (!transform) return src

  // Inspect existing first segment after upload (if any)
  const firstSegment = suffix.split('/')[0] || ''
  const hasVersionAsFirst = /^v\d+$/.test(firstSegment)

  // Avoid duplicating if existing segment already includes f_auto or q_auto and width
  const alreadyHasF = /(^|,)f_\w+/.test(firstSegment)
  const alreadyHasQ = /(^|,)q_\w+/.test(firstSegment)
  const alreadyHasW = /(^|,)w_\d+/.test(firstSegment)

  let finalTransform = transform
  if (alreadyHasF || alreadyHasQ || alreadyHasW) {
    // Merge intelligently: only add missing directives
    const req: string[] = []
    if (!alreadyHasF && format) req.push(`f_${format}`)
    if (!alreadyHasQ && quality) req.push(`q_${quality}`)
    if (!alreadyHasW && width && width > 0) req.push(`c_${crop}`, `w_${Math.round(width)}`)
    if (req.length === 0) return src // nothing to add
    finalTransform = req.join(',')
  }

  // Inject our transform before the existing first meaningful segment
  // If the first segment is a version (v123...), we insert before it
  // Otherwise, there are existing transforms; prepend ours as another segment
  if (hasVersionAsFirst) {
    return `${prefix}${finalTransform}/${suffix}`
  } else {
    return `${prefix}${finalTransform}/${suffix}`
  }
}

import type { SupabaseClient } from '@supabase/supabase-js'

const MANAGED_BUCKETS = new Set([
  'blog-media',
  'book-review-media',
  'event-media',
  'gallery-media',
])

export function storagePathFromPublicUrl(url: string | null, bucket: string) {
  if (!url || !MANAGED_BUCKETS.has(bucket)) return null

  try {
    const marker = `/storage/v1/object/public/${bucket}/`
    const pathname = new URL(url).pathname
    const markerIndex = pathname.indexOf(marker)
    if (markerIndex === -1) return null
    const path = decodeURIComponent(pathname.slice(markerIndex + marker.length))
    return path && !path.startsWith('/') && !path.includes('..') ? path : null
  } catch {
    return null
  }
}

export async function removeManagedFiles(
  supabase: SupabaseClient,
  bucket: string,
  paths: Array<string | null | undefined>
) {
  const safePaths = paths.filter((path): path is string => Boolean(path && !path.includes('..')))
  if (!safePaths.length) return null

  const { error } = await supabase.storage.from(bucket).remove(safePaths)
  return error
}


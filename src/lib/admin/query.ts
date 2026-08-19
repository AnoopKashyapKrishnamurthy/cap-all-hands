export const ADMIN_PAGE_SIZE = 10
export const ADMIN_GALLERY_PAGE_SIZE = 12

export function parseAdminPage(value: string | string[] | undefined) {
  const parsed = Number(Array.isArray(value) ? value[0] : value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

export function cleanSearch(value: string | string[] | undefined) {
  const input = Array.isArray(value) ? value[0] : value
  return (input ?? '').trim().replace(/[,%()]/g, '').slice(0, 80)
}

export function getPageRange(page: number, pageSize = ADMIN_PAGE_SIZE) {
  const from = (page - 1) * pageSize
  return { from, to: from + pageSize - 1 }
}

export function totalPages(count: number | null, pageSize = ADMIN_PAGE_SIZE) {
  return Math.max(1, Math.ceil((count ?? 0) / pageSize))
}


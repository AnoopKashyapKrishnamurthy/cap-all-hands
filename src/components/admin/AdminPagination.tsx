import Link from 'next/link'

export default function AdminPagination({
  page,
  pages,
  searchParams,
}: {
  page: number
  pages: number
  searchParams: Record<string, string>
}) {
  if (pages <= 1) return null
  const hrefFor = (nextPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(nextPage))
    return `?${params.toString()}`
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
      <Link aria-disabled={page <= 1} tabIndex={page <= 1 ? -1 : undefined} href={hrefFor(Math.max(1, page - 1))} className={page <= 1 ? 'pointer-events-none text-slate-300' : 'font-medium text-slate-700 hover:text-orange-600'}>Previous</Link>
      <span className="text-slate-500">Page {page} of {pages}</span>
      <Link aria-disabled={page >= pages} tabIndex={page >= pages ? -1 : undefined} href={hrefFor(Math.min(pages, page + 1))} className={page >= pages ? 'pointer-events-none text-slate-300' : 'font-medium text-slate-700 hover:text-orange-600'}>Next</Link>
    </nav>
  )
}


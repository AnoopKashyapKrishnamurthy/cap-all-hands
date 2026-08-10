import { Skeleton } from '@/components/loading/LoadingPrimitives'

export default function AdminSkeleton({ cards = false }: { cards?: boolean }) {
  return (
    <div className="space-y-6" role="status" aria-busy="true" aria-label="Loading admin content">
      <div><Skeleton className="h-8 w-52" /><Skeleton className="mt-3 h-4 w-80 max-w-full" /></div>
      {cards && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-32" />)}</div>}
      <Skeleton className="h-16" />
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="flex gap-4 border-b border-slate-100 py-4 last:border-0"><Skeleton className="h-10 w-10 shrink-0 rounded-full" /><div className="flex-1"><Skeleton className="h-4 w-1/3" /><Skeleton className="mt-2 h-3 w-1/2" /></div></div>)}</div>
    </div>
  )
}

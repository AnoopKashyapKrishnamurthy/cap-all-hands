'use client'

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
      <h2 className="font-bold text-red-800">The Admin Control Center could not be loaded</h2>
      <p className="mt-2 text-sm text-red-700">No changes were made. Please try again.</p>
      <button type="button" onClick={reset} className="mt-5 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">Try again</button>
    </div>
  )
}


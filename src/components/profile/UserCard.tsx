import Link from 'next/link'

export interface DirectoryUser {
  id: string
  email: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  created_at: string | null
}

interface UserCardProps {
  user: DirectoryUser
  showEmail?: boolean
}

function getBioPreview(bio: string | null, maxLength = 120) {
  if (!bio) return 'No bio added yet.'
  const trimmed = bio.trim()
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength)}...`
}

export default function UserCard({ user, showEmail = true }: UserCardProps) {
  const initial = (user.display_name || user.email || 'U').charAt(0).toUpperCase()

  return (
    <article className="bg-white border rounded-2xl shadow-sm p-6 h-full flex flex-col hover:shadow-md transition">
      <div className="flex items-start gap-4">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.display_name}
            className="h-14 w-14 rounded-full object-cover ring-2 ring-blue-100"
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-blue-600 text-white text-lg font-semibold flex items-center justify-center">
            {initial}
          </div>
        )}

        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {user.display_name}
          </h2>
          {showEmail && (
            <p className="text-sm text-gray-500 break-all">
              {user.email}
            </p>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-600 leading-relaxed">
        {getBioPreview(user.bio)}
      </p>

      <div className="mt-auto pt-6">
        <Link
          href={`/people/${user.id}`}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View full profile
        </Link>
      </div>
    </article>
  )
}

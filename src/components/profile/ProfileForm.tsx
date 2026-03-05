'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ProfileData {
  id: string
  email: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  created_at: string | null
}

interface ProfileFormProps {
  initialProfile: ProfileData
}

const AVATAR_BUCKET = 'avatars'

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [displayName, setDisplayName] = useState(initialProfile.display_name || '')
  const [bio, setBio] = useState(initialProfile.bio || '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialProfile.avatar_url)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const createdDate = useMemo(() => {
    if (!initialProfile.created_at) return 'Unknown'
    return new Date(initialProfile.created_at).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }, [initialProfile.created_at])

  const avatarInitial = (displayName || initialProfile.email || 'U')
    .charAt(0)
    .toUpperCase()

  const shownAvatar = previewUrl || avatarUrl

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setError(null)
    setSuccess(null)
    setAvatarFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    const trimmedDisplayName = displayName.trim()
    const trimmedBio = bio.trim()

    if (!trimmedDisplayName) {
      setError('Display name is required.')
      return
    }

    setLoading(true)

    try {
      let nextAvatarUrl = avatarUrl

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()?.toLowerCase() || 'jpg'
        const baseName = avatarFile.name.replace(/\.[^/.]+$/, '')
        const safeBaseName = baseName.replace(/[^a-zA-Z0-9_-]/g, '-')
        const filePath = `${initialProfile.id}/${Date.now()}-${safeBaseName}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from(AVATAR_BUCKET)
          .upload(filePath, avatarFile, {
            upsert: true,
            contentType: avatarFile.type,
          })

        if (uploadError) {
          throw new Error(uploadError.message)
        }

        const { data: publicData } = supabase.storage
          .from(AVATAR_BUCKET)
          .getPublicUrl(filePath)

        nextAvatarUrl = publicData.publicUrl
      }

      const { error: upsertError } = await supabase
        .from('user_profiles')
        .upsert(
          {
            id: initialProfile.id,
            email: initialProfile.email,
            display_name: trimmedDisplayName,
            bio: trimmedBio || null,
            avatar_url: nextAvatarUrl,
          },
          { onConflict: 'id' }
        )

      if (upsertError) {
        throw new Error(upsertError.message)
      }

      setAvatarUrl(nextAvatarUrl)
      setAvatarFile(null)
      setPreviewUrl(null)
      setSuccess('Profile updated successfully.')
      router.refresh()
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Failed to update profile. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <aside className="bg-white border rounded-2xl shadow-sm p-6 sm:p-8 space-y-6 h-fit">
        <div className="flex flex-col items-center text-center gap-4">
          {shownAvatar ? (
            <img
              src={shownAvatar}
              alt={displayName || initialProfile.email}
              className="h-28 w-28 rounded-full object-cover ring-4 ring-blue-100"
            />
          ) : (
            <div className="h-28 w-28 rounded-full bg-blue-600 text-white text-4xl font-semibold flex items-center justify-center">
              {avatarInitial}
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {displayName || 'No name'}
            </h2>
            <p className="text-sm text-gray-500 break-all">{initialProfile.email}</p>
          </div>
        </div>

        <div className="border-t pt-5 space-y-2">
          <p className="text-xs uppercase tracking-wide text-gray-400">Account created</p>
          <p className="text-sm text-gray-700">{createdDate}</p>
        </div>
      </aside>

      <section className="bg-white border rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Edit profile</h3>
          <p className="text-sm text-gray-500 mt-1">
            Update your public details and avatar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="input-field"
                maxLength={255}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={initialProfile.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-900 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={5}
                maxLength={800}
                placeholder="Tell your team a bit about yourself."
              />
              <p className="mt-1 text-xs text-gray-400">{bio.length}/800</p>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="avatar"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Avatar
              </label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-xs text-gray-400">
                Upload a square image for best results.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

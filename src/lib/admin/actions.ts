'use server'

import { revalidatePath } from 'next/cache'
import { protectAdminRoute, type UserRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { removeManagedFiles, storagePathFromPublicUrl } from './storage'
import type { AdminActionResult } from './types'

const roles: UserRole[] = ['user', 'moderator', 'admin']

function failure(message: string): AdminActionResult {
  return { ok: false, message }
}

function success(message: string): AdminActionResult {
  return { ok: true, message }
}

export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<AdminActionResult> {
  try {
    const { user } = await protectAdminRoute()
    if (!userId || !roles.includes(role)) return failure('Choose a valid role.')
    if (userId === user.id) return failure('You cannot change your own administrator role.')

    const supabase = await createClient()
    const { data: target, error: targetError } = await supabase
      .from('user_profiles')
      .select('id, role')
      .eq('id', userId)
      .maybeSingle()

    if (targetError || !target) return failure('The selected user could not be found.')
    if (target.role === role) return success('The user already has this role.')

    const { data: updated, error } = await supabase
      .from('user_profiles')
      .update({ role })
      .eq('id', userId)
      .select('id')
      .maybeSingle()
    if (error) throw error
    if (!updated) return failure('The database did not permit this role change.')

    revalidatePath('/admin/users')
    revalidatePath('/admin')
    revalidatePath('/', 'layout')
    return success('User role updated.')
  } catch (error) {
    console.error('Admin role update failed:', error)
    return failure('Unable to update the role. Check the admin database policy and try again.')
  }
}

export async function setBlogPublished(
  blogId: string,
  published: boolean
): Promise<AdminActionResult> {
  try {
    await protectAdminRoute()
    if (!blogId || typeof published !== 'boolean') return failure('Invalid blog update.')
    const supabase = await createClient()
    const { data: blog, error: lookupError } = await supabase
      .from('blogs')
      .select('slug')
      .eq('id', blogId)
      .maybeSingle()
    if (lookupError || !blog) return failure('The blog could not be found.')

    const { data: updated, error } = await supabase
      .from('blogs')
      .update({ published })
      .eq('id', blogId)
      .select('id')
      .maybeSingle()
    if (error) throw error
    if (!updated) return failure('The database did not permit this blog update.')

    revalidatePath('/admin')
    revalidatePath('/admin/blogs')
    revalidatePath('/blogs')
    revalidatePath('/dashboard')
    revalidatePath(`/blogs/${blog.slug}`)
    return success(published ? 'Blog published.' : 'Blog moved to drafts.')
  } catch (error) {
    console.error('Admin blog status update failed:', error)
    return failure('Unable to update the blog. Check the admin database policy and try again.')
  }
}

export async function deleteBlog(blogId: string): Promise<AdminActionResult> {
  try {
    await protectAdminRoute()
    const supabase = await createClient()
    const { data: blog, error: lookupError } = await supabase
      .from('blogs')
      .select('slug, cover_image')
      .eq('id', blogId)
      .maybeSingle()
    if (lookupError || !blog) return failure('The blog could not be found.')

    const { error: interactionError } = await supabase
      .from('interactions')
      .delete()
      .eq('target_type', 'blogs')
      .eq('target_id', blogId)
    if (interactionError) throw interactionError

    const { data: deleted, error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', blogId)
      .select('id')
      .maybeSingle()
    if (error) throw error
    if (!deleted) return failure('The database did not permit this blog deletion.')

    const storageError = await removeManagedFiles(supabase, 'blog-media', [
      storagePathFromPublicUrl(blog.cover_image, 'blog-media'),
    ])
    revalidatePath('/admin')
    revalidatePath('/admin/blogs')
    revalidatePath('/blogs')
    revalidatePath('/dashboard')
    revalidatePath(`/blogs/${blog.slug}`)
    return success(storageError ? 'Blog deleted; its media could not be removed.' : 'Blog deleted.')
  } catch (error) {
    console.error('Admin blog deletion failed:', error)
    return failure('Unable to delete the blog. Check the admin database policy and try again.')
  }
}

export async function deleteReview(reviewId: string): Promise<AdminActionResult> {
  try {
    await protectAdminRoute()
    const supabase = await createClient()
    const { data: review, error: lookupError } = await supabase
      .from('book_reviews')
      .select('media_urls')
      .eq('id', reviewId)
      .maybeSingle()
    if (lookupError || !review) return failure('The review could not be found.')

    const { error: interactionError } = await supabase
      .from('interactions')
      .delete()
      .eq('target_type', 'book_reviews')
      .eq('target_id', reviewId)
    if (interactionError) throw interactionError

    const { data: deleted, error } = await supabase
      .from('book_reviews')
      .delete()
      .eq('id', reviewId)
      .select('id')
      .maybeSingle()
    if (error) throw error
    if (!deleted) return failure('The database did not permit this review deletion.')

    const urls = Array.isArray(review.media_urls) ? review.media_urls : []
    const storageError = await removeManagedFiles(
      supabase,
      'book-review-media',
      urls.map((url) => storagePathFromPublicUrl(url, 'book-review-media'))
    )
    revalidatePath('/admin')
    revalidatePath('/admin/reviews')
    revalidatePath('/reviews')
    revalidatePath('/dashboard')
    return success(storageError ? 'Review deleted; some media could not be removed.' : 'Review deleted.')
  } catch (error) {
    console.error('Admin review deletion failed:', error)
    return failure('Unable to delete the review. Check the admin database policy and try again.')
  }
}

export async function deleteEvent(eventId: string): Promise<AdminActionResult> {
  try {
    await protectAdminRoute()
    const supabase = await createClient()
    const { data: event, error: lookupError } = await supabase
      .from('events')
      .select('image_storage_path')
      .eq('id', eventId)
      .maybeSingle()
    if (lookupError || !event) return failure('The event could not be found.')

    const { error: interactionError } = await supabase
      .from('interactions')
      .delete()
      .eq('target_type', 'events')
      .eq('target_id', eventId)
    if (interactionError) throw interactionError

    const { data: deleted, error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
      .select('id')
      .maybeSingle()
    if (error) throw error
    if (!deleted) return failure('The database did not permit this event deletion.')

    const storageError = await removeManagedFiles(supabase, 'event-media', [event.image_storage_path])
    revalidatePath('/admin')
    revalidatePath('/admin/events')
    revalidatePath('/events')
    return success(storageError ? 'Event deleted; its image could not be removed.' : 'Event deleted.')
  } catch (error) {
    console.error('Admin event deletion failed:', error)
    return failure('Unable to delete the event. Check the admin database policy and try again.')
  }
}

export async function deleteGalleryItem(itemId: string): Promise<AdminActionResult> {
  try {
    await protectAdminRoute()
    const supabase = await createClient()
    const { data: item, error: lookupError } = await supabase
      .from('gallery_items')
      .select('image_url')
      .eq('id', itemId)
      .maybeSingle()
    if (lookupError || !item) return failure('The gallery item could not be found.')

    const { error: interactionError } = await supabase
      .from('interactions')
      .delete()
      .eq('target_type', 'gallery')
      .eq('target_id', itemId)
    if (interactionError) throw interactionError

    const { data: deleted, error } = await supabase
      .from('gallery_items')
      .delete()
      .eq('id', itemId)
      .select('id')
      .maybeSingle()
    if (error) throw error
    if (!deleted) return failure('The database did not permit this gallery deletion.')

    const storageError = await removeManagedFiles(supabase, 'gallery-media', [
      storagePathFromPublicUrl(item.image_url, 'gallery-media'),
    ])
    revalidatePath('/admin')
    revalidatePath('/admin/gallery')
    revalidatePath('/gallery')
    return success(storageError ? 'Gallery item deleted; its image could not be removed.' : 'Gallery item deleted.')
  } catch (error) {
    console.error('Admin gallery deletion failed:', error)
    return failure('Unable to delete the gallery item. Check the admin database policy and try again.')
  }
}

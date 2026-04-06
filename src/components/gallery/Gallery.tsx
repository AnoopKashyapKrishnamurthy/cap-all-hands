'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { TargetType } from '@/lib/types'

export async function toggleLike(targetId: string, currentUserId: string) {
    const supabase = await createClient()

    const { data: existing } = await supabase
        .from('interactions')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('target_id', targetId)
        .eq('target_type', 'gallery')
        .eq('interaction_type', 'like')
        .maybeSingle()

    if (existing) {
        await supabase.from('interactions').delete().eq('id', existing.id)
    } else {
        await supabase.from('interactions').insert({
            user_id: currentUserId,
            target_id: targetId,
            target_type: 'gallery' as TargetType,
            interaction_type: 'like',
            payload: {},
        })
    }

    revalidatePath('/gallery')
}

export async function addComment(targetId: string, text: string, currentUserId: string) {
    if (!text.trim()) return

    const supabase = await createClient()

    await supabase.from('interactions').insert({
        user_id: currentUserId,
        target_id: targetId,
        target_type: 'gallery' as TargetType,
        interaction_type: 'comment',
        payload: { text: text.trim() },
    })

    revalidatePath('/gallery')
}

export async function deleteComment(commentId: string, currentUserId: string) {
    const supabase = await createClient()

    await supabase
        .from('interactions')
        .delete()
        .eq('id', commentId)
        .eq('user_id', currentUserId)

    revalidatePath('/gallery')
}
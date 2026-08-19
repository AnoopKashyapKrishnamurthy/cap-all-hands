import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hasLoginAccess } from '@/lib/access-control'

async function ensureLoginAccess(supabase: Awaited<ReturnType<typeof createClient>>, origin: string) {
  const access = await hasLoginAccess(supabase)
  if (access.allowed) return null

  await supabase.auth.signOut()
  const message = access.error
    ? 'Unable to verify account access'
    : 'Your account access has been disabled. Contact an administrator.'
  return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, origin))
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') || '/reset-password'

  const safeNext = next.startsWith('/') ? next : '/reset-password'

  // PKCE flow — newer Supabase default
  if (code) {
    const supabase = await createClient()

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const deniedResponse = await ensureLoginAccess(supabase, origin)
      if (deniedResponse) return deniedResponse
      return NextResponse.redirect(new URL(safeNext, origin))
    }

    console.error('PKCE exchange error:', error.message)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, origin)
    )
  }

  // Legacy token_hash flow — older emails or magic link
  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type: type as 'recovery' | 'signup' | 'email',
      token_hash,
    })

    if (!error) {
      const deniedResponse = await ensureLoginAccess(supabase, origin)
      if (deniedResponse) return deniedResponse
      return NextResponse.redirect(new URL(safeNext, origin))
    }

    console.error('OTP verify error:', error.message)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, origin)
    )
  }

  return NextResponse.redirect(
    new URL('/login?error=Invalid or expired reset link', origin)
  )
}

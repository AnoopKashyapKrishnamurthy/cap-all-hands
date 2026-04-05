import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
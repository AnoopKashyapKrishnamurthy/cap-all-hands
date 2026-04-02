import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') || '/reset-password'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type: type as 'recovery' | 'signup' | 'email',
      token_hash,
    })

    if (!error) {
      // Session is now set in cookies — redirect to the form
      const safeNext = next.startsWith('/') ? next : '/reset-password'
      return NextResponse.redirect(new URL(safeNext, origin))
    }
  }

  return NextResponse.redirect(
    new URL('/login?error=Invalid or expired reset link', origin)
  )
}
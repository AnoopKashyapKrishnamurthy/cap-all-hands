import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * OAuth callback handler
 * - Exchanges auth code for session
 * - Handles errors safely
 * - Redirects user appropriately
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const next = searchParams.get('next') || '/dashboard'

  // 🔴 If OAuth provider returned an error
  if (error) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(
          errorDescription || error
        )}`,
        origin
      )
    )
  }

  // 🟢 If we received an authorization code
  if (code) {
    try {
      const supabase = await createClient()

      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        throw exchangeError
      }


      // Safe redirect (prevent open redirect attacks)
      const safeRedirect =
        next.startsWith('/') ? next : '/dashboard'

      return NextResponse.redirect(new URL(safeRedirect, origin))

    } catch (err) {
      return NextResponse.redirect(
        new URL('/login?error=Authentication failed', origin)
      )
    }
  }

  // 🟡 Fallback
  return NextResponse.redirect(new URL('/login', origin))
}
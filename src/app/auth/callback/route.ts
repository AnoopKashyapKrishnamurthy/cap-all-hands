import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Auth callback route for OAuth providers
 * Handles the redirect after user authenticates with OAuth provider
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');

  // If there's an error in the callback, redirect to login with error message
  if (error) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(error_description || error)}`,
        request.url
      )
    );
  }

  // Exchange the code for a session
  if (code) {
    try {
      const supabase = await createClient();
      await supabase.auth.exchangeCodeForSession(code);
      
      // Redirect to dashboard on success
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      // Log error in production through server logs only
      // Do not expose error details to client
      return NextResponse.redirect(
        new URL(
          '/login?error=Authentication failed',
          request.url
        )
      );
    }
  }

  // If no code or error, redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
}

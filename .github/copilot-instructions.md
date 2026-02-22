# CAP All-Hands - Development Guidelines

## Project Type
Production-ready internal team collaboration app using Next.js 15 (App Router), TypeScript, and Supabase.

## Architecture Overview

This is a **server-side session validation architecture** (proxy pattern):
- No middleware used for authentication
- Protected routes validate sessions server-side
- Secure Supabase SSR client for cookie management
- Server and client components properly separated
- Full TypeScript type safety

## Key Principles

1. **Server-Side Session Validation**: Session checks happen in server components using `protectRoute()` and `getCurrentUser()`
2. **Client/Server Separation**: Client components handle forms, server components handle auth logic
3. **Security First**: No credentials exposed to client, proper error handling, HTTPS in production
4. **Production Ready**: Proper error handling, logging, TypeScript strict mode
5. **Type Safety**: Full TypeScript with no `any` types, strict mode enabled

## Important Directories

- `src/lib/supabase/` - Supabase client configuration
- `src/lib/auth/` - Authentication utilities (server-side)
- `src/components/auth/` - Auth UI components (client-side)
- `src/app/` - App Router pages and layouts

## Development Rules

- Always use server components for auth logic
- Use `ssr` package from @supabase/ssr for cookie management
- Never store auth tokens in localStorage
- Use `protectRoute()` for protected pages
- Use `createClient()` from server or client based on location
- Proper async/await with error handling

## Deployment

- Vercel-ready (no special configuration needed)
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Supabase redirect URLs must include Vercel domain

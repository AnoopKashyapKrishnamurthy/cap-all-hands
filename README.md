# CAP All-Hands Setup & Development

## Project Overview

Production-ready internal team collaboration app built with:
- Next.js 15 (App Router)
- TypeScript
- Supabase (Authentication)
- Tailwind CSS
- Server-side session validation (proxy pattern, no middleware)

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles (Tailwind)
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── register/
│   │   └── page.tsx            # Register page
│   ├── dashboard/
│   │   └── page.tsx            # Protected dashboard
│   └── auth/
│       └── callback.ts         # OAuth callback (optional)
├── components/
│   └── auth/
│       ├── LoginForm.tsx       # Client login form
│       ├── RegisterForm.tsx    # Client registration form
│       └── LogoutButton.tsx    # Client logout button
└── lib/
    ├── auth/
    │   └── index.ts            # Auth utilities (server)
    └── supabase/
        ├── client.ts           # Browser Supabase client
        └── server.ts           # Server-side Supabase client
```

## Development Setup

### Prerequisites
- Node.js 18+ (preferably 20+)
- npm, yarn, or pnpm
- Supabase account (free tier available)
- Git

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your project credentials:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - Anon Key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)

3. Update `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Enable Email/Password Authentication in Supabase

1. In Supabase dashboard: Settings → Authentication
2. Enable "Email" provider
3. Configure email settings if needed

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Key Features

### ✅ Phase 1 Features Implemented

- **Email/Password Registration** - Secure account creation
- **Email/Password Login** - Session-based authentication
- **Protected Dashboard** - Server-side session validation
- **Session Persistence** - Automatic session recovery
- **Logout Functionality** - Secure session termination
- **Server-side Auth** - Proxy pattern validation (no middleware)
- **Production-Ready** - Error handling, proper TypeScript, clean architecture

### Architecture Decisions

#### No Middleware for Auth

Instead of middleware, we use:
- Server component validation in protected routes
- `protectRoute()` function that redirects to `/login` if unauthenticated
- `getSession()` and `getCurrentUser()` server-side utilities
- Supabase SSR client for secure cookie management

#### Server vs Client

- **Server Components**: Dashboard, Auth utilities, Session validation
- **Client Components**: LoginForm, RegisterForm, LogoutButton (form interactions)
- **Separation**: Clear boundaries with proper async/await handling

#### Session Management

- Supabase handles session persistence via cookies
- `@supabase/ssr` manages secure cookie operations server-side
- Automatic token refresh handled by Supabase client
- No manual token storage needed

## Usage Examples

### Accessing Protected Routes

```typescript
// In a server component at src/app/dashboard/page.tsx
import { protectRoute, getCurrentUser } from '@/lib/auth';

export default async function DashboardPage() {
  // Validates session, redirects to /login if not authenticated
  await protectRoute();
  
  // Get current user
  const user = await getCurrentUser();
  
  return <div>Welcome {user?.email}</div>;
}
```

### Client-side Form Handling

```typescript
// In a client component
'use client';

import { createClient } from '@/lib/supabase/client';

export default function MyForm() {
  const supabase = createClient();
  
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: 'user@example.com',
      password: 'password123'
    });
  };
}
```

## Deployment to Vercel

### Prerequisites
- GitHub account with repository
- Vercel account (free tier available)

### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/cap-all-hands.git
   git push -u origin main
   ```

2. **Connect on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Framework: Next.js (auto-detected)

3. **Add Environment Variables**
   In Vercel project settings → Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL = your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Your app is live at `https://your-project.vercel.app`

5. **Configure Supabase for Production**
   - In Supabase Settings → Auth → URL Configuration
   - Add your Vercel domain to allowed redirect URLs:
     ```
     https://your-project.vercel.app/auth/callback
     https://your-project.vercel.app/login
     ```

## Type Safety

Complete TypeScript support with:
- Strict mode enabled
- No `any` types allowed
- Full path aliases (`@/*`)
- Proper async/await typing
- Supabase auth types included

## Production Checklist

- [ ] All environment variables configured
- [ ] Supabase project created and configured
- [ ] Email authentication enabled in Supabase
- [ ] HTTPS enforced
- [ ] Logging configured
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Database backups configured
- [ ] Custom domain configured (optional)
- [ ] Email verification emails customized
- [ ] API rate limiting configured

## Troubleshooting

### "Session not found" errors
- Check Supabase credentials in `.env.local`
- Verify Email authentication is enabled in Supabase
- Clear browser cookies and session storage

### CORS errors
- Ensure Supabase URL and Anon Key are correct
- Check browser console for detailed error messages

### Build errors
- Run `npm run type-check` to verify TypeScript
- Run `npm run lint` to check for linting issues
- Check Node.js version (18+ required)

## Scripts

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build           # Build for production
npm start               # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Check TypeScript

# Database (when ready)
npm run db:migrate      # Run migrations (when added)
```

## Next Phase Features (v2.0)

- [ ] User profile management
- [ ] Team management and invitations
- [ ] Role-based access control (RBAC)
- [ ] Real-time messaging
- [ ] Document sharing and management
- [ ] Project/task management
- [ ] Activity feed
- [ ] Notifications
- [ ] Dark mode
- [ ] Mobile app

## Security Best Practices Implemented

✅ Server-side session validation  
✅ Secure cookie management with @supabase/ssr  
✅ Password hashing (Supabase)  
✅ Email verification  
✅ Protected routes with automatic redirects  
✅ No credentials in client code  
✅ Proper error handling without leaking sensitive data  
✅ TypeScript for type safety  
✅ HTTPS enforced (Vercel)  

## Support & Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Documentation](https://www.typescriptlang.org)

## License

MIT

---

**Built with ❤️ for team collaboration**

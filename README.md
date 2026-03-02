# CAP – All Hands

An internal collaboration platform.

---

## Stack

- Next.js (App Router)
- TypeScript
- Supabase (Auth + PostgreSQL)
- Tailwind CSS

---

## Features

- Secure authentication
- Protected dashboard routes
- Server-side session validation
- Type-safe implementation
- Production-ready structure

---

## Getting Started

### Clone

```bash
git clone https://github.com/AnoopKashyapKrishnamurthy/cap-all-hands.git
cd cap-all-hands
```

---

### 1. Install Dependencies

```bash
npm install
```

---

### 2. Configure Supabase

1. Go to https://supabase.com and create a new project
2. Get your project credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Create a `.env.local` file and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

### 3. Enable Email/Password Authentication in Supabase

1. Open Supabase Dashboard → Authentication → Providers  
2. Enable **Email** provider  
3. Configure email settings if required  

---

### 4. Run Development Server

```bash
npm run dev
```

Open: http://localhost:3000



---

## Deployment to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier available)

---

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/cap-all-hands.git
git push -u origin main
```

---

### 2. Connect on Vercel

- Go to https://vercel.com  
- Click **New Project**  
- Import your GitHub repository  
- Framework: Next.js (auto-detected)

---

### 3. Add Environment Variables

In Vercel → Project Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL = your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
```

---

### 4. Deploy

Click **Deploy**.  
Your app will be live at:

```
https://your-project.vercel.app
```

---

### 5. Configure Supabase for Production

In Supabase → Authentication → URL Configuration:

Add allowed redirect URLs:

```
https://your-project.vercel.app/auth/callback
https://your-project.vercel.app/login
```

---

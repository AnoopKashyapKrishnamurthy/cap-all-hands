import Link from 'next/link'
import LoginForm from '@/components/auth/LoginForm'


export const metadata = {
  title: 'Sign In - CAP All-Hands',
}

export default function LoginPage() {
  return (
    <div className="flex justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border p-8 sm:p-10">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome Back
            </h1>
            <p className="text-gray-600 mt-2">
              Sign in to continue to{' '}
              <span className="font-medium">CAP All-Hands</span>
            </p>
          </div>
          

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-4 text-xs text-gray-400 uppercase">
              {/* or */}
            </span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          {/* Email Login */}
          <LoginForm />

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-400">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
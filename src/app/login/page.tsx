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

          {/* Form */}
          <LoginForm />

          {/* Divider */}
          <div className="my-8 border-t border-gray-200" />

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 space-y-2">

            <p className="text-xs text-gray-400">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="hover:underline">
                Terms of Service
              </Link>
            </p>
          </div>

        </div>

      </div>

    </div>
  )
}
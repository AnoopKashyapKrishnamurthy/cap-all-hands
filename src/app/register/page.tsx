import Link from 'next/link'
import RegisterForm from '@/components/auth/RegisterForm'

export const metadata = {
  title: 'Sign Up - CAP All-Hands',
}

export default function RegisterPage() {
  return (
    <div className="flex justify-center px-4 py-20">

      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-sm border p-8 sm:p-10">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Create Your Account
            </h1>
            <p className="text-gray-600 mt-2">
              Join <span className="font-medium">CAP All-Hands</span>
            </p>
          </div>

          {/* Form */}
          <RegisterForm />

          {/* Divider */}
          <div className="my-8 border-t border-gray-200" />

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 space-y-3">

            
            <p className="text-xs text-gray-400 leading-relaxed">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="hover:underline">
                Privacy Policy
              </Link>.
            </p>

          </div>

        </div>

      </div>

    </div>
  )
}
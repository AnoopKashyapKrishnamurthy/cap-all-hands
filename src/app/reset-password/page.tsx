import Link from 'next/link'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export const metadata = {
  title: 'Set New Password - CAP All-Hands',
}

export default function ResetPasswordPage() {
  return (
    <div className="flex justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border p-8 sm:p-10 space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Set a new password
            </h1>
            <p className="text-gray-600">
              Choose a strong password for your account.
            </p>
          </div>

          <ResetPasswordForm />

          <div className="text-center text-sm">
            <Link href="/login" className="text-blue-600 hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

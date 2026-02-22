import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Sign In - CAP All-Hands',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome Back
            </h1>
            <p className="text-gray-600 mt-2">
              Sign in to CAP All-Hands
            </p>
          </div>

          <LoginForm />

          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              By signing in, you agree to our{' '}
              <Link href="#" className="text-primary-600 hover:underline">
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

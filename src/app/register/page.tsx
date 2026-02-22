import Link from 'next/link';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Sign Up - CAP All-Hands',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Join CAP All-Hands
            </h1>
            <p className="text-gray-600 mt-2">
              Create your team account
            </p>
          </div>

          <RegisterForm />

          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              By signing up, you agree to our{' '}
              <Link href="#" className="text-primary-600 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" className="text-primary-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

import { protectRoute, getCurrentUser } from '@/lib/auth';
import LogoutButton from '@/components/auth/LogoutButton';

export const metadata = {
  title: 'Dashboard - CAP All-Hands',
};

export default async function DashboardPage() {
  // This validates the session and redirects to /login if not authenticated
  const session = await protectRoute();
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                CAP All-Hands
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 font-medium">
                {user.email}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Welcome Card */}
          <div className="md:col-span-3 card">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to CAP All-Hands
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              You're successfully authenticated. This is your secure dashboard where team members can collaborate and communicate.
            </p>
            <div className="inline-block">
              <LogoutButton />
            </div>
          </div>

          {/* User Info Card */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              👤 Profile Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900 break-all">
                  {user.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="font-mono text-sm text-gray-900">
                  {user.id}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-gray-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Session Info Card */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🔐 Session
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium text-green-600">
                  ✓ Authenticated
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Session Expiry</p>
                <p className="text-gray-900">
                  {session?.expires_at ? new Date(session.expires_at * 1000).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Auth Method</p>
                <p className="text-gray-900">Email/Password</p>
              </div>
            </div>
          </div>

          {/* Features Card */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ✨ Available Features
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Team messaging</li>
              <li>✓ Document sharing</li>
              <li>✓ Project management</li>
              <li>✓ Real-time collaboration</li>
              <li>✓ Secure authentication</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            CAP All-Hands v1.0 • Built with Next.js, TypeScript, and Supabase
          </p>
        </div>
      </div>
    </main>
  );
}

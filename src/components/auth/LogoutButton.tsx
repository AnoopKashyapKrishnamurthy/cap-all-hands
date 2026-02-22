'use client';

import { useState } from 'react';
import { useTransition } from 'react';
import { logoutAction } from '@/lib/auth/actions';

export default function LogoutButton() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await logoutAction();
      } catch (err) {
        setError('Failed to logout. Please try again.');
      }
    });
  };

  return (
    <div>
      {error && (
        <p className="text-red-600 text-sm mb-2">{error}</p>
      )}
      <button
        onClick={handleLogout}
        disabled={isPending}
        className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
}

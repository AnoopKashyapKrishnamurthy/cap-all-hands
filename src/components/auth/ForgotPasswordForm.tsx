'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ButtonLoader } from '@/components/loading/LoadingPrimitives';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback/confirm?next=/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
      setEmail('');
    } catch {
      setError('Unable to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-busy={loading}>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4" role="alert">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4" role="status" aria-live="polite">
          <p className="text-sm font-medium text-green-800">
            If that email exists, a password reset link has been sent.
          </p>
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-900 mb-2"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          disabled={loading}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="you@company.com"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <ButtonLoader label="Sending reset link" />
            Sending reset link...
          </span>
        ) : 'Send reset link'}
      </button>
    </form>
  );
}

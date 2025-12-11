import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Props = {
  onSuccess: () => void;
  goToSignIn: () => void;
};

const SignUp: React.FC<Props> = ({ onSuccess, goToSignIn }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (supabase) {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
        if (error) throw error;
        onSuccess();
      } else {
        setTimeout(() => { onSuccess(); }, 500);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white border rounded-xl shadow p-6">
        <h1 className="text-2xl font-semibold text-green-800 mb-1">Create your account</h1>
        <p className="text-sm text-gray-600 mb-6">Join Van Adhikaar</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-700 text-white py-2 hover:bg-green-800 disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Sign Up'}
          </button>
        </form>
        <div className="text-sm text-gray-600 mt-4 text-center">
          Already have an account?{' '}
          <button onClick={goToSignIn} className="text-green-700 hover:underline">Sign in</button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;



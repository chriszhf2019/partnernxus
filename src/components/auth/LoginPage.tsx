import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useAuth } from '../../contexts/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/ecosystem', { replace: true });
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] dark:bg-[#1a1a1a] px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center">
              <Network className="text-white dark:text-black w-5 h-5" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold text-black dark:text-white tracking-tight">PartnerNexus</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-black dark:text-white">Sign in to your account</h1>
            <p className="text-sm text-[#86868b] mt-1">Enter your credentials to access the partner ecosystem.</p>
          </div>
        </div>

        <Card className="p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold text-black dark:text-white">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-2.5 pl-10 bg-[#f5f5f7] dark:bg-white/[0.06] border-0 rounded-xl text-sm text-black dark:text-white placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition-all"
                  placeholder="admin@partnernxus.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-bold text-black dark:text-white">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 pl-10 pr-10 bg-[#f5f5f7] dark:bg-white/[0.06] border-0 rounded-xl text-sm text-black dark:text-white placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-black dark:hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Sign in
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-[#86868b]">
          Secure Enterprise Connection &bull; Protected by Firebase Auth
        </p>
      </div>
    </div>
  );
};

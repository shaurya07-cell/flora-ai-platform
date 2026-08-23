import floraLogo from '../assets/flora-logo.png';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { ShieldCheck, Loader2, AlertCircle, Lock } from 'lucide-react';

export const AdminLogin = () => {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adminLogin(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Admin authentication failed. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans text-brand-text">
      <div className="max-w-md w-full bg-surface border border-brand-border rounded-xl shadow-lg p-8 space-y-6 animate-fade-in-up text-left">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-full bg-primary-soft border border-blue-100 text-primary">
              <Lock className="h-6 w-6" />
            </div>
          </div>
          <img src={floraLogo} alt="Flora" className="h-12 w-auto mx-auto object-contain" />
          <h1 className="text-2xl font-extrabold text-brand-text tracking-tight">Admin Control Center</h1>
          <p className="text-xs text-brand-muted">Restricted Access — System Administrator Sign In</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-xs font-semibold text-status-error flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-brand-secondary block mb-1">Admin Email Address</label>
            <input
              type="email"
              required
              placeholder="admin@flora.ai"
              className="w-full border border-brand-border rounded px-3 py-2 text-sm bg-surface text-brand-text focus:outline-none focus:border-brand-borderStrong"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold text-brand-secondary block mb-1">Administrator Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full border border-brand-border rounded px-3 py-2 text-sm bg-surface text-brand-text focus:outline-none focus:border-brand-borderStrong"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            disabled={loading}
            icon={loading ? Loader2 : ShieldCheck}
          >
            {loading ? 'Authenticating Admin...' : 'Authenticate System Admin'}
          </Button>
        </form>

        <div className="p-3 bg-slate-50 border border-brand-border rounded text-[11px] text-brand-muted leading-relaxed text-center">
          <strong>Security Notice:</strong> Administrator accounts are provisioned via secure system configurations. Public account registration is restricted.
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;

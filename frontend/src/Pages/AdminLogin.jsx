import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import { useAdminContext } from '../Context/AdminContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAdminContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/admin-dashboard');
      } else {
        setErrorMessage(result.message || 'Invalid credentials');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0a0a0f' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <Shield size={32} color="#818cf8" />
          </div>
          <h1 className="text-2xl font-semibold mb-2" style={{ color: '#f1f5f9' }}>
            Admin Portal
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>FindOut Administration Dashboard</p>
        </div>

        {/* Login Form */}
        <div className="rounded-2xl shadow-2xl p-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <p className="text-sm text-center" style={{ color: '#f87171' }}>{errorMessage}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-medium text-sm" style={{ color: '#f1f5f9' }}>
                <Mail size={16} color="rgba(255,255,255,0.4)" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@findout.com"
                disabled={isLoading}
                className="w-full p-3 rounded-xl outline-none transition-colors disabled:opacity-50"
                style={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-medium text-sm" style={{ color: '#f1f5f9' }}>
                <Lock size={16} color="rgba(255,255,255,0.4)" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className="w-full p-3 pr-12 rounded-xl outline-none transition-colors disabled:opacity-50"
                  style={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', border: 'none' }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#fff', borderTopColor: 'transparent' }}></div>
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Login to Dashboard
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Authorized personnel only
            </p>
          </div>
        </div>

        {/* Back to Site */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-1.5 text-sm transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >
            <ArrowLeft size={14} />
            Back to main site
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
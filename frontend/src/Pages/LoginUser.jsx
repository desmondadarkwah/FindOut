import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { BeatLoader } from 'react-spinners';
import { ProfileContext } from '../Context/ProfileContext';
import { SuggestionsContext } from '../Context/SuggestionsContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useToast } from '../Context/ToastContext';

const LoginUser = () => {
  const [data, setData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { fetchUserDetails } = useContext(ProfileContext);
  const { fetchSuggestions } = useContext(SuggestionsContext);
  const { toast } = useToast();

  const navigate = useNavigate();

  const handleOnChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // FIX: neither of these had an onClick at all — they looked clickable
  // (cursor-pointer, styled like real actions) and did nothing. There's
  // no Google OAuth flow or password-reset route visible anywhere in this
  // codebase to wire them to, so rather than leave them silently dead or
  // invent a backend flow that might not exist, they're honest about not
  // being built yet — same approach used for "Report a Problem" and
  // "Remove Photo" elsewhere in the app.
  const handleGoogleLogin = () => toast.info('Google login is coming soon.');
  const handleForgotPassword = () => toast.info('Password reset is coming soon.');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const URL = `${import.meta.env.VITE_BACKEND_URL}/api/login`;
      const response = await axios.post(URL, data, {
        headers: { 'Content-Type': 'application/json' },
      });

      setSuccess(response.data.message);
      setError(null);
      setLoading(false);
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      await fetchUserDetails();
      await fetchSuggestions();
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
      setSuccess(null);
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-[var(--bg-primary)] flex items-center justify-center flex-col">
      <div className="w-full max-w-md p-5 flex items-center flex-col">
        <h1 className="text-4xl font-bold text-center text-[var(--text-primary)] mb-8 mt-5">FindOut</h1>
        {error && <p className="mb-4 text-[#f87171] text-center w-full p-3 font-medium">{error}</p>}
        {success && <p className="mb-4 text-[#4ade80] text-center w-full p-3 font-medium">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4 w-80">
          <div>
            <input
              type="email"
              id="email"
              name="email"
              value={data.email}
              onChange={handleOnChange}
              placeholder="Phone number, username, or email"
              className="w-full px-4 py-2 text-sm border border-[var(--border)] rounded-md outline-none focus:ring-2 focus:ring-[#6366f1]/50 bg-[var(--bg-card)] text-[var(--text-primary)]"
              required
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={data.password}
              onChange={handleOnChange}
              placeholder="Password"
              className="w-full px-4 py-2 text-sm border border-[var(--border)] rounded-md outline-none focus:ring-2 focus:ring-[#6366f1]/50 bg-[var(--bg-card)] text-[var(--text-primary)]"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] cursor-pointer transition-colors"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {/* FIX: was `bg-blue-00` — not a real Tailwind class (Tailwind's
              blue scale runs 50/100.../900/950, there's no "00" shade) —
              so this silently applied no background at all, leaving what
              was meant to be the primary CTA as just an outline. Matched
              to the same gradient used for every other primary CTA across
              the app, including this same funnel's own landing-page
              buttons. */}
          <button
            type="submit"
            className="w-full px-4 py-2.5 text-white font-medium bg-gradient-to-r from-[#3b82f6] to-[#6366f1] rounded-md hover:opacity-90 transition-opacity disabled:opacity-60 mt-4 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? <BeatLoader color="#ffffff" size={10} /> : "Login"}
          </button>
        </form>

        <div className="flex items-center mb-4 w-full mt-4">
          <hr className="flex-grow border-[var(--border)]" />
          <span className="px-2 text-[var(--text-muted)]">OR</span>
          <hr className="flex-grow border-[var(--border)]" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-2 mb-4 text-[var(--text-primary)] border border-[var(--border)] rounded-md hover:bg-[var(--bg-card-hover)] transition-colors"
        >
          Log in with Google
        </button>

        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-center text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mt-2 cursor-pointer transition-colors bg-transparent border-none"
        >
          Forgot password?
        </button>

      </div>
      <p className="text-sm text-center text-[var(--text-muted)] mt-6">
        Have an account?{" "}
        {/* FIX: was a plain <a href="/register"> — in an SPA that forces a
            full browser reload instead of a client-side route change,
            discarding any app state. Swapped for react-router's Link. */}
        <Link to="/register" className="text-[#818cf8] hover:underline">
          register
        </Link>
      </p>
    </div>
  );
};

export default LoginUser;
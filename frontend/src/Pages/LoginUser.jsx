import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthLayout, { Field, Notice, SubmitButton } from '../components/AuthLayout';
import { ProfileContext } from '../Context/ProfileContext';
import { SuggestionsContext } from '../Context/SuggestionsContext';

/**
 * Log in.
 *
 * The "Log in with Google" button is gone — there is no OAuth route in the
 * backend, so it had nothing to call. The email field no longer offers "Phone
 * number, username, or email" either: the server authenticates on email alone,
 * and the other two were never accepted.
 */
const LoginUser = () => {
  const [data, setData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const { fetchUserDetails } = useContext(ProfileContext);
  const { fetchSuggestions } = useContext(SuggestionsContext);

  const navigate = useNavigate();

  const handleOnChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

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
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to see who is ready to learn or teach what you named."
      footer={
        <>
          New to FindOut?{' '}
          <Link
            to="/register"
            className="font-medium text-primary-300 underline underline-offset-2 hover:text-primary-200"
          >
            Create an account
          </Link>
        </>
      }
    >
      <Notice tone="error">{error}</Notice>
      <Notice tone="success">{success}</Notice>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field
          id="email"
          name="email"
          type="email"
          label="Email address"
          value={data.email}
          onChange={handleOnChange}
          placeholder="you@st.ug.edu.gh"
          autoComplete="email"
          required
        />
        <Field
          id="password"
          name="password"
          type="password"
          label="Password"
          value={data.password}
          onChange={handleOnChange}
          placeholder="Your password"
          autoComplete="current-password"
          required
        />

        <SubmitButton loading={loading} loadingLabel="Logging you in…">
          Log in
        </SubmitButton>
      </form>

      <p className="mt-5 text-center text-[13px] text-content-muted">
        Not received your verification email?{' '}
        <Link
          to="/resend-verification-email"
          className="text-primary-300 hover:text-primary-200"
        >
          Send it again
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginUser;

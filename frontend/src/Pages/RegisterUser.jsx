import axios from "axios";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BeatLoader } from 'react-spinners';
import { RxAvatar } from "react-icons/rx";
import { useToast } from "../Context/ToastContext";

const RegisterUser = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleOnChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (newImage) => {
    setImage(newImage);
  };

  // FIX: no onClick at all previously — looked like a real action, did
  // nothing. No Google OAuth flow exists elsewhere in this codebase to
  // wire it to, so this is honest about not being built yet rather than
  // silently dead.
  const handleGoogleSignup = () => toast.info('Google sign-up is coming soon.');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);
    if (image) formData.append("profilePicture", image);

    try {
      const URL = `${import.meta.env.VITE_BACKEND_URL}/api/register`;
      const response = await axios.post(URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(response.data.message);
      setError(null);
      setLoading(false);
      setData({ name: "", email: "", password: "" });
      setImage(null);
      // FIX: previously the success path cleared the form and just left
      // the user sitting on the same registration screen with no next
      // step — no navigation anywhere, unlike the error path just below,
      // which already navigates to /resend-verification-email on an
      // "not verified" error. Registration implies email verification is
      // required before login works, so sending them to /login next (where
      // the success message context makes sense — "check your email,
      // then log in") is the sensible landing spot given the routes that
      // actually exist in this app.
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Something went wrong.";
      setError(errorMessage);
      setSuccess(null);
      setLoading(false);

      if (errorMessage.includes("not verified")) {
        setTimeout(() => navigate('/resend-verification-email'), 2000);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
      <div className="w-full max-w-sm p-8 rounded-lg shadow-md">
        <span className="flex items-center gap-20 mb-3">

          <span>
            <label htmlFor="file-input" className="cursor-pointer">
              {image ? (
                <img
                  src={URL.createObjectURL(image)}
                  alt="Profile"
                  className="rounded-full w-12 h-12 object-cover cursor-pointer"
                />
              ) : (
                // FIX: was bg-gray-800 with text-gray-700 for the icon — a
                // dark gray icon on a near-identical dark gray background,
                // which is close to invisible. Matched to the visible-
                // contrast avatar-fallback treatment already used
                // elsewhere in the app (ChatSidebar, Suggestions,
                // GlobalSearch).
                <div className="w-12 h-12 bg-[var(--bg-card-hover)] text-[var(--text-secondary)] rounded-full flex items-center justify-center">
                  <RxAvatar size={20} />
                </div>
              )}
            </label>
          </span>

          <input
            type="file"
            id='file-input'
            hidden
            onChange={(e) => handleImageChange(e.target.files[0])}
          />

          <h1 className="text-4xl font-bold text-center text-[var(--text-primary)] mb-4">
            FindOut
          </h1>
        </span>

        <p className="text-center text-sm text-[var(--text-secondary)] mb-6">
          Sign up to discover who is eager to learn alongside you.
        </p>

        <button
          onClick={handleGoogleSignup}
          className="w-full py-2 mb-4 text-[var(--text-primary)] border border-[var(--border)] rounded-md hover:bg-[var(--bg-card-hover)] transition-colors"
        >
          Log in with Google
        </button>
        <div className="flex items-center mb-4">
          <hr className="flex-grow border-[var(--border)]" />
          <span className="px-2 text-[var(--text-muted)]">OR</span>
          <hr className="flex-grow border-[var(--border)]" />
        </div>

        {error && <p className="mb-4 text-sm text-[#f87171] font-medium flex items-center justify-center">{error}</p>}
        {success && <p className="mb-4 text-sm text-[#4ade80] font-medium flex items-center justify-center">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={data.name}
            onChange={handleOnChange}
            placeholder="Name"
            className="w-full px-4 py-2 text-sm bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border)] rounded-md outline-none focus:ring-2 focus:ring-[#6366f1]/50"
          />
          <input
            type="text"
            name="email"
            value={data.email}
            onChange={handleOnChange}
            placeholder="Email"
            className="w-full px-4 py-2 text-sm bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border)] rounded-md outline-none focus:ring-2 focus:ring-[#6366f1]/50"
          />
          <input
            type="password"
            name="password"
            value={data.password}
            onChange={handleOnChange}
            placeholder="Password"
            className="w-full px-4 py-2 text-sm bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border)] rounded-md outline-none focus:ring-2 focus:ring-[#6366f1]/50"
          />

          {/* FIX: same missing-fill issue as LoginUser's submit button —
              ring-only, no background, when every other primary CTA in
              the app (including this funnel's own landing-page buttons)
              uses the solid brand gradient. */}
          <button
            type="submit"
            className="w-full py-2.5 text-white font-medium bg-gradient-to-r from-[#3b82f6] to-[#6366f1] rounded-md hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? <BeatLoader color="#ffffff" size={10} /> : "Sign up"}
          </button>
        </form>

        {/* FIX: removed — this was Instagram's own signup disclaimer text
            ("...uploaded your contact information to Instagram"), copy-
            pasted verbatim and left referencing a completely unrelated
            product by name inside FindOut's own registration form. */}

        <p className="text-xs text-[var(--text-muted)] mt-4 text-center">
          By signing up, you agree to our{" "}
          <a href="#" className="text-[#818cf8] hover:underline">
            Terms
          </a>
          ,{" "}
          <a href="#" className="text-[#818cf8] hover:underline">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="#" className="text-[#818cf8] hover:underline">
            Cookies Policy
          </a>
          .
        </p>

        <p className="text-sm text-center text-[var(--text-muted)] mt-6">
          Have an account?{" "}
          <Link to="/login" className="text-[#818cf8] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterUser;
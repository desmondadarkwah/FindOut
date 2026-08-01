import axios from "axios";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout, { Field, Notice, SubmitButton } from "../components/AuthLayout";

/**
 * Sign up.
 *
 * There is no profile-picture control here any more. It sat above the form as
 * a bare grey circle with no label, so it read as an icon rather than
 * something to click, and it asked for a decision before the account it
 * belonged to existed. A photo can be added from the profile once you are in,
 * and the field was always optional on the server.
 *
 * The "Log in with Google" button is gone too: there is no OAuth route in the
 * backend, so it had nothing to call.
 */
const RegisterUser = () => {
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleOnChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Still multipart: the register route runs multer, which expects it.
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);

    try {
      const URL = `${import.meta.env.VITE_BACKEND_URL}/api/register`;
      const response = await axios.post(URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(response.data.message);
      setError(null);
      setLoading(false);
      setData({ name: "", email: "", password: "" });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Something went wrong.";
      setError(errorMessage);
      setSuccess(null);
      setLoading(false);

      if (errorMessage.includes("not verified")) {
        setTimeout(() => navigate("/resend-verification-email"), 2000);
      }
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Tell us what you want to learn and what you can teach, and FindOut will look for the students who fit."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-primary-300 underline underline-offset-2 hover:text-primary-200"
          >
            Log in
          </Link>
        </>
      }
    >
      <Notice tone="error">{error}</Notice>
      <Notice tone="success">{success}</Notice>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field
          id="name"
          name="name"
          label="Full name"
          value={data.name}
          onChange={handleOnChange}
          placeholder="Ama Mensah"
          autoComplete="name"
          required
        />
        <Field
          id="email"
          name="email"
          type="email"
          label="Email address"
          value={data.email}
          onChange={handleOnChange}
          placeholder="you@st.ug.edu.gh"
          autoComplete="email"
          hint="We send a verification link here before your account goes live."
          required
        />
        <Field
          id="password"
          name="password"
          type="password"
          label="Password"
          value={data.password}
          onChange={handleOnChange}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          minLength={8}
          required
        />

        <SubmitButton loading={loading} loadingLabel="Creating your account…">
          Create account
        </SubmitButton>
      </form>

      <p className="mt-6 border-t border-edge-subtle pt-5 text-[12px] leading-relaxed text-content-muted">
        Your name, subjects and availability are shown to other students so they
        can find you — your email address never is.{" "}
        <Link to="/about" className="text-primary-300 hover:text-primary-200">
          How matching works
        </Link>
      </p>

      <p className="mt-3 text-[12px] leading-relaxed text-content-muted">
        By creating an account you agree to our{" "}
        <Link to="/terms" className="text-primary-300 hover:text-primary-200">
          Terms of Use
        </Link>{" "}
        and{" "}
        <Link to="/privacy" className="text-primary-300 hover:text-primary-200">
          Privacy Notice
        </Link>
        .
      </p>
    </AuthLayout>
  );
};

export default RegisterUser;

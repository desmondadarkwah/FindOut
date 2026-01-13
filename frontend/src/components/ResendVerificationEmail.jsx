import React, { useState } from "react";
import axios from "axios";
import { BeatLoader } from 'react-spinners';

const ResendVerificationEmail = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState(null);
  const [loading,setLoading] = useState(false)

  const handleResendEmail = async (e) => {
    e.preventDefault(); // Prevent form submission
    setLoading(true)
    try {
      const URL = `${import.meta.env.VITE_BACKEND_URL}/api/resend-verification-email`;
      await axios.post(URL, { email }); 
      setLoading(false)
      setStatus("Verification email sent successfully. Please check your inbox.");
      setError(null);
    } catch (err) {
      setLoading(false)
      setError(err.response?.data?.message || "Error resending verification email.");
      setStatus(null); 
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-md p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          Resend Verification Email
        </h2>

        {status && <p className="mb-4 text-sm text-gray-600 text-center">{status}</p>}
        {error && <p className="mb-4 text-sm text-red-500 text-center">{error}</p>} {/* Display error */}

        <form onSubmit={handleResendEmail} className="space-y-4">
          <div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              className="w-full px-4 py-2 text-sm bg-[#1c1e21] text-white border border-gray-700 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 mb-4 text-white ring ring-blue-600 rounded-md hover:bg-blue-600"
          >
            {loading ? <BeatLoader color="#ffffff" size={10} /> : "Resend Email"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResendVerificationEmail;

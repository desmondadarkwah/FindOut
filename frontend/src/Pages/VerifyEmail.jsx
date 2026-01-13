import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BeatLoader } from 'react-spinners';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      const VerifyEmail = async () => {
        try {
          const URL = `${import.meta.env.VITE_BACKEND_URL}/api/verify-email?token=${token}`;
          const response = await axios.get(URL);
          setLoading(true);
          setStatus("Email verified successfully! Redirecting to login...");
          setTimeout(() => navigate("/login"), 3000); 
        } catch (err) {
          setStatus(
            err.response?.data?.message || "Failed to verify email. Please try again."
          );
          setLoading(false);
        }
      };

      VerifyEmail();
    } else {
      setStatus("Invalid verification link. Please check your email and try again.");
      setLoading(false);
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-2xl text-center">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
              FindOut
            </h1>
            <h2 className="text-xl font-semibold text-white mb-2">
              Email Verification
            </h2>
          </div>

          {/* Status Content */}
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4">
              <span className="text-gray-300 text-center">{status}</span>
              {loading && <BeatLoader color="#60A5FA" size={12} />}
            </div>

            {!loading && status.includes("Invalid") && (
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                >
                  Try Again
                </button>
                
                <p className="text-gray-400 text-sm">
                  Need help?{" "}
                  <a href="/resend-verification-email" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Resend verification email
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Back to Login */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <a 
              href="/login" 
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              ← Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
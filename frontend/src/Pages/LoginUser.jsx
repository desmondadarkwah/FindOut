import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BeatLoader } from 'react-spinners';
import { ProfileContext } from '../Context/ProfileContext';
import { SuggestionsContext } from '../Context/SuggestionsContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginUser = () => {
  const [data, setData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { fetchUserDetails } = useContext(ProfileContext);
  const { fetchSuggestions } = useContext(SuggestionsContext);

  const navigate = useNavigate();

  const handleOnChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
    <div className="w-screen h-screen bg-black flex items-center justify-center flex-col">
      <div className="w-full max-w-md p-5 flex items-center flex-col">
        <h1 className="text-4xl font-bold text-center text-white mb-8 mt-5">FindOut</h1>
        {error && <p className="mb-4 text-red-500 text-center  w-full p-3 font-bold">{error}</p>}
        {success && <p className="mb-4  text-green-500 text-center  w-full p-3  font-bold">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4 w-80">
          <div>
            <input
              type="email"
              id="email"
              name="email"
              value={data.email}
              onChange={handleOnChange}
              placeholder="Phone number, username, or email"
              className="w-full px-4 py-2 text-sm border border-gray-500 rounded-md focus:outline-none focus:ring focus:ring-blue-300 bg-[#1c1e21] text-white"
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
              className="w-full px-4 py-2 text-sm border border-gray-500 rounded-md focus:outline-none focus:ring focus:ring-blue-300 bg-[#1c1e21] text-white"
              required
            />
            <button 
              type="button" 
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 cursor-pointer"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <button
            type="submit"
            className="ring ring-blue-950 w-full px-4 py-2 text-white bg-blue-00 rounded-md   focus:ring focus:ring-blue-300 mt-4"
            disabled={loading}
          >
            {loading ? <BeatLoader color="#ffffff" size={10} /> : "Login"}
          </button>
        </form>

        <div className="flex items-center mb-4 w-full">
          <hr className="flex-grow border-gray-700" />
          <span className="px-2 text-gray-400">OR</span>
          <hr className="flex-grow border-gray-700" />
        </div>

        <button className="w-full py-2 mb-4 text-white ring ring-blue-600 rounded-md hover:bg-blue-950 focus:ring focus:ring-blue-300">
          Log in with Google
        </button>

        <div className="text-center text-sm text-white mt-2 cursor-pointer">
          Forgot password?
        </div>

      </div>
      <p className="text-sm text-center text-gray-400 mt-6">
        Have an account?{" "}
        <a href="/register" className="text-blue-500 hover:underline">
          register
        </a>
      </p>
    </div>
  );
};

export default LoginUser;
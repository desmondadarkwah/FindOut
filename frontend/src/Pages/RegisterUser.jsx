import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import UserProfile from "../components/UserProfile";
import { BeatLoader } from 'react-spinners';
// import { ScaleLoader } from 'react-spinners';
import { RxAvatar } from "react-icons/rx";


const RegisterUser = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [image, setImage] = useState(null); // Uncommented to define image state
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();

  const handleOnChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (newImage) => {
    setImage(newImage);
  };

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
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-sm p-8 rounded-lg shadow-md">
        <span className="flex items-center gap-20 mb-3">

          <span>
            <label htmlFor="file-input" className="cursor-pointer">
              {image ? (
                <img
                  src={URL.createObjectURL(image)} 
                  alt="Profile"
                  className={'rounded-full w-12 h-12 object-cover cursor-pointer'}
                />
              ) : (
                <div
                  className={'w-12 h-12 bg-gray-800 text-gray-700 rounded-full flex items-center justify-center'}
                >
                  <RxAvatar size={20} />
                </div>
              )}
            </label>
          </span>
          {/* <UserProfile /> */}

          <input
            type="file"
            id='file-input'
            hidden
            onChange={(e) => handleImageChange(e.target.files[0])} 
          />

          <h1 className="text-4xl font-bold text-center text-white mb-4">
            FindOut
          </h1>
        </span>

        <p className="text-center text-sm text-gray-400 mb-6">
          Sign up to discover who is eager to learn alongside you.
        </p>

        <button className="w-full py-2 mb-4 text-white ring ring-blue-900 rounded-md hover:bg-blue-950 focus:ring focus:ring-blue-300">
          Log in with Google
        </button>
        <div className="flex items-center mb-4">
          <hr className="flex-grow border-gray-700" />
          <span className="px-2 text-gray-400">OR</span>
          <hr className="flex-grow border-gray-700" />
        </div>

        {error && <p className="mb-4 text-sm text-red-500 font-bold flex items-center justify-center">{error}</p>}
        {success && <p className="mb-4 text-sm text-green-500 font-bold flex items-center justify-center">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={data.name}
            onChange={handleOnChange}
            placeholder="Name"
            className="w-full px-4 py-2 text-sm bg-[#1c1e21] text-white border border-gray-700 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
          <input
            type="text"
            name="email"
            value={data.email}
            onChange={handleOnChange}
            placeholder="Email"
            className="w-full px-4 py-2 text-sm bg-[#1c1e21] text-white border border-gray-700 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
          <input
            type="password"
            name="password"
            value={data.password}
            onChange={handleOnChange}
            placeholder="Password"
            className="w-full px-4 py-2 text-sm bg-[#1c1e21] text-white border border-gray-700 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />

          <button
            type="submit"
            className="w-full py-2 text-white ring ring-blue-600 rounded-md hover:bg-blue-950 focus:ring focus:ring-blue-300"
            disabled={loading}
          >
            {loading ? <BeatLoader color="#ffffff" size={10} /> : "Sign up"}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-4 text-center">
          People who use our service may have uploaded your contact information
          to Instagram.{" "}
          <a href="#" className="text-blue-500 hover:underline">
            Learn More
          </a>
        </p>

        <p className="text-xs text-gray-400 mt-4 text-center">
          By signing up, you agree to our{" "}
          <a href="#" className="text-blue-500 hover:underline">
            Terms
          </a>
          ,{" "}
          <a href="#" className="text-blue-500 hover:underline">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-500 hover:underline">
            Cookies Policy
          </a>
          .
        </p>

        <p className="text-sm text-center text-gray-400 mt-6">
          Have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterUser;
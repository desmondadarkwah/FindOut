import React, { useState } from 'react';
import { Camera, X, Image, Type } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance'; 
import { useNavigate } from 'react-router-dom';

const AddPost = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

const navigate = useNavigate();

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      alert('Please select an image to post');
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('caption', caption);

      const response = await axiosInstance.post('/api/add-post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSelectedImage(null);
        setImagePreview(null);
        setCaption('');
        alert('Post shared successfully! 🎉');
        
        navigate('/feed');
      } else {
        alert(response.data.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error uploading post:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload post. Please try again.';
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">Share a Moment</h1>
          <p className="text-gray-400">Upload an image and add your thoughts</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl p-6 space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-4">
            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-blue-500/30 rounded-xl cursor-pointer bg-gray-900/50 hover:bg-gray-900/70 hover:border-blue-400/50 transition-all duration-300">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-12 h-12 text-blue-400 mb-4" />
                  <p className="mb-2 text-lg font-medium text-white">Choose your photo</p>
                  <p className="text-sm text-gray-400">PNG, JPG up to 5MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </label>
            ) : (
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Caption Section */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-white font-medium">
              <Type size={18} className="text-blue-400" />
              Add a caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's on your mind? Share your thoughts..."
              className="w-full p-4 bg-gray-900/50 border border-gray-600/50 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all duration-300"
              rows="4"
              maxLength="500"
            />
            <div className="text-right text-sm text-gray-400">
              {caption.length}/500
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setSelectedImage(null);
                setImagePreview(null);
                setCaption('');
              }}
              className="flex-1 py-3 px-4 bg-gray-700/50 border border-gray-600/50 text-gray-300 rounded-xl hover:bg-gray-700/70 hover:border-gray-500/50 transition-all duration-300 font-medium"
              disabled={isUploading}
            >
              Clear
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedImage || isUploading}
              className="flex-1 bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium flex items-center justify-center gap-2 border border-blue-500/30"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sharing...
                </>
              ) : (
                <>
                  <Image size={18} />
                  Share Post
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-6 bg-gray-800/30 backdrop-blur border border-gray-700/30 rounded-xl p-4">
          <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
            <span>📸</span> Tips for great posts:
          </h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Use good lighting for clear photos</li>
            <li>• Write engaging captions to connect with others</li>
            <li>• Keep it positive and friendly</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddPost;
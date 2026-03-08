import React, { useState, useContext } from 'react';
import { Camera, X, Image, Type, BookOpen, HelpCircle, Lightbulb, Zap, Tag } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { ChatContext } from '../Context/ChatContext';

const AddPost = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [postType, setPostType] = useState('general');
  const [subject, setSubject] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const { userId } = useContext(ChatContext);
  const navigate = useNavigate();

  // Post type options with icons
  const postTypes = [
    { value: 'resource', label: '📚 Study Resource', icon: BookOpen, color: 'blue' },
    { value: 'help', label: '❓ Help Request', icon: HelpCircle, color: 'red' },
    { value: 'explanation', label: '💡 Explanation', icon: Lightbulb, color: 'yellow' },
    { value: 'challenge', label: '🎯 Challenge', icon: Zap, color: 'purple' },
    { value: 'general', label: '📝 General', icon: Tag, color: 'gray' }
  ];

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
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

    if (!subject.trim()) {
      alert('Please enter a subject');
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('caption', caption);
      formData.append('postType', postType);
      formData.append('subject', subject.trim());

      const response = await axiosInstance.post('/api/add-post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSelectedImage(null);
        setImagePreview(null);
        setCaption('');
        setPostType('general');
        setSubject('');
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Share Learning Content
          </h1>
          <p className="text-gray-400">Help others learn from your knowledge</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl p-6 space-y-6">
          
          {/* Post Type Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-white font-medium text-sm">
              <Type size={16} className="text-blue-400" />
              What are you sharing?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {postTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setPostType(type.value)}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                    postType === type.value
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-gray-600/50 bg-gray-900/50 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl">{type.label.split(' ')[0]}</span>
                    <span className="text-xs">{type.label.split(' ').slice(1).join(' ')}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Subject Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-white font-medium text-sm">
              <BookOpen size={16} className="text-green-400" />
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Mathematics, Physics, Programming..."
              className="w-full p-3 bg-gray-900/50 border border-gray-600/50 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
              maxLength="50"
            />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-blue-500/30 rounded-xl cursor-pointer bg-gray-900/50 hover:bg-gray-900/70 hover:border-blue-400/50 transition-all duration-300">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-12 h-12 text-blue-400 mb-4" />
                  <p className="mb-2 text-lg font-medium text-white">Upload your content</p>
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
            <label className="flex items-center gap-2 text-white font-medium text-sm">
              <Type size={16} className="text-purple-400" />
              Description
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Explain what you're sharing, add context, or ask your question..."
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
                setPostType('general');
                setSubject('');
              }}
              className="flex-1 py-3 px-4 bg-gray-700/50 border border-gray-600/50 text-gray-300 rounded-xl hover:bg-gray-700/70 hover:border-gray-500/50 transition-all duration-300 font-medium"
              disabled={isUploading}
            >
              Clear
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedImage || !subject.trim() || isUploading}
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
            <span>💡</span> Tips for great learning posts:
          </h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Choose the right post type for your content</li>
            <li>• Be specific about the subject</li>
            <li>• Add clear explanations or questions</li>
            <li>• Help others learn from your knowledge</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddPost;
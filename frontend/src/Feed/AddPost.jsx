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
    <div className="min-h-screen bg-surface-base p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6 pt-8">
          <h1 className="text-2xl font-semibold text-content-primary mb-1">
            Share Learning Content
          </h1>
          <p className="text-sm text-content-muted">Help others learn from your knowledge</p>
        </div>

        {/* Main Form Card */}
        <div className="rounded-xl bg-surface-raised p-6 space-y-6 shadow-elev-2">
          
          {/* Post Type Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-content-primary">
              <Type size={15} className="text-content-muted" />
              What are you sharing?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {postTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setPostType(type.value)}
                  className={`rounded-lg p-3 transition-colors ${
                    postType === type.value
                      ? 'bg-primary-500/20 text-content-primary ring-1 ring-primary-500/50'
                      : 'bg-surface-input text-content-muted hover:bg-surface-hover hover:text-content-secondary'
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
            <label className="flex items-center gap-2 text-sm font-medium text-content-primary">
              <BookOpen size={15} className="text-content-muted" />
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Mathematics, Physics, Programming..."
              className="w-full rounded-lg bg-surface-input px-3.5 py-2.5 text-sm text-content-primary placeholder-content-muted ring-1 ring-inset ring-edge-subtle transition-shadow focus:outline-none focus:ring-2 focus:ring-primary-500"
              maxLength="50"
            />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            {!imagePreview ? (
              <label className="flex h-56 w-full cursor-pointer flex-col items-center justify-center rounded-lg bg-surface-input ring-1 ring-inset ring-edge-subtle transition-colors hover:bg-surface-hover hover:ring-primary-500/50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="mb-3 h-8 w-8 text-content-muted" />
                  <p className="mb-1 text-sm font-medium text-content-primary">Upload your content</p>
                  <p className="text-xs text-content-muted">PNG or JPG, up to 5&nbsp;MB</p>
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
                  className="h-56 w-full object-cover"
                />
                <button
                  onClick={removeImage}
                  className="absolute right-3 top-3 rounded-full bg-surface-sunken/80 p-2 text-content-primary transition-colors hover:bg-danger-500"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Caption Section */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-content-primary">
              <Type size={15} className="text-content-muted" />
              Description
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Explain what you're sharing, add context, or ask your question..."
              className="w-full resize-none rounded-lg bg-surface-input px-3.5 py-2.5 text-sm text-content-primary placeholder-content-muted ring-1 ring-inset ring-edge-subtle transition-shadow focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows="4"
              maxLength="500"
            />
            <div className="text-right text-xs text-content-muted">
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
              className="rounded-lg bg-surface-hover px-4 py-2.5 text-sm font-medium text-content-secondary transition-colors hover:bg-edge hover:text-content-primary"
              disabled={isUploading}
            >
              Clear
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedImage || !subject.trim() || isUploading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 px-4 py-2.5 text-sm font-semibold text-white shadow-elev-2 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="mt-4 rounded-xl bg-surface-raised p-4 shadow-elev-2">
          <h3 className="mb-2 text-sm font-medium text-content-primary">
            Tips for great learning posts
          </h3>
          <ul className="space-y-1 text-xs text-content-muted">
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
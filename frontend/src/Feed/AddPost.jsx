import React, { useState, useContext } from 'react';
import { Camera, X, Image, Type, BookOpen, HelpCircle, Lightbulb, Zap, Tag } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { ChatContext } from '../Context/ChatContext';
import { useToast } from '../Context/ToastContext';

const AddPost = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [postType, setPostType] = useState('general');
  const [subject, setSubject] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const { userId } = useContext(ChatContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  // FIX: each entry already carried a real icon component and a `color`,
  // but neither was ever used in the render. The label instead embedded
  // an emoji as its first "word" (e.g. '📚 Study Resource') and the JSX
  // split that string apart at render time to fake an icon — a fragile
  // hack standing in for data that was already there. Now the real Icon
  // renders, and the unused `color` field (also never referenced
  // anywhere) is dropped — every type gets one consistent selected-state
  // treatment instead of a different hue each, matching the neutral
  // post-type badge style already used in AllPost.jsx.
  const postTypes = [
    { value: 'resource', label: 'Study Resource', icon: BookOpen },
    { value: 'help', label: 'Help Request', icon: HelpCircle },
    { value: 'explanation', label: 'Explanation', icon: Lightbulb },
    { value: 'challenge', label: 'Challenge', icon: Zap },
    { value: 'general', label: 'General', icon: Tag },
  ];

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
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

  const clearForm = () => {
    removeImage();
    setCaption('');
    setPostType('general');
    setSubject('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedImage) {
      toast.error('Please select an image to post');
      return;
    }

    if (!subject.trim()) {
      toast.error('Please enter a subject');
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
        clearForm();
        toast.success('Post shared successfully!');
        navigate('/feed');
      } else {
        toast.error(response.data.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error uploading post:', error);
      toast.error(error.response?.data?.message || 'Failed to upload post. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
            Share Learning Content
          </h1>
          <p className="text-[var(--text-secondary)]">Help others learn from your knowledge</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 space-y-6">

          {/* Post Type Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[var(--text-primary)] font-medium text-sm">
              <Type size={16} className="text-[var(--text-muted)]" />
              What are you sharing?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {postTypes.map((type) => {
                const Icon = type.icon;
                const active = postType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setPostType(type.value)}
                    className={`p-3 rounded-xl border transition-colors ${
                      active
                        ? 'border-[#6366f1]/50 bg-[#6366f1]/15 text-[var(--text-primary)]'
                        : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <Icon size={20} className={active ? 'text-[#818cf8]' : 'text-[var(--text-muted)]'} />
                      <span className="text-xs font-medium">{type.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[var(--text-primary)] font-medium text-sm">
              <BookOpen size={16} className="text-[var(--text-muted)]" />
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Mathematics, Physics, Programming..."
              className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl outline-none focus:ring-2 focus:ring-[#6366f1]/50 focus:border-[#6366f1]/50 transition-colors"
              maxLength="50"
            />
            <div className="text-right text-xs text-[var(--text-muted)]">
              {subject.length}/50
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-[#6366f1]/25 rounded-xl cursor-pointer bg-[var(--bg-primary)] hover:bg-[var(--bg-card-hover)] hover:border-[#6366f1]/40 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-10 h-10 text-[#818cf8] mb-4" />
                  <p className="mb-2 text-base font-medium text-[var(--text-primary)]">Upload your content</p>
                  <p className="text-sm text-[var(--text-secondary)]">PNG, JPG up to 5MB</p>
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
                  className="absolute top-3 right-3 bg-[#ef4444] text-white rounded-full p-2 hover:bg-[#ef4444]/90 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Caption Section */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[var(--text-primary)] font-medium text-sm">
              <Type size={16} className="text-[var(--text-muted)]" />
              Description
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Explain what you're sharing, add context, or ask your question..."
              className="w-full p-4 bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl outline-none focus:ring-2 focus:ring-[#6366f1]/50 focus:border-[#6366f1]/50 resize-none transition-colors"
              rows="4"
              maxLength="500"
            />
            <div className="text-right text-xs text-[var(--text-muted)]">
              {caption.length}/500
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={clearForm}
              className="flex-1 py-3 px-4 bg-[var(--bg-card-hover)] border border-[var(--border)] text-[var(--text-secondary)] rounded-xl hover:text-[var(--text-primary)] transition-colors font-medium"
              disabled={isUploading}
            >
              Clear
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedImage || !subject.trim() || isUploading}
              className="flex-1 bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white py-3 px-4 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-medium flex items-center justify-center gap-2"
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
        <div className="mt-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
          <h3 className="font-semibold text-[var(--text-primary)] mb-2">
            Tips for great learning posts
          </h3>
          <ul className="text-sm text-[var(--text-secondary)] space-y-1 list-disc list-inside">
            <li>Choose the right post type for your content</li>
            <li>Be specific about the subject</li>
            <li>Add clear explanations or questions</li>
            <li>Help others learn from your knowledge</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddPost;
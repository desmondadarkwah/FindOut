import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";
import { RxAvatar } from "react-icons/rx";
import { MdLock, MdPublic } from "react-icons/md";
import { RiGhostLine } from "react-icons/ri";
import { Users } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';

const CreateGroup = ({ setShowCreateGroup }) => {
  const [groupData, setGroupData] = useState({
    groupName: '',
    subjects: '',
    description: '',
    privacy: 'public'
  });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClose = () => setShowCreateGroup(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGroupData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('groupName', groupData.groupName);
      formData.append('subjects', groupData.subjects);
      formData.append('description', groupData.description);
      formData.append('privacy', groupData.privacy);
      if (image) formData.append('groupProfile', image);

      const response = await axiosInstance.post('/api/creategroup', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setSuccess('Group created successfully!');
        setTimeout(() => setShowCreateGroup(false), 1500);
      }
    } catch (err) {
      console.error('Error creating group:', err);
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  // Private = indigo, Public = blue — matches the same privacy convention
  // already established in ManageGroup.jsx, ExploreGroups.jsx, and
  // GlobalSearch.jsx. Secret stays neutral since there's no existing
  // color tied to it elsewhere.
  const privacyOptions = [
    {
      value: 'public',
      icon: <MdPublic size={22} />,
      label: 'Public',
      description: 'Anyone can find and join instantly',
      activeColor: 'bg-[#3b82f6]/15 border-[#3b82f6]/50 text-[#60a5fa]',
    },
    {
      value: 'private',
      icon: <MdLock size={22} />,
      label: 'Private',
      description: 'Visible but needs admin approval',
      activeColor: 'bg-[#6366f1]/15 border-[#6366f1]/50 text-[#818cf8]',
    },
    {
      value: 'secret',
      icon: <RiGhostLine size={22} />,
      label: 'Secret',
      description: 'Hidden everywhere, invite link only',
      activeColor: 'bg-[var(--bg-card-hover)] border-[var(--border-hover)] text-[var(--text-primary)]',
    },
  ];

  const privacyInfo = {
    public:  'Public: Appears on Explore and suggestions. Anyone can join instantly without approval.',
    private: 'Private: Appears on Explore. Users must request to join and wait for your approval.',
    secret:  'Secret: Completely hidden from Explore and search. Only joinable via your invite link.',
  };

  const privacyBannerStyle = {
    public:  { background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#93c5fd' },
    private: { background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc' },
    secret:  { background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' },
  }[groupData.privacy];

  return (
    <div className="relative w-full max-w-md mx-auto max-h-[90vh] bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col">

      {/* Header */}
      <div className="relative bg-[var(--bg-card)] p-6 border-b border-[var(--border)] flex-shrink-0">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[var(--bg-card-hover)] border border-[var(--border)] hover:opacity-80 transition-opacity group z-10"
        >
          <IoClose className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" size={20} />
        </button>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#6366f1]/15 border border-[#6366f1]/30 rounded-full mb-3">
            <Users size={20} className="text-[#818cf8]" />
          </div>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
            Create a Group
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Start building your learning community</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">

          {success && (
            <div className="mb-4 p-3 bg-[#22c55e]/10 border border-[#22c55e]/25 rounded-lg">
              <p className="text-[#4ade80] text-sm text-center">{success}</p>
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-[#ef4444]/10 border border-[#ef4444]/25 rounded-lg">
              <p className="text-[#f87171] text-sm text-center">{error}</p>
            </div>
          )}

          <div className="space-y-6">

            {/* Group Profile Image */}
            <div className="flex flex-col items-center space-y-3">
              <label htmlFor="group-file-input" className="cursor-pointer group">
                <div className="relative">
                  {image ? (
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Group Profile"
                      className="w-20 h-20 rounded-full object-cover border-4 border-[var(--border)] group-hover:border-[#6366f1]/50 transition-colors"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-[var(--bg-card-hover)] border-4 border-[var(--border)] group-hover:border-[#6366f1]/50 rounded-full flex items-center justify-center transition-colors">
                      <RxAvatar size={32} className="text-[var(--text-secondary)] group-hover:text-[#818cf8] transition-colors" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#6366f1] border-2 border-[var(--bg-secondary)] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">+</span>
                  </div>
                </div>
              </label>
              <p className="text-[var(--text-muted)] text-xs">Click to upload group photo</p>
              <input
                type="file"
                id="group-file-input"
                hidden
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>

            {/* Group Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">
                Group Name
              </label>
              <input
                type="text"
                name="groupName"
                value={groupData.groupName}
                onChange={handleChange}
                placeholder="Enter group name"
                className="w-full p-4 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl border border-[var(--border)] outline-none focus:ring-2 focus:ring-[#6366f1]/50 focus:border-[#6366f1]/50 transition-colors"
                required
              />
            </div>

            {/* Subjects */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">
                Subjects
              </label>
              <input
                type="text"
                name="subjects"
                value={groupData.subjects}
                onChange={handleChange}
                placeholder="Enter subjects (comma-separated)"
                className="w-full p-4 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl border border-[var(--border)] outline-none focus:ring-2 focus:ring-[#6366f1]/50 focus:border-[#6366f1]/50 transition-colors"
                required
              />
              <p className="text-[var(--text-muted)] text-xs">Example: Math, Physics, Chemistry</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">
                Description
              </label>
              <textarea
                name="description"
                value={groupData.description}
                onChange={handleChange}
                placeholder="Tell us about your group..."
                className="w-full p-4 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl border border-[var(--border)] outline-none focus:ring-2 focus:ring-[#6366f1]/50 focus:border-[#6366f1]/50 transition-colors resize-none"
                rows="3"
              />
              <p className="text-[var(--text-muted)] text-xs">Optional: Share the group's purpose and goals</p>
            </div>

            {/* Privacy Selector */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">
                Group Privacy
              </label>
              <div className="flex gap-2">
                {privacyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setGroupData(prev => ({ ...prev, privacy: option.value }))}
                    className={`flex-1 p-3 rounded-xl border transition-colors flex flex-col items-center gap-1.5 ${
                      groupData.privacy === option.value
                        ? option.activeColor
                        : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)]'
                    }`}
                  >
                    {option.icon}
                    {/* FIX: was `font-700`, not a real Tailwind class (the
                        real utilities are font-bold/font-semibold, not a
                        raw numeric name) — silently did nothing, so this
                        label was never actually bold. */}
                    <span className="text-xs font-semibold">{option.label}</span>
                    <span className="text-xs text-center opacity-70 leading-tight">{option.description}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic info banner */}
              <div
                className="p-3 rounded-lg text-xs leading-relaxed text-center transition-colors"
                style={privacyBannerStyle}
              >
                {privacyInfo[groupData.privacy]}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#3b82f6] to-[#6366f1] hover:opacity-90 text-white font-semibold rounded-xl transition-opacity flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
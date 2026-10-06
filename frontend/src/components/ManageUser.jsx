import React, { useState, useContext, useRef } from "react";
import UserProfile from "./UserProfile";
import { useEditUser } from "../Context/EditUserContext";
import { IoClose } from "react-icons/io5";
import { SettingsContext } from "../Context/SettingsContext";
import { useToast } from "../Context/ToastContext";
import { ProfileContext } from "../Context/ProfileContext";
import axiosInstance from "../utils/axiosInstance";
import { BeatLoader } from "react-spinners";

const ManageUser = () => {
  const { userData, editUserDetails } = useEditUser();
  const { fetchUserDetails, updateProfilePicture } = useContext(ProfileContext);
  const { setOpenManageUser } = useContext(SettingsContext);
  const { toast } = useToast();

  const fileInputRef = useRef(null);

  // const [subject, setSubject] = useState(userData.subjects?.join(', ') || '');
  const [subject, setSubject] = useState(
    Array.isArray(userData.subjects) ? userData.subjects.join(', ') : userData.subjects || ''
  );
  const [status, setStatus] = useState(userData.status || 'Later');
  const [bio, setBio] = useState(userData.bio || '');
  const [changePhoto, setChangePhoto] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ Handle photo upload
  const handleChangePhotoClick = () => {
    setChangePhoto(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      await updateProfilePicture(file);
      toast.success('Profile photo updated!');
      await fetchUserDetails();
    } catch (err) {
      toast.error('Failed to update photo');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  // ✅ Handle photo removal
  const handleRemovePhoto = async () => {
    setChangePhoto(false);
    setRemovingPhoto(true);
    try {
      await axiosInstance.delete('/api/profile-picture');
      toast.success('Profile photo removed');
      await fetchUserDetails();
    } catch (err) {
      toast.error('Failed to remove photo');
    } finally {
      setRemovingPhoto(false);
    }
  };

  // ✅ Handle save
  // const handleSaveChanges = async () => {
  //   setSaving(true);
  //   try {
  //     const updates = {
  //       subjects: subject.split(',').map(s => s.trim()).filter(Boolean),
  //       status,
  //     };

  //     const success = await editUserDetails(updates);
  //     if (success) {
  //       toast.success("Profile updated successfully!");
  //       setOpenManageUser(false);
  //     } else {
  //       toast.error("Failed to update profile");
  //     }
  //   } catch (error) {
  //     toast.error("Failed to update profile");
  //   } finally {
  //     setSaving(false);
  //   }
  // };
  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const updates = {};

      // ✅ Only include fields that have values
      if (subject.trim()) {
        updates.subjects = subject.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (status) {
        updates.status = status;
      }

      const success = await editUserDetails(updates);
      if (success) {
        toast.success("Profile updated successfully!");
        setOpenManageUser(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed right-0 top-0 w-full h-full md:w-1/3 md:h-full flex flex-col bg-[var(--bg-primary)] border-l border-[var(--border)] z-50">

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Manage Profile</h1>
        <button
          onClick={() => setOpenManageUser(false)}
          className="p-2 rounded-full bg-[var(--bg-card)] border border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-colors group">
          <IoClose className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-md mx-auto">

          {/* Profile Photo Section */}
          <div className="relative mb-8">
            <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {uploadingPhoto || removingPhoto ? (
                      <div className="w-12 h-12 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center">
                        <BeatLoader color="#6366f1" size={8} />
                      </div>
                    ) : (
                      <UserProfile />
                    )}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#22c55e] border-2 border-[var(--bg-secondary)] rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">{userData.name}</h2>
                    <p className="text-[var(--text-secondary)] text-sm">{status}</p>
                  </div>
                </div>
                <button
                  onClick={() => setChangePhoto(!changePhoto)}
                  className="px-4 py-2 text-sm font-medium text-[#818cf8] bg-[#6366f1]/10 border border-[#6366f1]/25 rounded-lg hover:bg-[#6366f1]/18 transition-colors">
                  {uploadingPhoto ? 'Uploading...' : removingPhoto ? 'Removing...' : 'Change Photo'}
                </button>
              </div>

              {/* Photo options dropdown */}
              {changePhoto && (
                <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-2 shadow-2xl">
                  <button
                    onClick={handleChangePhotoClick}
                    className="w-full text-left px-4 py-3 text-[#818cf8] hover:bg-[#6366f1]/10 rounded-lg transition-colors text-sm font-medium">
                    📷 Upload New Photo
                  </button>
                  {userData.profilePicture && (
                    <button
                      onClick={handleRemovePhoto}
                      className="w-full text-left px-4 py-3 text-[#f87171] hover:bg-[#ef4444]/10 rounded-lg transition-colors text-sm font-medium">
                      🗑️ Remove Current Photo
                    </button>
                  )}
                  <button
                    onClick={() => setChangePhoto(false)}
                    className="w-full text-left px-4 py-3 text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors text-sm">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">

            {/* Subjects */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">
                Subjects
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Math, Physics, React.js"
                className="w-full p-4 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl border border-[var(--border)] outline-none focus:ring-2 focus:ring-[#6366f1]/50 transition-colors"
              />
              <p className="text-[var(--text-muted)] text-xs">Separate subjects with commas</p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 150))}
                placeholder="Tell us about yourself..."
                className="w-full p-4 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl border border-[var(--border)] outline-none focus:ring-2 focus:ring-[#6366f1]/50 transition-colors resize-none"
                rows="3"
              />
              <p className="text-[var(--text-muted)] text-xs flex justify-between">
                <span>Share your interests and goals</span>
                <span>{bio.length}/150</span>
              </p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">
                Status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-4 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl border border-[var(--border)] outline-none focus:ring-2 focus:ring-[#6366f1]/50 transition-colors appearance-none cursor-pointer">
                  <option value="Later">⏰ Later</option>
                  <option value="Ready To Teach">👨‍🏫 Ready To Teach</option>
                  <option value="Ready To Learn">📖 Ready To Learn</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
        <button
          onClick={handleSaveChanges}
          disabled={saving}
          className="w-full py-4 bg-gradient-to-r from-[#3b82f6] to-[#6366f1] hover:opacity-90 text-white font-semibold rounded-xl transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
          {saving ? <><BeatLoader color="white" size={8} /><span>Saving...</span></> : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default ManageUser;
import React, { useState, useContext } from "react";
import UserProfile from "./UserProfile";
import { useEditUser } from "../Context/EditUserContext";
import { IoClose } from "react-icons/io5";
import { SettingsContext } from "../Context/SettingsContext";
import { useToast } from "../Context/ToastContext";

const ManageUser = () => {
  const { userData, editUserDetails, fetchUserDetails } = useEditUser();
  const { setOpenManageUser } = useContext(SettingsContext);
  const { toast } = useToast();

  const [subject, setSubject] = useState(userData.subject);
  const [status, setStatus] = useState(userData.status);
  // FIX: this field had no state, no onChange, and wasn't included in the
  // save payload — it was a textarea that looked editable and saved
  // nothing, with a "2/150" counter that was just static text regardless
  // of what was typed. Wired up for real, initialized from userData.bio
  // the same way subject/status already are.
  const [bio, setBio] = useState(userData.bio || '');
  const [allowUpload, setAllowUploads] = useState(false);
  const [changePhoto, setChangePhoto] = useState(false);

  // FIX: this called document.getElementById("file-input").click() — but
  // no element with id="file-input" was ever rendered anywhere in this
  // component. That call returns null, and .click() on null throws,
  // meaning "Upload Photo" crashed on click rather than doing anything.
  // UserProfile is already given `allowUpload` as a prop, which strongly
  // suggests it owns its own upload affordance internally when that's
  // true — so this just hands off to that instead of reaching for a
  // DOM node that was never there.
  const handleChangePhotoClick = () => {
    setAllowUploads(true);
    setChangePhoto(false);
  };

  // FIX: had no onClick at all — clicking "Remove Current Photo" did
  // nothing, silently. There's no user-photo-removal endpoint visible
  // from this file to call, so rather than guess at one (and fail
  // silently in a different way), this is honest about not being wired
  // up yet, the same way "Report a Problem" is in SettingsMenu.jsx.
  const handleRemovePhotoClick = () => {
    toast.info('Photo removal is coming soon.');
    setChangePhoto(false);
  };

  const handleSaveChanges = async () => {
    const updates = {
      subjects: subject,
      status: status,
      bio: bio,
    };

    await editUserDetails(updates);
    fetchUserDetails();
    toast.success("Profile updated successfully!");
    setOpenManageUser(false);
  };

  return (
    <div className="fixed right-0 top-0 w-full h-full md:w-1/3 md:h-full flex flex-col bg-[var(--bg-primary)] border-l border-[var(--border)] z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">
          Manage Profile
        </h1>
        <button
          onClick={() => setOpenManageUser(false)}
          className="p-2 rounded-full bg-[var(--bg-card)] border border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-colors group"
        >
          <IoClose className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-md mx-auto">
          {/* Profile Section */}
          <div className="relative mb-8">
            <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <UserProfile allowUpload={allowUpload} />
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
                  onClick={() => setChangePhoto(true)}
                  className="px-4 py-2 text-sm font-medium text-[#818cf8] bg-[#6366f1]/10 border border-[#6366f1]/25 rounded-lg hover:bg-[#6366f1]/18 transition-colors"
                >
                  Change Photo
                </button>
              </div>

              {/* Change Photo Menu */}
              {changePhoto && (
                <div className="absolute top-full left-6 right-6 mt-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-4 shadow-2xl z-10">
                  <div className="space-y-1">
                    <button
                      onClick={handleChangePhotoClick}
                      className="w-full text-left px-4 py-3 text-[#818cf8] hover:bg-[#6366f1]/10 rounded-lg transition-colors"
                    >
                      Upload Photo
                    </button>
                    <button
                      onClick={handleRemovePhotoClick}
                      className="w-full text-left px-4 py-3 text-[#f87171] hover:bg-[#ef4444]/10 rounded-lg transition-colors"
                    >
                      Remove Current Photo
                    </button>
                    <button
                      onClick={() => setChangePhoto(false)}
                      className="w-full text-left px-4 py-3 text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Subject Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter your subjects"
                className="w-full p-4 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl border border-[var(--border)] outline-none focus:ring-2 focus:ring-[#6366f1]/50 focus:border-[#6366f1]/50 transition-colors"
              />
            </div>

            {/* Bio Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 150))}
                placeholder="Tell us about yourself..."
                className="w-full p-4 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl border border-[var(--border)] outline-none focus:ring-2 focus:ring-[#6366f1]/50 focus:border-[#6366f1]/50 transition-colors resize-none"
                rows="4"
              />
              <p className="text-[var(--text-muted)] text-xs flex justify-between">
                <span>Share your interests and goals</span>
                <span>{bio.length}/150</span>
              </p>
            </div>

            {/* Status Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">
                Status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-4 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl border border-[var(--border)] outline-none focus:ring-2 focus:ring-[#6366f1]/50 focus:border-[#6366f1]/50 transition-colors appearance-none cursor-pointer"
                >
                  <option value="Later">Later</option>
                  <option value="Ready To Teach">Ready To Teach</option>
                  <option value="Ready To Learn">Ready To Learn</option>
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
          className="w-full py-4 bg-gradient-to-r from-[#3b82f6] to-[#6366f1] hover:opacity-90 text-white font-semibold rounded-xl transition-opacity"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ManageUser;
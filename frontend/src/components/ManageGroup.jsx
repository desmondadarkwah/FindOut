import React, { useState, useContext, useEffect, useCallback } from "react";
import { IoClose } from "react-icons/io5";
import { MdDelete, MdLock, MdPublic, MdExitToApp } from "react-icons/md";
import { FaCrown } from "react-icons/fa";
import { RxAvatar } from "react-icons/rx";
import { CiLink } from "react-icons/ci";
import { FiCopy, FiCheck } from "react-icons/fi";
import { SettingsContext } from "../Context/SettingsContext";
import GroupProfile from "./GroupProfile";
import { ChatContext } from "../Context/ChatContext";
import { GroupProfileContext } from "../Context/groupProfileContext";
import { SuggestionsContext } from "../Context/SuggestionsContext";
import axiosInstance from "../utils/axiosInstance";
import { BeatLoader } from "react-spinners";
import { useToast } from "../Context/ToastContext";
import socket from '../socket/socket';

const ManageGroup = () => {
  const { selectedChat, userId, setSelectedChat, setChats } = useContext(ChatContext);
  const [allowUpload, setAllowUploads] = useState(false);
  const [changePhoto, setChangePhoto] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [copied, setCopied] = useState(false);
  const [privacy, setPrivacy] = useState(selectedChat?.privacy || 'public');
  const [updatingPrivacy, setUpdatingPrivacy] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(selectedChat?.pendingRequests || []);
  const [handlingRequest, setHandlingRequest] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);

  // Editable fields for admin
  const [groupName, setGroupName] = useState(selectedChat?.groupName || '');
  const [subjects, setSubjects] = useState(selectedChat?.subjects?.join(', ') || '');
  const [description, setDescription] = useState(selectedChat?.description || '');

  const { setOpenGroupManager } = useContext(SettingsContext);
  const { setGroupId } = useContext(GroupProfileContext);
  const { handleConnectPrivateChat } = useContext(SuggestionsContext);
  const { toast, confirm } = useToast();

  const isAdmin = selectedChat?.groupAdmin?._id === userId || selectedChat?.groupAdmin === userId;
  const members = selectedChat?.members || [];
  const adminId = selectedChat?.groupAdmin?._id || selectedChat?.groupAdmin;

  const inviteLink = selectedChat?.inviteCode
    ? `${window.location.origin}/join/${selectedChat.inviteCode}`
    : '';

  // Update local state when selectedChat changes
  useEffect(() => {
    if (selectedChat) {
      setGroupName(selectedChat.groupName || '');
      setSubjects(selectedChat.subjects?.join(', ') || '');
      setDescription(selectedChat.description || '');
      setPrivacy(selectedChat?.privacy || 'public');
      setPendingRequests(selectedChat.pendingRequests || []);
    }
  }, [selectedChat?._id]);

  // Real-time + polled updates for admin
  // NOTE: `toast` is intentionally excluded from deps below — if it's not
  // memoized by ToastContext, including it will re-create this interval and
  // re-subscribe the socket listeners on every render. If ToastContext later
  // wraps its value in useMemo/useCallback, it's safe to add back.
  useEffect(() => {
    if (!selectedChat?._id || !isAdmin) return;

    let cancelled = false;

    const fetchGroupDetails = async () => {
      try {
        const response = await axiosInstance.get(`/api/group/${selectedChat._id}`);
        if (!cancelled && response.data.group) {
          setPendingRequests(response.data.group.pendingRequests || []);
          setPrivacy(response.data.group.privacy || 'public');
        }
      } catch (error) {
        console.error('Error fetching group details:', error);
      }
    };

    fetchGroupDetails();
    const interval = setInterval(fetchGroupDetails, 5000);

    const handlePendingRequestsUpdated = ({ groupId, pendingRequests: updated }) => {
      if (groupId === selectedChat._id) {
        setPendingRequests(updated || []);
      }
    };

    const handleNewJoinRequest = ({ groupId, group }) => {
      if (groupId === selectedChat._id) {
        setPendingRequests(group.pendingRequests || []);
        toast.info('New join request received', 'Join Request');
      }
    };

    if (socket) {
      socket.on('pending-requests-updated', handlePendingRequestsUpdated);
      socket.on('new-join-request', handleNewJoinRequest);
    }

    return () => {
      cancelled = true;
      clearInterval(interval);
      if (socket) {
        socket.off('pending-requests-updated', handlePendingRequestsUpdated);
        socket.off('new-join-request', handleNewJoinRequest);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat?._id, isAdmin]);

  // ─────────────────────────────────────────
  // SAVE GROUP CHANGES (Admin Only)
  // ─────────────────────────────────────────
  const handleSaveChanges = async () => {
    if (!isAdmin) return;

    setSaving(true);
    try {
      const response = await axiosInstance.put('/api/edit-group', {
        groupId: selectedChat._id,
        groupName: groupName.trim(),
        subjects: subjects.split(',').map(s => s.trim()).filter(Boolean),
        description: description.trim()
      });

      if (response.data.success) {
        setSelectedChat(prev => ({
          ...prev,
          groupName: groupName.trim(),
          subjects: subjects.split(',').map(s => s.trim()).filter(Boolean),
          description: description.trim()
        }));

        setChats(prevChats =>
          prevChats.map(chat =>
            chat._id === selectedChat._id
              ? {
                ...chat,
                groupName: groupName.trim(),
                subjects: subjects.split(',').map(s => s.trim()).filter(Boolean),
                description: description.trim()
              }
              : chat
          )
        );

        toast.success('Group details updated successfully!', 'Changes Saved');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error(error.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────
  // COPY LINK
  // ─────────────────────────────────────────
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied to clipboard!', 'Copied');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link');
    }
  };

  // ─────────────────────────────────────────
  // PHOTO HANDLERS (Admin Only)
  // ─────────────────────────────────────────
  const handleChangePhotoClick = () => {
    if (!isAdmin) return;
    setAllowUploads(true);
    setGroupId(selectedChat._id);
    setChangePhoto(false);
    document.getElementById("group-file-input").click();
  };

  // Now actually uploads the file to the backend instead of just logging it.
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedChat?._id) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('groupId', selectedChat._id);
      formData.append('photo', file);

      const response = await axiosInstance.put('/api/group/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        const newPhotoUrl = response.data.profilePicture;

        setSelectedChat(prev => ({ ...prev, profilePicture: newPhotoUrl }));
        setChats(prevChats =>
          prevChats.map(chat =>
            chat._id === selectedChat._id
              ? { ...chat, profilePicture: newPhotoUrl }
              : chat
          )
        );

        toast.success('Group photo updated!', 'Photo Updated');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
      setAllowUploads(false);
      // reset the input so selecting the same file again still fires onChange
      e.target.value = '';
    }
  };

  // Now actually calls the backend to remove the photo instead of only
  // resetting local UI state.
  const handleRemovePhoto = async () => {
    if (!isAdmin || !selectedChat?._id) return;

    setRemovingPhoto(true);
    try {
      const response = await axiosInstance.delete('/api/group/photo', {
        data: { groupId: selectedChat._id }
      });

      if (response.data.success) {
        setSelectedChat(prev => ({ ...prev, profilePicture: null }));
        setChats(prevChats =>
          prevChats.map(chat =>
            chat._id === selectedChat._id
              ? { ...chat, profilePicture: null }
              : chat
          )
        );
        toast.success('Group photo removed', 'Photo Removed');
      }
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error(error.response?.data?.message || 'Failed to remove photo');
    } finally {
      setRemovingPhoto(false);
      setAllowUploads(false);
      setChangePhoto(false);
      setGroupId(selectedChat._id);
    }
  };

  // ─────────────────────────────────────────
  // REMOVE MEMBER (Admin Only)
  // ─────────────────────────────────────────
  const handleRemoveMember = async (memberId, memberName) => {
    if (!isAdmin) return;

    const confirmed = await confirm({
      title: 'Remove Member',
      message: `Are you sure you want to remove ${memberName || 'this member'} from the group?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      confirmStyle: 'danger'
    });

    if (!confirmed) return;

    setRemoving(memberId);
    try {
      const response = await axiosInstance.put('/api/groups/remove-member', {
        groupId: selectedChat._id,
        memberId
      });

      if (response.data.success) {
        toast.success(`${memberName || 'Member'} has been removed`, 'Member Removed');

        setSelectedChat(prev => ({
          ...prev,
          members: prev.members.filter(m => (m._id || m) !== memberId)
        }));

        setChats(prevChats =>
          prevChats.map(chat =>
            chat._id === selectedChat._id
              ? { ...chat, members: chat.members.filter(m => (m._id || m) !== memberId) }
              : chat
          )
        );
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(error.response?.data?.message || 'Failed to remove member');
    } finally {
      setRemoving(null);
    }
  };

  // ─────────────────────────────────────────
  // LEAVE GROUP (Member Only)
  // ─────────────────────────────────────────
  const handleLeaveGroup = async () => {
    const confirmed = await confirm({
      title: 'Leave Group',
      message: `Are you sure you want to leave ${selectedChat.groupName}?`,
      confirmText: 'Leave',
      cancelText: 'Cancel',
      confirmStyle: 'warning'
    });

    if (!confirmed) return;

    try {
      const response = await axiosInstance.post('/api/groups/leave', {
        groupId: selectedChat._id
      });

      if (response.data.success) {
        toast.success('You left the group', 'Left Group');
        setOpenGroupManager(false);
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error(error.response?.data?.message || 'Failed to leave group');
    }
  };

  // ─────────────────────────────────────────
  // CLICK MEMBER → DM
  // ─────────────────────────────────────────
  const handleMemberClick = (memberId) => {
    if (memberId === userId) return;
    setOpenGroupManager(false);
    handleConnectPrivateChat(memberId);
  };

  // ─────────────────────────────────────────
  // PRIVACY TOGGLE (Admin Only)
  // ─────────────────────────────────────────
  const handlePrivacyToggle = async (newPrivacy) => {
    if (!isAdmin || newPrivacy === privacy) return;

    setUpdatingPrivacy(true);
    try {
      const response = await axiosInstance.put('/api/groups/update-privacy', {
        groupId: selectedChat._id,
        privacy: newPrivacy
      });

      if (response.data.success) {
        setPrivacy(newPrivacy);
        // Fixed: was `newPrivacy ? 'Private' : 'Public'`, which is always
        // truthy for a non-empty string and so always said "Private".
        toast.success(
          `Group is now ${newPrivacy === 'private' ? 'Private' : 'Public'}`,
          'Privacy Updated'
        );
      }
    } catch (error) {
      console.error('Error updating privacy:', error);
      toast.error(error.response?.data?.message || 'Failed to update privacy');
    } finally {
      setUpdatingPrivacy(false);
    }
  };

  // ─────────────────────────────────────────
  // HANDLE JOIN REQUEST (Admin Only)
  // ─────────────────────────────────────────
  const handleJoinRequest = async (reqUserId, action, userName) => {
    if (!isAdmin) return;

    setHandlingRequest(reqUserId);
    try {
      const response = await axiosInstance.post('/api/groups/handle-join-request', {
        groupId: selectedChat._id,
        userId: reqUserId,
        action
      });

      if (response.data.success) {
        setPendingRequests(prev =>
          prev.filter(r => {
            const id = r.userId?._id || r.userId;
            return id !== reqUserId;
          })
        );

        if (action === 'approve') {
          toast.success(`${userName || 'User'} has been added to the group`, 'Request Approved');
        } else {
          toast.info(`${userName || 'User'}'s request has been declined`, 'Request Denied');
        }

        setTimeout(async () => {
          try {
            const refreshResponse = await axiosInstance.get(`/api/groups/${selectedChat._id}`);
            if (refreshResponse.data.group) {
              setPendingRequests(refreshResponse.data.group.pendingRequests || []);
            }
          } catch (err) {
            console.error('Error refreshing:', err);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error handling request:', error);
      toast.error(error.response?.data?.message || 'Failed to handle request');
    } finally {
      setHandlingRequest(null);
    }
  };

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <div className="fixed right-0 top-0 w-full h-full max-w-[806px] mx-auto flex flex-col items-center bg-gray-950 z-50">
      <input
        type="file"
        id="group-file-input"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Close Button */}
      <span className="cursor-default flex justify-end w-full text-red-500 font-bold p-4">
        <IoClose
          onClick={(e) => {
            e.stopPropagation();
            setOpenGroupManager(false);
          }}
          className="cursor-pointer"
          size={28}
        />
      </span>

      <div className="w-full shadow-lg p-4 bg-gray-950 overflow-y-auto cursor-default">

        {/* ─── GROUP PROFILE ─── */}
        <div className="flex flex-col items-center mb-6">
          <div
            onClick={() => isAdmin && setChangePhoto(true)}
            className={`flex items-center justify-center rounded ${isAdmin ? 'cursor-pointer' : ''}`}>
            <GroupProfile allowUpload={allowUpload} width="w-24" height="h-24" />
          </div>

          <span className="text-white font-semibold text-lg mt-2">
            {selectedChat.groupName}
          </span>
          <span className="text-gray-400 text-sm">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </span>

          {/* Privacy Badge */}
          <span className={`mt-1 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${privacy === 'private'
            ? 'bg-purple-900/50 text-purple-400 border border-purple-700'
            : 'bg-blue-900/50 text-blue-400 border border-blue-700'
            }`}>
            {privacy === 'private' ? <MdLock size={10} /> : <MdPublic size={10} />}
            {privacy === 'private' ? 'Private Group' : 'Public Group'}
          </span>

          {/* Admin Badge */}
          {isAdmin && (
            <span className="mt-2 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 bg-yellow-900/50 text-yellow-400 border border-yellow-700">
              <FaCrown size={10} />
              Group Admin
            </span>
          )}

          {/* Admin Only: Photo Change Options */}
          {isAdmin && changePhoto && (
            <div className="bg-gray-800 absolute mt-32 p-3 w-64 flex flex-col items-center gap-3 shadow-lg border border-gray-700 rounded-lg z-10">
              <span
                onClick={handleChangePhotoClick}
                className={`block text-blue-400 cursor-pointer hover:underline ${uploadingPhoto ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
              </span>
              <span
                onClick={handleRemovePhoto}
                className={`block text-red-500 cursor-pointer hover:underline ${removingPhoto ? 'opacity-50 pointer-events-none' : ''}`}>
                {removingPhoto ? 'Removing...' : 'Remove Current Photo'}
              </span>
              <span
                onClick={() => setChangePhoto(false)}
                className="block text-gray-300 cursor-pointer hover:underline">
                Cancel
              </span>
            </div>
          )}
        </div>

        {/* ─── INVITE LINK ─── */}
        {inviteLink && (
          <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-medium text-sm">Group Invite Link</span>
              <CiLink size={20} className="text-gray-500" />
            </div>

            <a href={inviteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-gray-800 text-blue-500 rounded-lg mb-3 text-sm hover:bg-gray-700 transition break-all border border-gray-700">
              {inviteLink}
            </a>

            <button
              onClick={handleCopyLink}
              className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center justify-center gap-2">
              {copied ? (
                <>
                  <FiCheck size={18} />
                  <span className="font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <FiCopy size={18} />
                  <span className="font-medium">Copy Invite Link</span>
                </>
              )}
            </button>

            <p className="text-gray-500 text-xs mt-3 text-center">
              Share this link to invite others
            </p>
          </div>
        )}

        {/* ─── MEMBERS SECTION ─── */}
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            Members
            <span className="text-gray-400 text-sm">({members.length})</span>
          </h3>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {members.map((member) => {
              const memberId = member._id || member;
              const isGroupAdmin = memberId === adminId;
              const isCurrentUser = memberId === userId;
              const isRemoving = removing === memberId;

              return (
                <div
                  key={memberId}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition border border-gray-700">

                  {/* Avatar */}
                  <div
                    onClick={() => !isCurrentUser && handleMemberClick(memberId)}
                    className={`flex-shrink-0 ${!isCurrentUser ? 'cursor-pointer' : ''}`}>
                    {member.profilePicture ? (
                      <img
                        src={`${import.meta.env.VITE_BACKEND_URL}${member.profilePicture}`}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                        <RxAvatar size={24} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div
                    onClick={() => !isCurrentUser && handleMemberClick(memberId)}
                    className={`flex-1 min-w-0 ${!isCurrentUser ? 'cursor-pointer' : ''}`}>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium truncate">
                        {member.name || 'Unknown'}
                      </p>
                      {isGroupAdmin && (
                        <FaCrown className="text-yellow-500" size={14} title="Admin" />
                      )}
                      {isCurrentUser && (
                        <span className="text-xs text-blue-400">(You)</span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm truncate">
                      {member.email || ''}
                    </p>
                    {!isCurrentUser && (
                      <p className="text-gray-500 text-xs">Click to message</p>
                    )}
                  </div>

                  {/* Remove Button (Admin Only) */}
                  {isAdmin && !isGroupAdmin && !isCurrentUser && (
                    <button
                      onClick={() => handleRemoveMember(memberId, member.name)}
                      disabled={isRemoving}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50"
                      title="Remove member">
                      {isRemoving ? (
                        <BeatLoader color="white" size={8} />
                      ) : (
                        <MdDelete size={18} />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─────────────────────────────────────── */}
        {/* ADMIN-ONLY SETTINGS */}
        {/* ─────────────────────────────────────── */}
        {isAdmin && (
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-white font-semibold mb-4">Admin Settings</h3>

            {/* Privacy Toggle */}
            <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white font-medium text-sm">Group Privacy</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {privacy === 'private'
                      ? '🔒 Members must request to join'
                      : '🌍 Anyone can join instantly'}
                  </p>
                </div>
                {updatingPrivacy && <BeatLoader color="white" size={8} />}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handlePrivacyToggle('public')}
                  disabled={updatingPrivacy}
                  className={`flex-1 p-3 rounded-lg border transition-all flex flex-col items-center gap-1 ${privacy === 'public'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}>
                  <MdPublic size={20} />
                  <span className="text-xs font-medium">Public</span>
                </button>

                <button
                  onClick={() => handlePrivacyToggle('private')}
                  disabled={updatingPrivacy}
                  className={`flex-1 p-3 rounded-lg border transition-all flex flex-col items-center gap-1 ${privacy === 'private'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}>
                  <MdLock size={20} />
                  <span className="text-xs font-medium">Private</span>
                </button>
              </div>
            </div>

            {/* Pending Join Requests */}
            {privacy === 'private' && (
              <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white font-medium text-sm">Join Requests</p>
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingRequests.length}
                  </span>
                </div>

                {pendingRequests.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-2">
                    No pending requests
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {pendingRequests.map((request) => {
                      const reqUserId = request.userId?._id || request.userId;
                      const reqUserName = request.userId?.name || 'Unknown User';
                      const reqUserPic = request.userId?.profilePicture;
                      const isHandling = handlingRequest === reqUserId;

                      return (
                        <div
                          key={reqUserId}
                          className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700">

                          {reqUserPic ? (
                            <img
                              src={`${import.meta.env.VITE_BACKEND_URL}${reqUserPic}`}
                              alt={reqUserName}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                              <RxAvatar size={20} />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {reqUserName}
                            </p>
                            <p className="text-gray-500 text-xs">Wants to join</p>
                          </div>

                          {isHandling ? (
                            <BeatLoader color="white" size={8} />
                          ) : (
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={() => handleJoinRequest(reqUserId, 'approve', reqUserName)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition">
                                Approve
                              </button>
                              <button
                                onClick={() => handleJoinRequest(reqUserId, 'deny', reqUserName)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition">
                                Deny
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* EDITABLE FIELDS FOR ADMIN */}
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-1">Group Name</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name..."
                className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-1">Group Subjects</label>
              <input
                type="text"
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                placeholder="Math, Physics, Chemistry..."
                className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring focus:ring-blue-500"
              />
              <p className="text-gray-500 text-xs mt-1">Separate subjects with commas</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="About this group..."
                className="w-full p-3 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring focus:ring-blue-500"
                rows="3"
              />
            </div>

            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md transition disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? (
                <>
                  <BeatLoader color="white" size={8} />
                  <span>Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        )}

        {/* ─────────────────────────────────────── */}
        {/* MEMBER-ONLY OPTIONS */}
        {/* ─────────────────────────────────────── */}
        {!isAdmin && (
          <div className="border-t border-gray-700 pt-4">
            <button
              onClick={handleLeaveGroup}
              className="w-full p-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition flex items-center justify-center gap-2">
              <MdExitToApp size={20} />
              <span className="font-medium">Leave Group</span>
            </button>
            <p className="text-gray-500 text-xs mt-2 text-center">
              You'll no longer receive messages from this group
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageGroup;
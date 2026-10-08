import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { RxAvatar } from 'react-icons/rx';
import { Check } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { BeatLoader } from 'react-spinners';
import { useToast } from '../Context/ToastContext';

const AddMembersModal = ({ isOpen, onClose, groupId, existingMembers }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const response = await axiosInstance.get(`/api/search-users?q=${query}`);
      const availableUsers = response.data.users.filter(
        user => !existingMembers.includes(user._id)
      );
      setSearchResults(availableUsers);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u._id === user._id);
      if (isSelected) return prev.filter(u => u._id !== user._id);
      return [...prev, user];
    });
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;
    setAdding(true);
    try {
      const response = await axiosInstance.post('/api/add-member', {
        groupId,
        memberIds: selectedUsers.map(u => u._id)
      });

      if (response.data.success) {
        toast.success(
          `${selectedUsers.length} member${selectedUsers.length > 1 ? 's' : ''} added successfully`,
          'Members Added'
        );
        setSelectedUsers([]);
        setSearchQuery('');
        setSearchResults([]);
        onClose();
      }
    } catch (error) {
      console.error('Error adding members:', error);
      toast.error(error.response?.data?.message || 'Failed to add members');
    } finally {
      setAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-secondary)] rounded-lg w-full max-w-md max-h-[80vh] flex flex-col border border-[var(--border)]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Add Members</h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <IoClose size={24} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-lg outline-none focus:ring-2 focus:ring-[#6366f1]/50 border border-[var(--border)]"
            autoFocus
          />
          <p className="text-[var(--text-muted)] text-xs mt-2">
            Type at least 2 characters to search
          </p>
        </div>

        {/* Selected Users Pills */}
        {selectedUsers.length > 0 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {selectedUsers.map(user => (
              <div key={user._id} className="flex items-center gap-2 bg-[#6366f1]/20 border border-[#6366f1]/30 px-3 py-1 rounded-full">
                <span className="text-[var(--text-primary)] text-sm">{user.name}</span>
                <button
                  onClick={() => toggleUserSelection(user)}
                  className="text-[var(--text-secondary)] hover:text-[#f87171] transition-colors">
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {searching ? (
            <div className="flex justify-center items-center py-8">
              <BeatLoader color="var(--text-secondary)" size={10} />
              <p className="text-[var(--text-primary)] ml-2 text-sm">Searching...</p>
            </div>
          ) : searchQuery.trim().length < 2 ? (
            <div className="text-center py-8">
              <p className="text-[var(--text-secondary)] text-sm">
                Search for users by name or email to add them to the group
              </p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[var(--text-secondary)]">No users found</p>
              <p className="text-[var(--text-muted)] text-xs mt-2">
                They might already be in the group
              </p>
            </div>
          ) : (
            searchResults.map((user) => {
              const isSelected = selectedUsers.some(u => u._id === user._id);
              return (
                <div
                  key={user._id}
                  onClick={() => toggleUserSelection(user)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition mb-2 border ${isSelected
                      ? 'bg-[#6366f1]/15 border-[#6366f1]/40'
                      : 'hover:bg-[var(--bg-card-hover)] border-[var(--border)]'
                    }`}>
                  {user.profilePicture ? (
                    <img
                      src={
                        user.profilePicture?.startsWith('http')
                          ? user.profilePicture
                          : `${import.meta.env.VITE_BACKEND_URL}${user.profilePicture}`
                      }
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-[var(--bg-card-hover)] rounded-full flex items-center justify-center">
                      <RxAvatar size={24} className="text-[var(--text-secondary)]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--text-primary)] font-medium truncate">{user.name}</p>
                    <p className="text-[var(--text-secondary)] text-sm truncate">{user.email}</p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 bg-[#6366f1] rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={12} color="#fff" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)]">
          <button
            onClick={handleAddMembers}
            disabled={selectedUsers.length === 0 || adding}
            className="w-full py-3 bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {adding ? 'Adding...' : selectedUsers.length === 0
              ? 'Select members to add'
              : `Add ${selectedUsers.length} Member(s)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMembersModal;
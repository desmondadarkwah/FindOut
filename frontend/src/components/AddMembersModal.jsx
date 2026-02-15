import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { RxAvatar } from 'react-icons/rx';
import axiosInstance from '../utils/axiosInstance';
import { BeatLoader } from 'react-spinners';

const AddMembersModal = ({ isOpen, onClose, groupId, existingMembers }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);

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
      console.error('❌ Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u._id === user._id);
      if (isSelected) {
        return prev.filter(u => u._id !== user._id);
      } else {
        return [...prev, user];
      }
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
        alert(response.data.message);
        setSelectedUsers([]);
        setSearchQuery('');
        setSearchResults([]);
        onClose();
      }
    } catch (error) {
      console.error('❌ Error adding members:', error);
      alert(error.response?.data?.message || 'Failed to add members');
    } finally {
      setAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Add Members</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
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
            className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <p className="text-gray-400 text-xs mt-2">
            Type at least 2 characters to search
          </p>
        </div>

        {/* Selected Users Pills */}
        {selectedUsers.length > 0 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {selectedUsers.map(user => (
              <div key={user._id} className="flex items-center gap-2 bg-blue-900 px-3 py-1 rounded-full">
                <span className="text-white text-sm">{user.name}</span>
                <button 
                  onClick={() => toggleUserSelection(user)}
                  className="text-white hover:text-red-400"
                >
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
              <BeatLoader color="white" size={10} />
              <p className="text-white ml-2 text-sm">Searching...</p>
            </div>
          ) : searchQuery.trim().length < 2 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">
                Search for users by name or email to add them to the group
              </p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No users found</p>
              <p className="text-gray-500 text-xs mt-2">
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
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition mb-2 ${
                    isSelected
                      ? 'bg-blue-900 border border-blue-500'
                      : 'hover:bg-gray-800 border border-gray-700'
                  }`}>
                  {user.profilePicture ? (
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}${user.profilePicture}`}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                      <RxAvatar size={24} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{user.name}</p>
                    <p className="text-gray-400 text-sm truncate">{user.email}</p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleAddMembers}
            disabled={selectedUsers.length === 0 || adding}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {adding ? 'Adding...' : selectedUsers.length === 0 ? 'Select members to add' : `Add ${selectedUsers.length} Member(s)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMembersModal;

import React, { useContext } from 'react';
import { SuggestionsContext } from '../Context/SuggestionsContext';

const MobileViewSuggest = () => {
  const { suggestedUsers, suggestedGroups, loading, handleConnectPrivateChat } = useContext(SuggestionsContext);

  if (loading) {
    const totalSuggestions = (suggestedUsers?.length) + (suggestedGroups?.length);

    return (
      <div className="block md:hidden flex overflow-x-auto space-x-4 p-1 bg-black">
        {Array.from({ length: totalSuggestions }).map((_, index) => (
          <div key={index} className="flex flex-col items-center animate-pulse">
            <div className="w-16 h-16 rounded-full bg-gray-700"></div>
            <div className="w-12 h-3 bg-gray-700 rounded mt-2"></div>
            <div className="w-16 h-2 bg-gray-800 rounded mt-1"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="block md:hidden flex overflow-x-auto space-x-4 p-1 bg-black">
      <span className='flex gap-4'>
        {suggestedUsers.map((user) => (
          <div key={user._id} className="flex flex-col items-center">
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}${user.profilePicture}`}
              alt={user.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-blue-600"
            />
            <span
              onClick={() => handleConnectPrivateChat(user._id)}
              className="text-gray-200 text-sm hover:text-blue-600 cursor-pointer">{user.name}</span>
            <span className="text-gray-400 text-xs">{user.status}</span>
          </div>
        ))}
      </span>

      <span className='flex gap-4'>
        {suggestedGroups.map((group) => (
          <div key={group._id} className="flex flex-col items-center">
            {group.groupProfile ? (
              <img
                src={
                  group.groupProfile.startsWith('/uploads/')
                    ? `${import.meta.env.VITE_BACKEND_URL}${group.groupProfile}`
                    : `${import.meta.env.VITE_BACKEND_URL}/uploads/${group.groupProfile}`
                }
                alt={group.groupName}
                className="w-14 h-14 rounded-full object-cover border-2 border-green-500"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center border-2 border-green-500">
                <RxAvatar size={32} />
              </div>
            )}
            <span className="text-gray-200 text-sm hover:text-blue-600 cursor-pointer">{group.groupName}</span>
            <span className="text-gray-400 text-xs">{group.subjects}</span>
          </div>
        ))}
      </span>
    </div>
  );
};

export default MobileViewSuggest;
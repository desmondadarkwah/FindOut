import React, { useContext } from 'react';
import { BeatLoader } from 'react-spinners';
import { SuggestionsContext } from '../Context/SuggestionsContext';

const MobileViewSuggest = () => {
  const { suggestedUsers, suggestedGroups, loading } = useContext(SuggestionsContext);

  if (loading) {
    return (
      <span className="ml-28 block md:hidden">
        <BeatLoader color="white" size={10} />
      </span>
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
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-600"
            />
            <span className="text-gray-200 text-sm">{user.name}</span>
            <span className="text-gray-400 text-xs">{user.status}</span>
          </div>
        ))}
      </span>

      <span>
        {suggestedGroups.map((group) => (
          <div key={group._id} className="flex flex-col items-center">
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}${group.profilePicture}`} // Ensure groups have a profilePicture field
              alt={group.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-green-500"
            />
            <span className="text-white text-sm mt-1">{group.name}</span>
          </div>
        ))}
      </span>
    </div>
  );
};

export default MobileViewSuggest;
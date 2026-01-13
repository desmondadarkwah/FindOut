import React, { useContext } from "react";
import { RxAvatar } from "react-icons/rx";
import { BeatLoader } from "react-spinners";
import { SuggestionsContext } from "../Context/SuggestionsContext";

const Suggestions = () => {
  const { suggestedUsers, suggestedGroups, loading,handleConnectPrivateChat } = useContext(SuggestionsContext);


  if (loading) {
    return <span className="ml-28"><BeatLoader color="white" size={10} /></span>;
  }



  return (
    <div className="p-2 w-full bg-black">
      {suggestedUsers.map((user) => (
        <div key={user._id} className="flex items-center justify-between p-1">
          <div className="flex items-center gap-2">
            {user.profilePicture ? (
              <img
                src={`${import.meta.env.VITE_BACKEND_URL}${user.profilePicture}`}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                <RxAvatar size={20} />
              </div>
            )}
            <span className="flex flex-col">
              <span className="font-semibold text-white truncate block w-32">{user.name}</span>
              <span className="block text-gray-500 text-sm">{user.status}</span>
            </span>
          </div>
          <button
            onClick={() => handleConnectPrivateChat(user._id)}
            className="text-blue-500 text-sm">
            Connect
          </button>
        </div>
      ))}

      {suggestedGroups.map((group) => {

        return (
          <div key={group._id} className="flex items-center justify-between p-1">
            <div className="flex items-center gap-2">
              {group.groupProfile ? (
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL}${group.groupProfile}`}
                  alt={group.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                  <RxAvatar size={20} />
                </div>
              )}
              <span className="flex flex-col">
                <span className="font-semibold text-white truncate block w-32">{group.groupName}</span>
                {/* <span className="text-sm text-gray-500">{group.subjects.join(", ")}</span> */}
              </span>
            </div>
            <button className="text-blue-500 text-sm">
              Join
            </button>
          </div>)
      })}
    </div>
  );
};

export default Suggestions;

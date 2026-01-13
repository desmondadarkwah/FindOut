import React, { useEffect } from "react";
import { useEditUser } from "../Context/EditUserContext";
import { FaCircle } from "react-icons/fa";

const StatusUpdate = () => {
  const { userData, fetchUserDetails } = useEditUser();
  const currentStatus = userData.status;

  useEffect(() => {
    fetchUserDetails()
  }, [])

  return (
    <section className="mb-6 flex flex-col">
      <span className="text-xl font-semibold flex items-center gap-2">
        Status{" "}
        <FaCircle
          size={15}
          color={
            currentStatus === "Ready To Teach"
              ? "green"
              : currentStatus === "Ready To Learn"
                ? "yellow"
                : "gray"
          }
        />
      </span>
      <p className="text-gray-400 text-sm mb-2">
        Set your status to receive personalized group and friend suggestions.
        This helps us connect you with individuals aligned with your chosen
        status.
      </p>
      <div className="flex space-x-4">
        <button
          className={`px-4 py-2 text-sm rounded-md ${currentStatus === "Ready To Teach"
            ? "bg-green-600 text-white"
            : "bg-gray-700 text-white"
            }`}
          disabled
        >
          Ready to Teach
        </button>
        <button
          className={`px-4 py-2 text-sm rounded-md ${currentStatus === "Ready To Learn"
            ? "bg-yellow-600 text-white"
            : "bg-gray-700 text-white"
            }`}
          disabled
        >
          Ready to Learn
        </button>
        <button
          className={`px-4 py-2 text-sm rounded-md ${currentStatus === "Later"
            ? "bg-gray-500 text-white"
            : "bg-gray-700 text-white"
            }`}
          disabled
        >
          Later
        </button>
      </div>
    </section>
  );
};

export default StatusUpdate;

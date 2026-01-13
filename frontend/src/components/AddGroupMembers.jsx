import React, { useState } from "react";

const AddGroupMembers = ({ groupId }) => {
  const [memberEmail, setMemberEmail] = useState("");
  const [error, setError] = useState(null);

  const handleAddMember = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/add-members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ groupId, members: [memberEmail] }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to add member");
      }

      alert("Member added successfully!");
      setMemberEmail("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <input
        type="email"
        placeholder="Enter member's email"
        value={memberEmail}
        onChange={(e) => setMemberEmail(e.target.value)}
      />
      <button onClick={handleAddMember}>Add Member</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default AddGroupMembers;

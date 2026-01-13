const GroupModel = require("../models/GroupModel");


const InviteLink = async(req,res) =>{
  const {groupId} = req.body
  try{
const group = await GroupModel.findById(groupId)
if(!group){
  return res.status(404).json({ message: 'Group not found' });
}

 const inviteLink = `http://localhost:5173/invite/${groupId}`;

 res.json({ link: inviteLink });

  }catch(error){
    console.error('Error generating invite link:', error);
    res.status(500).json({ message: 'Error generating invite link' });
  }
}

module.exports = InviteLink
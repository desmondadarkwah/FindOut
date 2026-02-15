const express = require('express');
const router = express.Router();
const RegisterUser = require('../controllers/RegisterUser');
const LoginUser = require('../controllers/LoginUser');
const CreateGroup = require('../controllers/CreateGroup');
const authMiddleware = require('../middleware/authMiddleware');
const { sendVerificationEmail, VerifyEmail } = require('../controllers/VerifyEmail');
const upload = require('../middleware/upload');
const { audioUpload } = require('../middleware/AudioHandler');
const AddGroupMembers = require('../controllers/AddGroupMembers');
const EditGroupDetails = require('../controllers/EditGroupDetails');
const RemoveGroupMember = require('../controllers/RemoveGroupMember');
const { resendVerificationEmail } = require('../controllers/resendVerificationEmail');
const EditUserDetails = require('../controllers/EditUserDetails');
const GetGroupDetails = require('../controllers/GetGroupDetails');
const { RefreshToken } = require('../controllers/RefreshToken');
const GetAllChats = require('../controllers/GetAllChats');
const Suggestions = require('../controllers/Suggestions');
const UpdateProfilePicture = require('../controllers/UpdateProfilePicture');
const GetUserDetails = require('../controllers/GetUserDetails');
const Logout = require('../controllers/Logout');
const FetchAllGroups = require('../controllers/FetchAllGroups');
const DeleteGroup = require('../controllers/DeleteGroup');
const { GetMessages, SendMessage } = require('../controllers/MessageController');
const StartNewChat = require('../controllers/StartNewChat');
const UpdateGroupProfilePicture = require('../controllers/UpdateGroupProfilePicture');
const { AudioHandler } = require('../middleware/AudioHandler');
const { GetAllPost, TogglePostLikes, DeletePost, AddPost } = require('../controllers/PostController');
const { AddComment, GetComment, LikeComment, ReplyComment, GetRepliedComments, DeleteRepliedComment } = require('../controllers/CommentController');
const JoinGroup = require('../controllers/JoinGroup');
const SearchUsers = require('../controllers/SearchUsers');
const JoinGroupViaInvite = require('../controllers/JoinGroupViaInvite');

router.post('/register', upload.single('profilePicture'), RegisterUser);
router.post('/login', LoginUser);
router.post('/creategroup', upload.single('groupProfile'), authMiddleware, CreateGroup);
router.post('/send-verification-email', sendVerificationEmail);
router.get('/verify-email', VerifyEmail);
router.post('/add-member', authMiddleware, AddGroupMembers)
router.put('/edit-group', authMiddleware, EditGroupDetails)
router.put('/groups/remove-member', authMiddleware, RemoveGroupMember);
router.post('/resend-verification-email', resendVerificationEmail);
router.put('/edit-user', authMiddleware, EditUserDetails);
router.get('/group/:groupId', authMiddleware, GetGroupDetails);
router.post('/refresh-token', RefreshToken);
router.get('/chats', authMiddleware, GetAllChats);
router.get('/suggestions', authMiddleware, Suggestions);

router.post("/profile-picture", authMiddleware, upload.single("profilePicture"), UpdateProfilePicture);
router.post("/group-profile-picture", authMiddleware, upload.single("groupProfile"), UpdateGroupProfilePicture);
router.post('/join-group',authMiddleware,JoinGroup);

router.get("/user-details", authMiddleware, GetUserDetails);
router.post('/logout', authMiddleware, Logout);
router.get('/my-groups', authMiddleware, FetchAllGroups);
router.delete('/deletegroup/:groupId', authMiddleware, DeleteGroup);
router.get('/messages/:chatId', authMiddleware, GetMessages);
router.post('/messages', authMiddleware, SendMessage)
router.post('/start-new-chat', authMiddleware, StartNewChat);
router.post("/messages/audio", audioUpload.single("audio"), AudioHandler);
router.get('/search-users', authMiddleware, SearchUsers);
router.get('/join/:inviteCode', authMiddleware, JoinGroupViaInvite);



//post routes
router.post('/add-post', authMiddleware, AddPost);
router.get('/getallposts', GetAllPost);
router.post('/posts/:postId/like', authMiddleware, TogglePostLikes);
router.delete('/posts/delete-post/:postId', authMiddleware, DeletePost);

//post comment routes
router.post('/posts/:postId/comments', authMiddleware, AddComment);
router.get('/posts/:postId/get-comments', authMiddleware, GetComment);
router.post('/comments/:commentId/like', authMiddleware, LikeComment);

//commment routes
router.post('/comments/:commentId/reply', authMiddleware, ReplyComment)
router.get('/comments/:commentId/replies', authMiddleware, GetRepliedComments)
router.delete('/comments/:commentId/replies/:replyId', authMiddleware, DeleteRepliedComment)


module.exports = router;

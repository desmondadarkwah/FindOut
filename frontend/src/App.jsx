import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RegisterUser from './Pages/RegisterUser';
import LoginUser from './Pages/LoginUser';
import VerifyEmail from './Pages/VerifyEmail';
import Dashboard from './components/Dashboard';
import CreateGroup from './components/CreateGroup';
import ResendVerificationEmail from './components/ResendVerificationEmail';
import ChatSidebar from './components/ChatSidebar';
import Inbox from './Pages/Inbox';
import AddPost from './Feed/AddPost';
import AllPost from './Feed/AllPost';
import JoinGroup from './Pages/JoinGroup';
import AdminLogin from './Pages/AdminLogin';
import AdminDashboard from './Pages/AdminDashboard';
import AdminUsers from './Pages/AdminUsers';
import AdminPosts from './Pages/AdminPosts';
import AdminAnalytics from './Pages/AdminAnalytics';
import ExploreGroups from './Pages/ExploreGroups';


function App() {
  return (
    <>
      {/* <Router> */}
      <Routes>
        {/* <Route path="/" element={<Navigate to="/register" replace />} /> Redirect base path */}
        <Route path="register" element={<RegisterUser />} />
        <Route path="login" element={<LoginUser />} />
        <Route path="verify-email" element={<VerifyEmail />} />
        <Route path='/resend-verification-email' element={<ResendVerificationEmail />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="/creategroup" element={<CreateGroup />} />
        <Route path="/chats" element={<ChatSidebar />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/add-post" element={<AddPost />} />
        <Route path="/feed" element={<AllPost />} />
        <Route path="/join/:inviteCode" element={<JoinGroup />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-users" element={<AdminUsers />} />
        <Route path="/admin-posts" element={<AdminPosts />} />
        <Route path="/admin-analytics" element={<AdminAnalytics />} />
        <Route path="/explore-groups" element={<ExploreGroups />} />

      </Routes>
      {/* </Router> */}
    </>
  );
}

export default App;

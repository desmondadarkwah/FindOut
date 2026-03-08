import React from 'react';
import {  Routes, Route } from 'react-router-dom';
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
        </Routes>
      {/* </Router> */}
    </>
  );
}

export default App;

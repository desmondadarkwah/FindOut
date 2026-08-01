import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getAccessToken } from './utils/tokenService';
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
import SinglePost from './Feed/SinglePost';
import JoinGroup from './Pages/JoinGroup';
import AdminLogin from './Pages/AdminLogin';
import AdminDashboard from './Pages/AdminDashboard';
import AdminUsers from './Pages/AdminUsers';
import AdminPosts from './Pages/AdminPosts';
import AdminAnalytics from './Pages/AdminAnalytics';
import ExploreGroups from './Pages/ExploreGroups';
import VerificationDashboard from './Pages/VerificationDashboard';
import TakeQuiz from './Pages/TakeQuiz';


function App() {
  return (
    <>
      {/* <Router> */}
      <Routes>
        {/* Root. Send signed-in users to their dashboard and everyone else to
            login, rather than rendering nothing. `replace` keeps the empty root
            out of history, so Back does not land the user here again. */}
        <Route
          path="/"
          element={
            <Navigate to={getAccessToken() ? '/dashboard' : '/login'} replace />
          }
        />
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
        {/* Destination of a shared post link. Must exist, or "Copy link"
            produces a URL that lands on the 404 below. */}
        <Route path="/post/:postId" element={<SinglePost />} />
        <Route path="/join/:inviteCode" element={<JoinGroup />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-users" element={<AdminUsers />} />
        <Route path="/admin-posts" element={<AdminPosts />} />
        <Route path="/admin-analytics" element={<AdminAnalytics />} />
        <Route path="/explore-groups" element={<ExploreGroups />} />

        <Route path="/verification" element={<VerificationDashboard />} />
        <Route path="/take-quiz/:subject" element={<TakeQuiz />} />

        {/* Catch-all. Without this, any unknown URL renders a blank page and
            logs "No routes matched location" with no feedback to the user. */}
        <Route
          path="*"
          element={
            <div className="flex min-h-screen flex-col items-center justify-center bg-surface-base px-6 text-center">
              <p className="text-sm font-medium uppercase tracking-wide text-content-muted">
                404
              </p>
              <h1 className="mt-2 text-xl font-semibold text-content-primary">
                Page not found
              </h1>
              <p className="mt-1 text-sm text-content-muted">
                That link does not lead anywhere.
              </p>
              <a
                href={getAccessToken() ? '/dashboard' : '/login'}
                className="mt-6 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 px-4 py-2.5 text-sm font-semibold text-white shadow-elev-2 transition-opacity hover:opacity-90"
              >
                {getAccessToken() ? 'Back to dashboard' : 'Go to login'}
              </a>
            </div>
          }
        />
      </Routes>
      {/* </Router> */}
    </>
  );
}

export default App;



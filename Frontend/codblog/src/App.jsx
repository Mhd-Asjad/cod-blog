import React from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PublicRoute from "./routes/PublicRoute";
import PrivateRoute from "./routes/PrivateRoute";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AddPost from "./pages/AddPost";
import ShowPost from "./pages/ShowPost";
import ShowUserDetail from "./pages/ShowUserDetail";
import AuthProvider from "./components/AuthProvider";
import { ToastContainer } from "react-toastify";
import UserProfile from "./pages/UserProfile";
import EditPost from "./pages/EditPost";
import ShowNotifications from "./pages/ShowNotifications";
import WebSocketManager from "./components/socketprovider/WebSocketManager";
import SavedPost from "./pages/SavedPost";
import Chatbot from "./components/Chatbot.jsx";
const App = () => {
  return (
    <>
      <div className="h-screen relative overflow-hidden">
      
      <style jsx="true" global="true">{`
          /* Custom Scrollbar Styles */
          ::-webkit-scrollbar {
            width: 8px;
          }

          ::-webkit-scrollbar-track {
            background: transparent;
          }

          /* Light Mode Scrollbar */
          ::-webkit-scrollbar-thumb {
            background: #a855f7; /* purple-500 */
            border-radius: 4px;
            transition: background 0.3s ease;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: #9333ea; /* purple-600 */
          }

          /* Firefox Support - Light Mode */
          * {
            scrollbar-width: thin;
            scrollbar-color: #a855f7 transparent;
          }

          /* Dark Mode Scrollbar */
          .dark ::-webkit-scrollbar-thumb {
            background: #8b5cf6; /* purple-500 with slight adjustment for dark */
            border-radius: 4px;
            transition: background 0.3s ease;
          }

          .dark ::-webkit-scrollbar-thumb:hover {
            background: #a855f7; /* purple-500 */
          }

          /* Firefox Support - Dark Mode */
          .dark * {
            scrollbar-color: #8b5cf6 transparent;
          }

          /* Custom scrollbar for specific elements if needed */
          .custom-purple-scroll::-webkit-scrollbar {
            width: 8px;
          }

          .custom-purple-scroll::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
          }

          .custom-purple-scroll::-webkit-scrollbar-thumb {
            background: #a855f7;
            border-radius: 4px;
            transition: background 0.3s ease;
          }

          .custom-purple-scroll::-webkit-scrollbar-thumb:hover {
            background: #9333ea;
          }

          /* Dark mode for custom scroll elements */
          .dark .custom-purple-scroll::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.1);
          }

          .dark .custom-purple-scroll::-webkit-scrollbar-thumb {
            background: #8b5cf6;
          }

          .dark .custom-purple-scroll::-webkit-scrollbar-thumb:hover {
            background: #a855f7;
          }
        `}</style>
        <Router>
          <AuthProvider>
            <WebSocketManager />
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route path="/" element={<Home />} />
              <Route
                path="/write-posts"
                element={
                  <PrivateRoute>
                    <AddPost />
                  </PrivateRoute>
                }
              />
              <Route
                path="/saved-posts"
                element={
                  <PrivateRoute>
                    <SavedPost />
                  </PrivateRoute>
                }
              />
              <Route path="/post/:id" element={<ShowPost />} />
              <Route path="/bot" element={<Chatbot />} />
              <Route
                path="/user/:id"
                element={
                  <PrivateRoute>
                    <ShowUserDetail />
                  </PrivateRoute>
                }
              />
              <Route
                path="/view-profile/:id"
                element={
                  <PrivateRoute>
                    <UserProfile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/edit-post/:id"
                element={
                  <PrivateRoute>
                    <EditPost />
                  </PrivateRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <PrivateRoute>
                    <ShowNotifications />
                  </PrivateRoute>
                }
              />
            </Routes>
            <ToastContainer position="top-center" />
          </AuthProvider>
        </Router>
      </div>
    </>
  );
};

export default App;

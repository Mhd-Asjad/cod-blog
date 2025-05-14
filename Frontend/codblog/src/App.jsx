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

const App = () => {
  return (
    <div className=" h-screen relative overflow-hidden">
      <Router>
        <AuthProvider>
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
            <Route path="/post/:id" element={<ShowPost />} />
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
                  <EditPost/>
                </PrivateRoute>
              }
            />
            
          </Routes>
          <ToastContainer position="top-center" />

        </AuthProvider>
      </Router>
    </div>
  );
};

export default App;

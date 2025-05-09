import React from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PublicRoute from "./routes/PublicRoute";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";


const App = () => {
  return (
    <div className=" h-screen relative overflow-hidden">
      <Router>
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
        </Routes>
      </Router>
    </div>
  );
};

export default App;

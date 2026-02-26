import React from "react";
import{Routes, Route, Navigate} from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login"
function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signup" />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;

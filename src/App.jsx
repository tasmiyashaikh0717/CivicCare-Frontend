
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SubmitComplaint from "./pages/SubmitComplaint";
import MyComplaints from "./pages/MyComplaints";
import AdminDashboard from "./pages/AdminDashboard";
import AllComplaints from "./pages/AllComplaints";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect the home page to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/submit-complaint"
          element={<SubmitComplaint />}
        />
        <Route path="/my-complaints" element={<MyComplaints />} />

        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/all-complaints" element={<AllComplaints />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

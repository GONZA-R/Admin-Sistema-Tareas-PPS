import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import TasksManagement from "./pages/TasksManagement";
import UsersManagement from "./pages/UsersManagement";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<TasksManagement />} />
          <Route path="/users" element={<UsersManagement />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

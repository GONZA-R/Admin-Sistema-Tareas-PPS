import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TasksManagement from "./pages/TasksManagement";
import UsersManagement from "./pages/UsersManagement";
import EmployeeTasks from "./pages/EmployeeTasks";
import Navbar from "./components/Navbar";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    const savedRole = localStorage.getItem("role");
    setIsAuthenticated(!!token);
    setRole(savedRole);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {isAuthenticated && <Navbar setIsAuthenticated={setIsAuthenticated} />}

      <Routes>
        {/* Login */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" />
            ) : (
              <Login setIsAuthenticated={setIsAuthenticated} setRole={setRole} />
            )
          }
        />

        {/* Página inicial según rol */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              role === "empleado" ? <Navigate to="/employee" /> : <Dashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* TasksManagement (solo admin y jefe) */}
        <Route
          path="/tasks"
          element={
            isAuthenticated && (role === "admin" || role === "jefe") ? (
              <TasksManagement />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* UsersManagement (solo admin) */}
        <Route
          path="/users"
          element={
            isAuthenticated && (role === "admin" || role === "jefe") ? (
              <UsersManagement />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* EmployeeTasks (solo empleado) */}
        <Route
          path="/employee"
          element={
            isAuthenticated && role === "empleado" ? (
              <EmployeeTasks />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, LogOut, Search, UserCircle } from "lucide-react";

// Modales
import UserProfileModal from "./UserProfileModal";
import UserSettingsModal from "./UserSettingsModal";

export default function Navbar() {
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // "profile" | "settings" | null

  const notifications = [
    { id: 1, msg: "Nueva tarea asignada a Juan", time: "Hace 2 min" },
    { id: 2, msg: "Se completó la tarea #12", time: "Hace 10 min" },
    { id: 3, msg: "Nuevo comentario en tarea #9", time: "Hace 30 min" },
  ];

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 p-3 px-6 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-semibold tracking-tight">
            Admin<span className="text-indigo-600">Dash</span>
          </Link>

          <div className="hidden md:flex gap-6 text-sm">
            <Link className="nav-item" to="/">Dashboard</Link>
            <Link className="nav-item" to="/tasks">Tareas</Link>
            <Link className="nav-item" to="/users">Usuarios</Link>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          {/* SEARCH */}
          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="border border-gray-300 rounded-lg pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />
          </div>

          {/* NOTIFICATIONS */}
          <button
            title="Notificaciones"
            className="relative p-2 hover:bg-gray-100 rounded-full transition"
            onClick={() => setShowNotifications(true)}
          >
            <Bell className="w-6 h-6 text-gray-700" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1.5">
              {notifications.length}
            </span>
          </button>

          {/* USER MENU */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 hover:bg-gray-100 rounded-full transition"
            >
              <UserCircle className="w-8 h-8 text-gray-700" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 shadow-lg rounded-xl py-2 animate-fadeIn">

                <button
                  className="dropdown-item"
                  onClick={() => {
                    setModalType("profile");
                    setMenuOpen(false);
                  }}
                >
                  Mi perfil
                </button>

                <button
                  className="dropdown-item"
                  onClick={() => {
                    setModalType("settings");
                    setMenuOpen(false);
                  }}
                >
                  Ajustes
                </button>

                <button
                  className="dropdown-item text-red-500 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>

              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MODAL NOTIFICACIONES */}
      {showNotifications && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowNotifications(false)}
        >
          <div
            className="bg-white p-5 rounded-xl shadow-xl w-96 max-h-[70vh] overflow-y-auto animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-3">Notificaciones</h2>

            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay notificaciones</p>
            ) : (
              <ul className="space-y-3">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className="border rounded-lg p-3 hover:bg-gray-50 transition cursor-pointer"
                  >
                    <p className="text-sm">{n.msg}</p>
                    <span className="text-xs text-gray-500">{n.time}</span>
                  </li>
                ))}
              </ul>
            )}

            <button
              className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
              onClick={() => setShowNotifications(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODALES DE PERFIL Y AJUSTES */}
      <UserProfileModal
        open={modalType === "profile"}
        onClose={() => setModalType(null)}
      />

      <UserSettingsModal
        open={modalType === "settings"}
        onClose={() => setModalType(null)}
      />

      {/* EXTRA CSS */}
      <style>
        {`
          .nav-item {
            color: #555;
            transition: 0.2s;
          }
          .nav-item:hover {
            color: #4F46E5;
          }

          .dropdown-item {
            display: block;
            width: 100%;
            text-align: left;
            padding: 8px 14px;
            font-size: 0.875rem;
            color: #444;
            transition: 0.2s;
            border-radius: 0.375rem;
          }
          .dropdown-item:hover {
            background: #f3f4f6;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
          }
        `}
      </style>
    </>
  );
}

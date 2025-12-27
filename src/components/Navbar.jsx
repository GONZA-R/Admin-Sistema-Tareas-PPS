import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Search, UserCircle } from "lucide-react";
import axios from "axios";

import UserProfileModal from "./UserProfileModal";
import UserSettingsModal from "./UserSettingsModal";

export default function Navbar({ setIsAuthenticated }) {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [modalType, setModalType] = useState(null);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsAuthenticated(false);
    navigate("/login");
  };

  // Traer notificaciones
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("access");
      if (!token) return;

      setLoadingNotifications(true);

      const res = await axios.get(
        "http://127.0.0.1:8000/api/notifications/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Notificaciones API:", res.data); // <--- depuración

      const sorted = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setNotifications(sorted);
    } catch (err) {
      console.error("Error al traer notificaciones", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("access");
      if (!token) return;

      await axios.post(
        `http://127.0.0.1:8000/api/notifications/${id}/mark_read/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error("Error al marcar notificación", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return;
    fetchNotifications();
  }, []);

  // Cerrar dropdowns al click afuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="bg-gradient-to-r from-yellow-200 via-yellow-100 to-orange-200 backdrop-blur-md shadow-md p-3 px-6 flex items-center justify-between relative z-30 rounded-b-xl">

        {/* LEFT */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-semibold tracking-tight text-orange-700">
            Admin<span className="text-yellow-600">Dash</span>
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
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar..."
              className="border border-gray-300 rounded-lg pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white/90"
            />
          </div>

          {/* NOTIFICACIONES */}
          <div className="relative" ref={notifRef}>
            <button
              className="relative p-2 hover:bg-yellow-300/40 rounded-full transition"
              onClick={() => {
                setNotificationsOpen((v) => !v);
                fetchNotifications();
              }}
            >
              <Bell className="w-6 h-6 text-orange-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1.5">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-yellow-50 border border-orange-200 shadow-xl rounded-xl z-50">
                <div className="p-3 border-b font-semibold text-sm text-orange-700">
                  Notificaciones
                </div>

                <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-yellow-50">
                  {loadingNotifications ? (
                    <p className="p-4 text-sm text-orange-500">Cargando...</p>
                  ) : notifications.length === 0 ? (
                    <p className="p-4 text-sm text-orange-500">No hay notificaciones</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`px-4 py-3 text-sm cursor-pointer border-b last:border-b-0 rounded-lg transition
                          ${n.is_read ? "bg-yellow-50 hover:bg-yellow-100" : "bg-orange-100 hover:bg-orange-200"}
                        `}
                      >
                        <p className="text-orange-700 font-medium">
                          {n.type === "assignment"
                            ? `${n.action?.assigned_by?.username || "Alguien"} asignó la tarea '${n.task?.title || "–"}' a ${n.action?.assigned_to?.username || "–"}`
                            : n.type === "delegation"
                            ? `${n.action?.delegated_by?.username || "Alguien"} delegó la tarea '${n.task?.title || "–"}' a ${n.action?.delegated_to?.username || "–"}`
                            : n.type === "status_change"
                            ? `La tarea '${n.task?.title || "–"}' cambió de estado de '${n.action?.old_status || "–"}' a '${n.action?.new_status || "–"}'`
                            : n.message || "Notificación sin mensaje"
                          }
                        </p>
                        <span className="text-xs text-orange-500">
                          {n.created_at ? new Date(n.created_at).toLocaleString("es-AR") : "-"}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="w-full text-sm py-2 hover:bg-yellow-100 rounded-b-xl border-t border-orange-200"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>

          {/* USER MENU */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1 hover:bg-yellow-300/40 rounded-full transition"
            >
              <UserCircle className="w-8 h-8 text-orange-700" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-yellow-50 border border-orange-200 shadow-lg rounded-xl py-2 z-50">
                <button
                  className="dropdown-item"
                  onClick={() => { setModalType("profile"); setMenuOpen(false); }}
                >
                  Mi perfil
                </button>

                <button
                  className="dropdown-item"
                  onClick={() => { setModalType("settings"); setMenuOpen(false); }}
                >
                  Ajustes
                </button>

                <button
                  className="dropdown-item text-red-500 hover:bg-red-100"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

        </div>
      </nav>

      {/* MODALES */}
      <UserProfileModal
        open={modalType === "profile"}
        onClose={() => setModalType(null)}
      />
      <UserSettingsModal
        open={modalType === "settings"}
        onClose={() => setModalType(null)}
      />

      <style>{`
        .nav-item {
          color: #555;
          transition: 0.2s;
        }
        .nav-item:hover {
          color: #D97706;
        }
        .dropdown-item {
          width: 100%;
          text-align: left;
          padding: 8px 14px;
          font-size: 0.875rem;
          color: #444;
          transition: 0.2s;
          border-radius: 0.375rem;
        }
        .dropdown-item:hover {
          background: #fef3c7;
        }
        /* Scrollbar moderno */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #fef3c7;
          border-radius: 999px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #fbbf24;
          border-radius: 999px;
        }
      `}</style>
    </>
  );
}

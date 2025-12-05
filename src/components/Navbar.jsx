import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  // Simulamos notificaciones por ahora
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
      <nav className="bg-white shadow p-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold">Admin Dashboard</Link>
          <Link to="/tasks" className="text-sm text-gray-600 hover:text-gray-900">Tareas</Link>
          <Link to="/users" className="text-sm text-gray-600 hover:text-gray-900">Usuarios</Link>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Buscar..."
            className="border rounded px-3 py-1 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") console.log("Buscar:", e.target.value);
            }}
          />

          {/* BOTÓN CAMPANA */}
          <button
            title="Notificaciones"
            className="relative"
            onClick={() => setShowModal(true)}
          >
            <span className="inline-block text-2xl">🔔</span>
            <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1">
              {notifications.length}
            </span>
          </button>

          <button className="text-sm px-3 py-1 border rounded" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* MODAL DE NOTIFICACIONES */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}   // Cierra al tocar afuera
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // Evita cerrar al hacer click dentro
          >
            <h2 className="text-lg font-bold mb-3">Notificaciones</h2>

            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay notificaciones</p>
            ) : (
              <ul className="space-y-3">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className="border p-3 rounded hover:bg-gray-100 cursor-pointer"
                  >
                    <p className="text-sm">{n.msg}</p>
                    <span className="text-xs text-gray-500">{n.time}</span>
                  </li>
                ))}
              </ul>
            )}

            <button
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded"
              onClick={() => setShowModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

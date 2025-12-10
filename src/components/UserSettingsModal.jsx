import React, { useState } from "react";

export default function UserSettingsModal({ open, onClose }) {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [theme, setTheme] = useState("Sistema");
  const [viewMode, setViewMode] = useState("lista");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-5 w-96 rounded-xl shadow-xl animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4">Ajustes</h2>

        <div className="space-y-4">

          {/* SWITCH NOTIFICACIONES */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Notificaciones por correo</span>

            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`w-12 h-6 flex items-center rounded-full px-1 transition ${
                emailNotifications ? "bg-indigo-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition ${
                  emailNotifications ? "translate-x-6" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>

          {/* TEMA */}
          <div>
            <label className="text-sm font-medium">Tema</label>
            <select
              className="mt-1 w-full border px-3 py-2 rounded-lg text-sm"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option>Claro</option>
              <option>Oscuro</option>
              <option>Sistema</option>
            </select>
          </div>

          {/* VISTA */}
          <div>
            <label className="text-sm font-medium">Preferencia de vista</label>
            <select
              className="mt-1 w-full border px-3 py-2 rounded-lg text-sm"
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
            >
              <option value="lista">Lista</option>
              <option value="tarjetas">Tarjetas</option>
            </select>
          </div>

        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );
}

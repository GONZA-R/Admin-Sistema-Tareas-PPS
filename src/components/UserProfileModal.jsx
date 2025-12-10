import React from "react";

export default function UserProfileModal({ open, onClose }) {
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
        <h2 className="text-lg font-bold mb-3">Mi Perfil</h2>

        <div className="space-y-2 text-sm">
          <p><strong>Nombre:</strong> Juan Pérez</p>
          <p><strong>Email:</strong> usuario@example.com</p>
          <p><strong>Rol:</strong> Administrador</p>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

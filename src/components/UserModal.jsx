import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function UserModal({ open, onClose, onSave, userToEdit }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("empleado");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (userToEdit) {
      setUsername(userToEdit.username);
      setEmail(userToEdit.email);
      setRole(userToEdit.role || "empleado");
      setIsActive(userToEdit.is_active);
      setPassword("");
    } else {
      setUsername("");
      setEmail("");
      setPassword("");
      setRole("empleado");
      setIsActive(true);
    }
  }, [userToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username || !email) {
      alert("Completa todos los campos obligatorios");
      return;
    }

    if (!userToEdit && !password) {
      alert("La contraseña es obligatoria al crear un usuario");
      return;
    }

    const payload = {
      username,
      email,
      role,
      is_active: isActive,
    };

    if (password) {
      payload.password = password;
    }

    onSave(payload);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-96 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold mb-4">
          {userToEdit ? "Editar Usuario" : "Nuevo Usuario"}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="password"
            placeholder={
              userToEdit
                ? "Nueva contraseña (opcional)"
                : "Contraseña"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="admin">Administrador</option>
            <option value="empleado">Empleado</option>
          </select>

          <select
            value={isActive ? "true" : "false"}
            onChange={(e) => setIsActive(e.target.value === "true")}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
}

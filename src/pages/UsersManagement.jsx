import React, { useState } from "react";
import UserModal from "../components/UserModal";
import ConfirmModal from "../components/ConfirmModal";

export default function UserManagement() {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Gonzalo Tolay",
      email: "gonzalo@example.com",
      role: "Administrador",
      status: "Activo",
    },
    {
      id: 2,
      name: "Matías López",
      email: "matias@example.com",
      role: "Empleado",
      status: "Inactivo",
    },
    {
      id: 3,
      name: "Laura Pérez",
      email: "laura@example.com",
      role: "Empleado",
      status: "Activo",
    },
    {
      id: 1,
      name: "Gonzalo Tolay",
      email: "gonzalo@example.com",
      role: "Administrador",
      status: "Activo",
    },
    {
      id: 2,
      name: "Matías López",
      email: "matias@example.com",
      role: "Empleado",
      status: "Inactivo",
    },
    {
      id: 3,
      name: "Laura Pérez",
      email: "laura@example.com",
      role: "Empleado",
      status: "Activo",
    },
    {
      id: 1,
      name: "Gonzalo Tolay",
      email: "gonzalo@example.com",
      role: "Administrador",
      status: "Activo",
    },
    {
      id: 2,
      name: "Matías López",
      email: "matias@example.com",
      role: "Empleado",
      status: "Inactivo",
    },
    {
      id: 3,
      name: "Laura Pérez",
      email: "laura@example.com",
      role: "Empleado",
      status: "Activo",
    },
    {
      id: 1,
      name: "Gonzalo Tolay",
      email: "gonzalo@example.com",
      role: "Administrador",
      status: "Activo",
    },
    {
      id: 2,
      name: "Matías López",
      email: "matias@example.com",
      role: "Empleado",
      status: "Inactivo",
    },
    {
      id: 3,
      name: "Laura Pérez",
      email: "laura@example.com",
      role: "Empleado",
      status: "Activo",
    },
    {
      id: 1,
      name: "Gonzalo Tolay",
      email: "gonzalo@example.com",
      role: "Administrador",
      status: "Activo",
    },
    {
      id: 2,
      name: "Matías López",
      email: "matias@example.com",
      role: "Empleado",
      status: "Inactivo",
    },
    {
      id: 3,
      name: "Laura Pérez",
      email: "laura@example.com",
      role: "Empleado",
      status: "Activo",
    },
    
  ]);

  const [openModal, setOpenModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  // Confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Crear o editar usuario
  const addUser = (user) => {
    if (userToEdit) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userToEdit.id ? { ...u, ...user } : u))
      );
      setUserToEdit(null);
    } else {
      setUsers([...users, { ...user, id: Date.now() }]);
    }
  };

  // Eliminar usuario
  const deleteUser = (id) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <div>
      {/* CABECERA STICKY IGUAL A TASKS */}
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-gray-100 z-10 p-4">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <button
          onClick={() => setOpenModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Nuevo Usuario
        </button>
      </div>

      {/* LISTA DE USUARIOS */}
      <div className="space-y-3 pb-8">
        {users.length === 0 && (
          <p className="text-center text-gray-500">No hay usuarios cargados.</p>
        )}

        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white shadow-md rounded-xl p-3 hover:shadow-lg transition grid grid-cols-[2fr_1fr_1fr_1fr_0.5fr] items-center gap-2"
          >
            {/* Nombre + email */}
            <div className="min-w-0">
              <h2 className="text-md font-semibold truncate">{user.name}</h2>
              <p className="text-gray-500 text-sm truncate">{user.email}</p>
            </div>

            {/* Rol */}
            <div>
              <span className="text-gray-700 text-sm">{user.role}</span>
            </div>

            {/* Estado */}
            <div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.status === "Activo"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {user.status}
              </span>
            </div>

            {/* Botones */}
            <div className="flex gap-1 justify-end">
              <button
                onClick={() => {
                  setUserToEdit(user);
                  setOpenModal(true);
                }}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
              >
                Editar
              </button>

              <button
                onClick={() => {
                  setUserToDelete(user.id);
                  setConfirmOpen(true);
                }}
                className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE CREAR/EDITAR */}
      <UserModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setUserToEdit(null);
        }}
        onCreate={addUser}
        userToEdit={userToEdit}
      />

      {/* MODAL DE CONFIRMACIÓN */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => userToDelete && deleteUser(userToDelete)}
        message="¿Seguro que deseas eliminar este usuario?"
      />
    </div>
  );
}

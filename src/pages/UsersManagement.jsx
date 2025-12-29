import React, { useState, useEffect } from "react";
import UserModal from "../components/UserModal"; // Solo para edición
import NewUserModal from "../components/NewUserModal"; // Solo para creación
import ConfirmModal from "../components/ConfirmModal";
import api from "../services/api";

export default function UserManagement() {
  const [users, setUsers] = useState([]);

  // Modal edición
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  // Modal creación
  const [newModalOpen, setNewModalOpen] = useState(false);

  // Confirmación eliminación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Filtros
  const [filters, setFilters] = useState({
    role: "",
    status: "",
  });

  // Traer usuarios
  const fetchUsers = () => {
    api
      .get("/users/")
      .then((res) => {
        const mapped = res.data.map((u) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          role: u.role_display,
          is_active: u.is_active,
        }));
        setUsers(mapped);
      })
      .catch((err) => console.error("Error al traer usuarios:", err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Crear o editar usuario
  const handleSaveUser = async (userData, isNew = false) => {
    try {
      if (isNew) {
        await api.post("/users/", userData);
      } else if (userToEdit) {
        await api.put(`/users/${userToEdit.id}/`, userData);
      }

      fetchUsers();
      setEditModalOpen(false);
      setUserToEdit(null);
      setNewModalOpen(false);
    } catch (err) {
      console.error("Error completo:", err);
      if (err.response) {
        alert(JSON.stringify(err.response.data, null, 2));
      } else {
        alert("Error de conexión con el servidor");
      }
    }
  };

  // Eliminar usuario
  const handleDeleteUser = () => {
    api
      .delete(`/users/${userToDelete}/`)
      .then(() => fetchUsers())
      .catch((err) => console.error("Error al eliminar usuario:", err));

    setConfirmOpen(false);
    setUserToDelete(null);
  };

  // Usuarios filtrados
  const filteredUsers = users.filter((user) => {
    if (filters.role && user.role !== filters.role) return false;
    if (filters.status) {
      const isActive = user.is_active;
      if (filters.status === "activo" && !isActive) return false;
      if (filters.status === "inactivo" && isActive) return false;
    }
    return true;
  });

  return (
    <div className="bg-orange-50 min-h-screen p-4">

      {/* CABECERA + FILTROS */}
      <div className="sticky top-0 z-20">
        <div className="flex flex-wrap items-center justify-between p-4 gap-3 bg-orange-100 rounded-b-2xl shadow-sm backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-gray-800 flex-1">Gestión de Usuarios</h1>

          <div className="flex gap-2 flex-wrap items-center">
            {/* Filtro rol */}
            <select
              className="border border-gray-300 rounded-2xl px-3 py-1 text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-400 transition"
              value={filters.role}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, role: e.target.value }))
              }
            >
              <option value="">Todos roles</option>
              {[...new Set(users.map(u => u.role))].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {/* Filtro estado */}
            <select
              className="border border-gray-300 rounded-2xl px-3 py-1 text-sm bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-orange-400 transition"
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="">Todos estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>

            {/* Botón Nuevo Usuario */}
            <button
              onClick={() => setNewModalOpen(true)}
              className="bg-orange-400 text-white px-4 py-2 rounded-lg hover:bg-orange-500 transition shadow-sm"
            >
              Nuevo Usuario
            </button>
          </div>
        </div>

        {/* CABECERA TABLA */}
        <div
          className="grid grid-cols-[1.5fr_2fr_1fr_1fr_1fr]
                     bg-orange-100 text-gray-700 text-sm font-semibold
                     px-3 py-2 border-t border-orange-300"
        >
          <div>Usuario</div>
          <div>Email</div>
          <div>Rol</div>
          <div>Estado</div>
          <div className="flex items-center justify-end">Acciones</div>
        </div>
      </div>

      {/* LISTADO USUARIOS */}
      <div className="space-y-3 mt-2">
        {filteredUsers.length === 0 && (
          <p className="text-center text-gray-500">No hay usuarios cargados.</p>
        )}

        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white shadow-md rounded-xl px-3 py-2
                       grid grid-cols-[1.5fr_2fr_1fr_1fr_1fr]
                       items-center hover:shadow-xl transition cursor-pointer"
          >
            <div className="truncate font-medium">{user.username}</div>
            <div className="truncate text-gray-600 text-sm">{user.email || "-"}</div>
            <div className="capitalize">{user.role}</div>
            <div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {user.is_active ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setUserToEdit(user);
                  setEditModalOpen(true);
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

      {/* MODAL EDICIÓN */}
      <UserModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setUserToEdit(null);
        }}
        onSave={handleSaveUser}
        userToEdit={userToEdit}
      />

      {/* MODAL CREACIÓN */}
      <NewUserModal
        open={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        onSave={(data) => handleSaveUser(data, true)} // `true` = crear
      />

      {/* MODAL CONFIRMACIÓN */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteUser}
        message="¿Seguro que deseas eliminar este usuario?"
      />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import UserModal from "../components/UserModal";
import ConfirmModal from "../components/ConfirmModal";
import api from "../services/api";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  /* =========================
     TRAER USUARIOS
     ========================= */
  const fetchUsers = () => {
    api
      .get("/users/")
      .then((res) => {
        const mapped = res.data.map((u) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          role: u.role_display,          // ✅ CORREGIDO
          is_active: u.is_active,
        }));
        setUsers(mapped);
      })
      .catch((err) => console.error("Error al traer usuarios:", err));
  };

  /* =========================
     CREAR / EDITAR USUARIO
     ========================= */
  const handleSaveUser = async (userData) => {
    try {
      if (userToEdit) {
        await api.put(`/users/${userToEdit.id}/`, userData);
      } else {
        await api.post("/users/", userData);
      }

      fetchUsers();
      setOpenModal(false);
      setUserToEdit(null);
    } catch (err) {
      console.error("Error completo:", err);

      if (err.response) {
        alert(JSON.stringify(err.response.data, null, 2));
      } else {
        alert("Error de conexión con el servidor");
      }
    }
  };

  /* =========================
     ELIMINAR USUARIO
     ========================= */
  const handleDeleteUser = () => {
    api
      .delete(`/users/${userToDelete}/`)
      .then(() => fetchUsers())
      .catch((err) => console.error("Error al eliminar usuario:", err));

    setConfirmOpen(false);
    setUserToDelete(null);
  };

  return (
    <div>

      {/* CABECERA PRINCIPAL */}
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-gray-100 z-20 p-4 rounded-xl shadow">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>

        <button
          onClick={() => {
            setUserToEdit(null);     // ✅ LIMPIA EL FORM
            setOpenModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Nuevo Usuario
        </button>
      </div>

      {/* CABECERA TABLA */}
      <div
        className="grid grid-cols-[1.5fr_2fr_1fr_1fr_1fr]
                   bg-gray-200 text-gray-700 text-sm font-semibold
                   px-3 py-2 rounded-lg sticky top-[88px] z-10"
      >
        <div>Usuario</div>
        <div>Email</div>
        <div>Rol</div>
        <div>Estado</div>
        <div className="text-right">Acciones</div>
      </div>

      {/* LISTADO */}
      <div className="space-y-3 pb-8 mt-2">
        {users.length === 0 && (
          <p className="text-center text-gray-500">
            No hay usuarios cargados.
          </p>
        )}

        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white shadow-sm rounded-lg px-3 py-2
                       grid grid-cols-[1.5fr_2fr_1fr_1fr_1fr]
                       items-center hover:shadow-md transition"
          >
            <div className="truncate font-medium">{user.username}</div>

            <div className="truncate text-gray-600 text-sm">
              {user.email || "-"}
            </div>

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

            <div className="flex gap-1 justify-end">
              <button
                onClick={() => {
                  setUserToEdit(user);
                  setOpenModal(true);
                }}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                Editar
              </button>

              <button
                onClick={() => {
                  setUserToDelete(user.id);
                  setConfirmOpen(true);
                }}
                className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CREAR / EDITAR */}
      <UserModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setUserToEdit(null);
        }}
        onSave={handleSaveUser}
        userToEdit={userToEdit}
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

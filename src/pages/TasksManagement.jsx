// src/pages/TasksManagement.jsx
import React, { useState, useEffect } from "react";
import api from "../services/api";
import NewTaskModal from "../components/NewTaskModal";
import ConfirmModal from "../components/ConfirmModal";

export default function TasksManagement() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  /* =========================
     TRAER TAREAS
     ========================= */
  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks/");
      setTasks(res.data);
    } catch (err) {
      console.error("Error al traer tareas:", err);
    }
  };

  /* =========================
     TRAER USUARIOS
     ========================= */
  const fetchUsers = async () => {
    try {
      const res = await api.get("/users/");
      setUsers(res.data);
    } catch (err) {
      console.error("Error al traer usuarios:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  /* =========================
     CREAR TAREA (ÚNICO POST)
     ========================= */
  const addTask = async (taskData) => {
    try {
      const token = localStorage.getItem("access");

      const res = await api.post("/tasks/", taskData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Error al crear tarea:", err.response?.data || err);
      alert(JSON.stringify(err.response?.data, null, 2));
    }
  };

  /* =========================
     ELIMINAR TAREA
     ========================= */
  const deleteTask = async () => {
    try {
      await api.delete(`/tasks/${taskToDelete}/`);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete));
    } catch (err) {
      console.error("Error al eliminar tarea:", err);
    }

    setConfirmOpen(false);
    setTaskToDelete(null);
  };

  const priorityColor = (priority) => {
    switch (priority) {
      case "alta":
        return "bg-red-100 text-red-700";
      case "media":
        return "bg-yellow-100 text-yellow-700";
      case "baja":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div>
      {/* CABECERA */}
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-gray-100 z-10 p-4 rounded-xl shadow">
        <h1 className="text-2xl font-bold">Gestión de Tareas</h1>
        <button
          onClick={() => setOpenModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Nueva Tarea
        </button>
      </div>

      {/* LISTADO */}
      <div className="space-y-3 pb-8">
        {tasks.length === 0 && (
          <p className="text-center text-gray-500">No hay tareas cargadas.</p>
        )}

        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white shadow rounded-lg p-3 grid grid-cols-[2fr_1fr_1fr_1fr_1fr_0.7fr] items-center gap-2"
          >
            <div>
              <h2 className="font-semibold">{task.title}</h2>
              <p className="text-gray-500 text-sm">{task.description}</p>
            </div>

            <div>
              <span className={`px-2 py-1 rounded-full text-xs ${priorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>

            <div className="text-sm text-gray-500">
              {task.start_date}
            </div>

            <div className="text-sm capitalize">{task.status}</div>

            <div className="text-sm">
              {task.assigned_to ? task.assigned_to.username : "-"}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setTaskToDelete(task.id);
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

      {/* MODAL NUEVA TAREA */}
      <NewTaskModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreate={addTask}
        users={users}
      />

      {/* CONFIRM */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={deleteTask}
        message="¿Seguro que deseas eliminar esta tarea?"
      />
    </div>
  );
}

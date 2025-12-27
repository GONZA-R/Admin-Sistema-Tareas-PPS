import React, { useState, useEffect } from "react";
import { FiEdit, FiTrash2, FiClock, FiCalendar, FiUser } from "react-icons/fi";
import api from "../services/api";
import NewTaskModal from "../components/NewTaskModal";
import ConfirmModal from "../components/ConfirmModal";
import TaskDetailModal from "../components/TaskDetailModal";

export default function TasksManagement() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // ----------------------------
  // TOAST GLOBAL
  // ----------------------------
  const [toast, setToast] = useState("");
  const showToast = (message, duration = 2500) => {
    setToast(message);
    setTimeout(() => setToast(""), duration);
  };

  // =========================
  // TRAER TAREAS
  // =========================
  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks/");
      setTasks(res.data);
    } catch (err) {
      console.error("Error al traer tareas:", err);
    }
  };

  // =========================
  // TRAER USUARIOS
  // =========================
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

  // =========================
  // CREAR TAREA
  // =========================
  const addTask = async (taskData) => {
    try {
      const token = localStorage.getItem("access");
      const res = await api.post("/tasks/", taskData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => [...prev, res.data]);
      showToast("Tarea creada correctamente");
    } catch (err) {
      console.error("Error al crear tarea:", err.response?.data || err);
      alert(JSON.stringify(err.response?.data, null, 2));
    }
  };

  // =========================
  // ELIMINAR TAREA
  // =========================
  const deleteTask = async () => {
    try {
      await api.delete(`/tasks/${taskToDelete}/`);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete));
      showToast("Tarea eliminada correctamente");
    } catch (err) {
      console.error("Error al eliminar tarea:", err);
    }
    setConfirmOpen(false);
    setTaskToDelete(null);
  };

  // =========================
  // PRIORIDAD
  // =========================
  const priorityColor = (priority, border = false) => {
  if (border) {
    switch (priority) {
      case "alta": return "border-red-500";
      case "media": return "border-yellow-500";
      case "baja": return "border-green-500";
      default: return "border-gray-300";
    }
  } else {
    switch (priority) {
      case "alta": return "bg-red-100 text-red-700";
      case "media": return "bg-yellow-100 text-yellow-700";
      case "baja": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  }
};


  // =========================
  // TRUNCAR DESCRIPCIÓN
  // =========================
  const truncateWords = (text, numWords) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length <= numWords) return text;
    return words.slice(0, numWords).join(" ") + "...";
  };

  return (
    <div className="bg-orange-50 min-h-screen p-4">
      {/* CONTENEDOR STICKY PRINCIPAL */}
<div className="sticky top-0 z-20 bg-orange-100 shadow-sm rounded-b-2xl backdrop-blur-sm">
  {/* CABECERA PRINCIPAL */}
  <div className="flex items-center justify-between p-4">
    <h1 className="text-2xl font-bold text-gray-800">Gestión de Tareas</h1>
    <button
      onClick={() => setOpenModal(true)}
      className="bg-orange-400 text-white px-4 py-2 rounded-lg hover:bg-orange-500 transition shadow-sm"
    >
      Nueva Tarea
    </button>
  </div>

  {/* CABECERA TABLA */}
  <div
    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_0.7fr]
               bg-orange-100 text-gray-700 text-sm font-semibold
               px-3 py-2 border-t border-orange-300"
  >
    <div>Título</div>
    <div>Prioridad</div>
    <div>Inicio</div>
    <div>Vencimiento</div>
    <div>Estado</div>
    <div>Asignado</div>
    <div className="text-left">Acciones</div>
  </div>
</div>




      {/* LISTADO */}
      <div className="space-y-2 pb-8 mt-2">
        {tasks.length === 0 && (
          <p className="text-center text-gray-500">No hay tareas cargadas.</p>
        )}

        {tasks.map((task) => (
          <div
          key={task.id}
          className={`bg-white shadow-md rounded-xl px-4 py-3
                    grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_0.7fr]
                    items-center hover:shadow-xl transition cursor-pointer
                    border-l-4 ${priorityColor(task.priority, true)}`}
          onClick={() => {
            setSelectedTask(task);
            setDetailOpen(true);
          }}
        >

            {/* TÍTULO + DESCRIPCIÓN */}
            <div className="flex flex-col">
              <h2 className="font-semibold text-gray-800 truncate">{task.title}</h2>
              <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                {truncateWords(task.description, 12)}
              </p>
            </div>

            {/* PRIORIDAD */}
<div className="flex items-center mt-1">
  <span
    className={`inline-block rounded-full text-xs font-semibold ${priorityColor(task.priority)}`}
    style={{ padding: "2px 6px" }} // padding ajustado para que no rompa la alineación
  >
    {task.priority}
  </span>
</div>

            {/* FECHA INICIO */}
            <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <FiClock className="w-4 h-4 text-gray-400" /> {task.start_date}
            </div>

            {/* FECHA VENCIMIENTO */}
            <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <FiCalendar className="w-4 h-4 text-gray-400" /> {task.due_date}
            </div>

            {/* ESTADO */}
            <div className="text-sm capitalize mt-1">{task.status}</div>

            {/* ASIGNADO */}
            <div className="text-sm mt-1 flex items-center gap-1">
              <FiUser className="w-4 h-4 text-gray-400" /> {task.assigned_to ? task.assigned_to.username : "-"}
            </div>

            {/* ACCIONES */}
            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTask(task);
                  setDetailOpen(true);
                }}
                className="px-3 py-1 bg-sky-500 text-white text-xs rounded hover:bg-sky-600 transition flex items-center gap-1"
              >
                <FiEdit /> Editar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTaskToDelete(task.id);
                  setConfirmOpen(true);
                }}
                className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition flex items-center gap-1"
              >
                <FiTrash2 /> Eliminar
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

      {/* MODAL DETALLE TAREA */}
      <TaskDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        task={selectedTask}
        onUpdate={(updatedTask) => {
          setTasks((prev) =>
            prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
          );
          setDetailOpen(false);
          showToast("Cambios guardados correctamente");
        }}
        showToast={showToast}
      />

      {/* CONFIRM */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={deleteTask}
        message="¿Seguro que deseas eliminar esta tarea?"
      />

      {/* TOAST GLOBAL */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center gap-2 bg-green-500/90 text-white px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm animate-toastFade">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span>{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}

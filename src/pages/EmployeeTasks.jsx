import React, { useState, useEffect } from "react";
import axios from "axios";
import TaskModal from "../components/TaskModal";

// Funciones auxiliares
const calculateDaysLeft = (dueDate) => {
  if (!dueDate) return "N/A";
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? `${diffDays} día(s)` : "Vencida";
};

const formatDate = (d) => {
  if (!d) return "Sin fecha";
  try {
    return new Date(d).toLocaleDateString("es-AR");
  } catch {
    return d;
  }
};

const TaskList = () => {
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Traer tareas desde backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("access");
        if (!token) throw new Error("No se encontró token, por favor logueate");

        const response = await axios.get("http://127.0.0.1:8000/api/tasks/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const tasksFromBackend = response.data.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          description: t.description,
          dueDate: t.due_date,
          startDate: t.start_date,
          createdBy: t.created_by?.username || "N/A",
          attachments: t.attachments || [],   // ⚡ aquí está el cambio
          comments: t.comments || [],
        }));

        setTasks(tasksFromBackend);
      } catch (error) {
        console.error("Error al traer tareas:", error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const openModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTask(null);
    setIsModalOpen(false);
  };

  const updateTask = (updatedTask) => {
    const newList = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    setTasks(newList);
    closeModal();
  };

  const filteredTasks = tasks.filter((task) => {
    return (
      (statusFilter === "" || task.status === statusFilter) &&
      (priorityFilter === "" || task.priority === priorityFilter)
    );
  });

  if (loading) return <p>Cargando tareas...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Mis Tareas</h2>

      {/* FILTROS */}
      <div className="flex gap-4 mb-6">
        <select
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_progreso">En Progreso</option>
          <option value="completada">Completada</option>
        </select>

        <select
          className="bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">Todas las prioridades</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
      </div>

      {/* LISTA DE TAREAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => openModal(task)}
              className="p-4 bg-white rounded-xl shadow hover:shadow-md cursor-pointer transition"
            >
              <h3 className="font-semibold text-lg">{task.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{task.description}</p>

              <div className="mt-2 text-sm text-gray-700">
                Estado: <span className="text-blue-600">{task.status}</span>
              </div>
              <div className="text-sm text-gray-700">
                Prioridad:{" "}
                <span
                  className={
                    task.priority === "alta"
                      ? "text-red-600"
                      : task.priority === "media"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }
                >
                  {task.priority}
                </span>
              </div>

              <div className="text-sm text-gray-500 mt-1">
                Vence: {formatDate(task.dueDate)} ({calculateDaysLeft(task.dueDate)})
              </div>

              <div className="text-sm text-gray-500 mt-1">
                Creado por: {task.createdBy}
              </div>

              {task.comments && task.comments.length > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  Comentarios: {task.comments.length}
                </div>
              )}

              {task.attachments && task.attachments.length > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  Archivos: {task.attachments.length}
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No hay tareas disponibles.</p>
        )}
      </div>

      {/* MODAL */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={closeModal}
        task={selectedTask}
        onUpdate={updateTask}
      />
    </div>
  );
};

export default TaskList;

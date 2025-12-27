import React, { useState, useEffect } from "react";
import axios from "axios";
import TaskModal from "../components/TaskModal";

// Calcula días restantes para vencimiento
const daysLeft = (dueDate) => {
  if (!dueDate) return null;
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const formatDate = (d) => {
  if (!d) return "Sin fecha";
  try {
    return new Date(d).toLocaleDateString("es-AR");
  } catch {
    return d;
  }
};

const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

const EmployeeTaskList = () => {
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [overdueFilter, setOverdueFilter] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("access");
        if (!token) throw new Error("No se encontró token");

        const response = await axios.get("http://127.0.0.1:8000/api/tasks/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const tasksFromBackend = response.data.map((t) => ({
          ...t,
          due_date: t.due_date,
          created_by: t.created_by,
          assigned_to: t.assigned_to,
          attachments: t.attachments || [],
          comments: t.comments || [],
        }));

        // Ordenar por fecha de creación (más recientes primero)
        tasksFromBackend.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

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
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    closeModal();
  };

  const formatStatus = (status) => {
    if (!status) return "";
    return status
      .replace("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const filteredTasks = tasks.filter((task) => {
    const statusMatch = statusFilter === "" || task.status === statusFilter;
    const priorityMatch =
      priorityFilter === "" || task.priority === priorityFilter;
    const overdueMatch = !overdueFilter || isOverdue(task.due_date);
    return statusMatch && priorityMatch && overdueMatch;
  });

  if (loading) return <p>Cargando tareas...</p>;

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-orange-50 via-orange-100 to-orange-50">
      <h2 className="text-2xl font-bold mb-6 text-orange-800">Mis Tareas</h2>

      {/* FILTROS MODERNOS */}
<div className="flex gap-4 mb-6 flex-wrap">
  <div className="relative w-48">
    <select
      className="w-full bg-orange-400 text-white border border-orange-500 rounded-xl px-4 py-2 shadow-md focus:ring-2 focus:ring-orange-300 hover:bg-orange-500 transition appearance-none"
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
    >
      <option value="">Todos los estados</option>
      <option value="pendiente">Pendiente</option>
      <option value="en_progreso">En Progreso</option>
      <option value="completada">Completada</option>
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white">
      ▼
    </div>
  </div>

  <div className="relative w-48">
    <select
      className="w-full bg-orange-400 text-white border border-orange-500 rounded-xl px-4 py-2 shadow-md focus:ring-2 focus:ring-orange-300 hover:bg-orange-500 transition appearance-none"
      value={priorityFilter}
      onChange={(e) => setPriorityFilter(e.target.value)}
    >
      <option value="">Todas las prioridades</option>
      <option value="alta">Alta</option>
      <option value="media">Media</option>
      <option value="baja">Baja</option>
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white">
      ▼
    </div>
  </div>

  {/* Checkbox de vencidas */}
  <label className="flex items-center gap-2 bg-orange-400 text-white border border-orange-500 rounded-xl px-4 py-2 shadow-md cursor-pointer hover:bg-orange-500 transition">
    <input
      type="checkbox"
      checked={overdueFilter}
      onChange={(e) => setOverdueFilter(e.target.checked)}
      className="accent-orange-600 w-5 h-5"
    />
    Solo vencidas
  </label>
</div>


      {/* LISTA DE TAREAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const leftDays = daysLeft(task.due_date);
            const urgent = leftDays !== null && leftDays <= 7 && !isOverdue(task.due_date);

            return (
              <div
                key={task.id}
                onClick={() => openModal(task)}
                className="p-5 bg-white rounded-3xl shadow-md hover:shadow-xl transition cursor-pointer border-l-4 border-orange-300"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg text-orange-800">{task.title}</h3>
                  {isOverdue(task.due_date) && (
                    <span className="bg-red-200 text-red-800 text-xs px-2 py-1 rounded-full font-bold">
                      VENCIDA
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-3">{task.description}</p>

                <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                  <div>
                    Estado:{" "}
                    <span
                      className={
                        isOverdue(task.due_date)
                          ? "text-red-600 font-bold"
                          : task.status === "pendiente"
                          ? "text-orange-500"
                          : task.status === "en_progreso"
                          ? "text-yellow-500"
                          : "text-green-500"
                      }
                    >
                      {isOverdue(task.due_date)
                        ? "VENCIDA"
                        : formatStatus(task.status)}
                    </span>
                  </div>

                  <div>
                    Prioridad:{" "}
                    <span
                      className={
                        task.priority === "alta"
                          ? "text-red-500"
                          : task.priority === "media"
                          ? "text-yellow-500"
                          : "text-green-500"
                      }
                    >
                      {task.priority}
                    </span>
                  </div>

                  <div>
                    Vence: {formatDate(task.due_date)}{" "}
                    {!isOverdue(task.due_date) && leftDays !== null && (
                      <span
                        className={`ml-1 px-2 py-1 text-xs rounded-full font-semibold ${
                          urgent
                            ? "bg-red-200 text-red-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {leftDays} día(s)
                      </span>
                    )}
                  </div>

                  <div>Creado por: {task.created_by?.username || "Desconocido"}</div>
                  <div>Asignado a: {task.assigned_to?.username || "Sin asignar"}</div>

                  {task.attachments && task.attachments.length > 0 && (
                    <div>Archivos: {task.attachments.length}</div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 italic">No hay tareas disponibles.</p>
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

export default EmployeeTaskList;

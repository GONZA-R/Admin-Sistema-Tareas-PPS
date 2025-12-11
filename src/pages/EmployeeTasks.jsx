import React, { useState, useEffect } from "react";
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

  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Configurar servidor",
      status: "pendiente",
      priority: "alta",
      description: "Instalar Ubuntu Server, firewall y SSH.",
      dueDate: "2025-12-15",
      assignedBy: "Jefe de Sistemas",
      files: [{ name: "guia_instalacion.pdf" }],
      comments: [
        { text: "Recordar configurar SSH key", date: "10/12/2025", type: "recibido" },
      ],
    },
    {
      id: 2,
      title: "Enviar reporte semanal",
      status: "en_progreso",
      priority: "media",
      description: "Enviar reporte a gerencia antes del viernes.",
      dueDate: "2025-12-10",
      assignedBy: "Gerente General",
      files: null,
      comments: [],
    },
    {
      id: 3,
      title: "Actualizar inventario",
      status: "completada",
      priority: "baja",
      description: "Revisar nuevos equipos y actualizar sistema.",
      dueDate: "2025-12-05",
      assignedBy: "Jefe de Logística",
      files: null,
      comments: [],
    },
    {
      id: 4,
      title: "Revisar cámaras",
      status: "pendiente",
      priority: "alta",
      description: "Verificar DVR y cámaras con fallas.",
      dueDate: "2025-12-12",
      assignedBy: "Jefe de Seguridad",
      files: [{ name: "informe_camaras.pdf" }],
      comments: [],
    },
  ]);

  const openModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTask(null);
    setIsModalOpen(false);
  };

  // Actualizar tarea desde el modal
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Lista de Tareas</h2>

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
                Asignado por: {task.assignedBy || "N/A"}
              </div>

              {task.comments && task.comments.length > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  Comentarios: {task.comments.length}
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No hay tareas filtradas</p>
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

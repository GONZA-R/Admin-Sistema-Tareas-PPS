import React, { useState } from "react";
import NewTaskModal from "../components/NewTaskModal";
import ConfirmModal from "../components/ConfirmModal";

export default function TasksManagement() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Diseñar interfaz de usuario",
      description: "Crear los mockups y prototipos para la nueva app para gestión de proyectos",
      priority: "Alta",
      status: "Por hacer",
      dueDate: "2025-12-15",
      assignedTo: "Gonzalo Tolay",
      files: [
      { name: "mockups.pdf" },
      { name: "mockups2.pdf" },
      { name: "diagrama.png" }
    ],
    },
    {
      id: 2,
      title: "Configurar servidor",
      description: "Instalar y configurar servidor para producción hacer tambien back up",
      priority: "Media",
      status: "En progreso",
      dueDate: "2025-12-10",
      assignedTo: "Matías López",
      files: null,
    },
    {
      id: 3,
      title: "Revisar documentación",
      description: "Verificar documentación de API y endpoints existentes para integración con frontend",
      priority: "Baja",
      status: "Completadas",
      dueDate: "2025-12-05",
      assignedTo: "Laura Pérez",
      files: { name: "api-docs.docx" },
    },
    {
      id: 4,
      title: "Pruebas unitarias",
      description: "Escribir y ejecutar pruebas unitarias del backend para asegurar calidad del código",
      priority: "Alta",
      status: "Por hacer",
      dueDate: "2025-12-12",
      assignedTo: "Juan Gómez",
      files: null,
    },
    {
      id: 5,
      title: "Revisión de diseño",
      description: "Revisar diseño con equipo de producto",
      priority: "Media",
      status: "En progreso",
      dueDate: "2025-12-08",
      assignedTo: "Sofía Díaz",
      file: null,
    },
    {
      id: 6,
      title: "Actualización de documentación",
      description: "Actualizar README y guías internas",
      priority: "Baja",
      status: "Por hacer",
      dueDate: "2025-12-20",
      assignedTo: "Carlos Ruiz",
      files: [
      { name: "mockups.pdf" },
      { name: "mockups2.pdf" },
      { name: "diagrama.png" }
    ],
    },
  ]);

  const [openModal, setOpenModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const addTask = (task) => {
    if (taskToEdit) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskToEdit.id ? { ...t, ...task } : t))
      );
      setTaskToEdit(null);
    } else {
      setTasks([...tasks, { ...task, id: Date.now(), status: "Por hacer" }]);
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const priorityColor = (priority) => {
    switch (priority.toLowerCase()) {
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
  // Función auxiliar para truncar descripción
  const truncateDescription = (text, wordLimit = 8) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.length > wordLimit ? words.slice(0, wordLimit).join(" ") + "..." : text;
  };

  return (
    <div>
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-gray-100 z-10 p-4">
        <h1 className="text-2xl font-bold">Gestión de Tareas</h1>
        <button
          onClick={() => setOpenModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Nueva Tarea
        </button>
      </div>

      {/* Lista de tareas */}
      <div className="space-y-3 pb-8">
        {tasks.length === 0 && (
          <p className="text-center text-gray-500">No hay tareas cargadas.</p>
        )}

        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white shadow-md rounded-xl p-3 hover:shadow-lg transition grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_0.5fr] items-center gap-2"
          >
            
            {/* Título y descripción */}
            <div>
              <h2 className="text-md font-semibold">{task.title}</h2>
              <p className="text-gray-500 text-sm">
                {truncateDescription(task.description, 8)}
              </p>
            </div>


            {/* Prioridad */}
            <div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>
            </div>

            {/* Fecha de vencimiento */}
            <div>
              <span className="text-gray-400 text-sm">{task.dueDate}</span>
            </div>

            {/* Estado */}
            <div>
              <span className="text-gray-600 text-sm">{task.status}</span>
            </div>

            {/* Asignado */}
            <div>
              <span className="text-gray-700 text-sm">{task.assignedTo}</span>
            </div>

      
            {/* Archivos */}
            <div className="flex flex-col text-gray-500 text-sm">
              {task.files && task.files.length > 0 && (
                <>
                  {task.files.slice(0, 2).map((f, index) => (
                    <span key={index}>📎 {f.name}</span>
                  ))}
                  {task.files.length > 2 && <span>...</span>}
                </>
              )}
            </div>



            {/* Botones */}
            <div className="flex gap-1 justify-end">
              <button
                onClick={() => {
                  setTaskToEdit(task);
                  setOpenModal(true);
                }}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
              >
                Editar
              </button>
              <button
                onClick={() => {
                  setTaskToDelete(task.id);
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

      {/* Modal de tareas */}
      <NewTaskModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setTaskToEdit(null);
        }}
        onCreate={addTask}
        taskToEdit={taskToEdit}
      />

      {/* Modal de confirmación */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => taskToDelete && deleteTask(taskToDelete)}
        message="¿Seguro que deseas eliminar esta tarea?"
      />
    </div>
  );
}

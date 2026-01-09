import React, { useState, useEffect, useMemo } from "react";
import TaskModal from "../components/TaskModal";
import api from "../services/api";

/* =======================
   HELPERS DE FECHA
======================= */

const parseLocalDate = (iso) => {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const formatDate = (value) => {
  if (!value) return "Sin fecha";
  try {
    const date =
      typeof value === "string"
        ? parseLocalDate(value.split("T")[0])
        : value;
    return date.toLocaleDateString("es-AR");
  } catch {
    return value;
  }
};

const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parseLocalDate(dueDate) < today;
};

const daysLeft = (dueDate) => {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = parseLocalDate(dueDate) - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/* =======================
   COMPONENTE TASK CARD
======================= */

const TaskCard = React.memo(({ task, onClick }) => {
  const urgent = task.leftDays !== null && task.leftDays <= 7 && !task.overdue;

  return (
    <div
      onClick={() => onClick(task)}
      className="p-5 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition cursor-pointer border-l-4 border-orange-300 hover:scale-[1.02]"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg text-orange-800 truncate">
          {task.title}
        </h3>
        {task.overdue && (
          <span className="bg-red-200 text-red-800 text-xs px-3 py-1 rounded-full font-bold">
            VENCIDA
          </span>
        )}
      </div>

      {/* Descripción truncada */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-3 break-words overflow-hidden">
        {task.description || "—"}
      </p>

      <div className="flex flex-wrap gap-3 text-sm text-gray-700">
        <div>
          Estado:{" "}
          <span
            className={`font-semibold ${
              task.overdue
                ? "text-red-600"
                : task.status === "pendiente"
                ? "text-orange-500"
                : task.status === "en_progreso"
                ? "text-yellow-500"
                : "text-green-500"
            }`}
          >
            {task.overdue
              ? "VENCIDA"
              : task.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
        </div>

        <div>
          Prioridad:{" "}
          <span
            className={`font-semibold ${
              task.priority === "alta"
                ? "text-red-500"
                : task.priority === "media"
                ? "text-yellow-500"
                : "text-green-500"
            }`}
          >
            {task.priority}
          </span>
        </div>

        <div>
          Vence: {formatDate(task.due_date)}
          {!task.overdue && task.leftDays !== null && (
            <span
              className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                urgent
                  ? "bg-red-200 text-red-800"
                  : "bg-orange-100 text-orange-800"
              }`}
            >
              {task.leftDays} día(s)
            </span>
          )}
        </div>

        <div>Creado por: {task.created_by?.username || "—"}</div>
        <div>Asignado a: {task.assigned_to?.username || "—"}</div>
        <div>Creado: {formatDate(task.created_at)}</div>

        {task.attachments?.length > 0 && <div>Archivos: {task.attachments.length}</div>}
      </div>
    </div>
  );
});

/* =======================
   COMPONENTE PRINCIPAL
======================= */

const EmployeeTaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get("/tasks/");
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setTasks(sorted);
      } catch (err) {
        console.error("Error al traer tareas:", err);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  /* =======================
     PRECALCULAR META DE CADA TASK
  ======================= */
  const tasksWithMeta = useMemo(
    () =>
      tasks.map((t) => ({
        ...t,
        overdue: isOverdue(t.due_date),
        leftDays: daysLeft(t.due_date),
      })),
    [tasks]
  );

  /* =======================
     FILTRO
  ======================= */
  const filteredTasks = useMemo(() => {
    return tasksWithMeta.filter((t) => {
      const statusMatch =
        !statusFilter || t.status === statusFilter || (statusFilter === "vencida" && t.overdue);
      const priorityMatch = !priorityFilter || t.priority === priorityFilter;
      return statusMatch && priorityMatch;
    });
  }, [tasksWithMeta, statusFilter, priorityFilter]);

  /* =======================
     HANDLERS
  ======================= */
  const openModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setSelectedTask(null);
    setIsModalOpen(false);
  };
  const updateTask = (updated) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    closeModal();
  };

  if (loading)
    return (
      <p className="p-6 text-center font-medium text-orange-700">
        Cargando tareas...
      </p>
    );

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-orange-50 via-orange-100 to-orange-50">
      <h2 className="mb-6 text-3xl font-bold tracking-tight text-orange-800">
        Mis Tareas
      </h2>

      {/* FILTROS */}
      <div className="flex flex-wrap gap-4 mb-6">
        {[
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              ["", "Todos los estados"],
              ["pendiente", "Pendiente"],
              ["en_progreso", "En Progreso"],
              ["completada", "Completada"],
              ["vencida", "Vencida"],
            ],
          },
          {
            value: priorityFilter,
            onChange: setPriorityFilter,
            options: [
              ["", "Todas las prioridades"],
              ["alta", "Alta"],
              ["media", "Media"],
              ["baja", "Baja"],
            ],
          },
        ].map((select, i) => (
          <div key={i} className="relative w-48">
            <select
              className="w-full px-4 py-2 text-white transition bg-orange-400 border border-orange-500 shadow-md appearance-none rounded-2xl hover:bg-orange-500 focus:ring-2 focus:ring-orange-300"
              value={select.value}
              onChange={(e) => select.onChange(e.target.value)}
            >
              {select.options.map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
            <span className="absolute right-3 inset-y-0 flex items-center text-white pointer-events-none">
              ▼
            </span>
          </div>
        ))}
      </div>

      {/* LISTA */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredTasks.length ? (
          filteredTasks.map((task) => <TaskCard key={task.id} task={task} onClick={openModal} />)
        ) : (
          <p className="italic text-center text-gray-500 col-span-full">
            No hay tareas disponibles.
          </p>
        )}
      </div>

      {/* MODAL */}
      <TaskModal
        isOpen={isModalOpen}
        task={selectedTask}
        onClose={closeModal}
        onUpdate={updateTask}
      />
    </div>
  );
};

export default EmployeeTaskList;

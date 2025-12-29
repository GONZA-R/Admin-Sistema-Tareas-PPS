import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, User, AlertTriangle } from "lucide-react";

export default function UpcomingDue({ tasks, fullHeight = false }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  const priorityStyle = {
    Alta: {
      badge: "bg-red-600 text-white",
      dot: "bg-red-600",
      glow: "shadow-[0_0_15px_rgba(220,38,38,0.5)]",
      text: "text-red-600",
    },
    Media: {
      badge: "bg-yellow-500 text-gray-900",
      dot: "bg-yellow-500",
      glow: "shadow-[0_0_15px_rgba(250,204,21,0.5)]",
      text: "text-yellow-600",
    },
    Baja: {
      badge: "bg-green-500 text-white",
      dot: "bg-green-500",
      glow: "shadow-[0_0_15px_rgba(34,197,94,0.5)]",
      text: "text-green-600",
    },
  };

  // Función para calcular días restantes exactos
  const calculateDueInDays = (dueDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // hoy a medianoche

    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0, 0, 0, 0); // fecha de vencimiento a medianoche

    const diffTime = dueDate - today;
    return diffTime / (1000 * 60 * 60 * 24); // días exactos
  };

  useEffect(() => {
    const processed = (tasks || [])
      .map(task => {
        const due_in_days = calculateDueInDays(task.due_date);
        return {
          ...task,
          due_in_days,
          due_in: `${due_in_days} ${due_in_days === 1 ? "día" : "días"}`,
        };
      })
      .filter(task => task.due_in_days >= 0 && task.due_in_days <= 7)
      .sort((a, b) => a.due_in_days - b.due_in_days);

    setUpcomingTasks(processed);
  }, [tasks]);

  const getAssigneeName = (task) => {
    if (!task) return "Sin asignar";
    if (typeof task.assignee === "string") return task.assignee;
    if (task.assignee?.username) return task.assignee.username;
    if (task.assigned_to?.username) return task.assigned_to.username;
    return "Sin asignar";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Sin fecha";
    const date = new Date(dateStr);
    return date.toLocaleDateString(); // SOLO fecha, sin hora
  };

  if (!upcomingTasks.length) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
        No hay tareas próximas a vencer
      </div>
    );
  }

  return (
    <>
      <div className={`bg-white rounded-3xl shadow-xl ${fullHeight ? "h-full flex flex-col" : ""}`}>
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Calendar size={18} />
            Próximos vencimientos
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Tareas que vencen en los próximos 7 días
          </p>
        </div>

        <ul className="p-5 space-y-4 flex-1 overflow-y-auto">
          {upcomingTasks.map((t, index) => (
            <motion.li
              key={t.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              whileHover={{
                scale: 1.03,
                boxShadow: `0 8px 25px rgba(0,0,0,0.15), ${priorityStyle[t.priority]?.glow}`,
              }}
              onClick={() => setSelectedTask(t)}
              className={`cursor-pointer rounded-2xl p-4 bg-gradient-to-r from-white via-gray-50 to-white border border-gray-200 hover:border-gray-300 transition-transform duration-300`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-3 h-3 rounded-full ${priorityStyle[t.priority]?.dot}`}
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{t.title}</p>
                    <p className={`text-xs flex items-center gap-1 mt-1 ${priorityStyle[t.priority]?.text}`}>
                      <User size={12} />
                      {getAssigneeName(t)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${priorityStyle[t.priority]?.badge}`}
                  >
                    {t.priority}
                  </span>
                  <span
                    className={`text-xs font-medium ${t.due_in_days <= 1 ? "text-red-600" : priorityStyle[t.priority]?.text}`}
                  >
                    {t.due_in}
                  </span>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>

      <AnimatePresence>
        {selectedTask && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              className="bg-white w-[640px] max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl p-6"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">{selectedTask.title}</h2>
                {selectedTask.due_in_days <= 1 && (
                  <span className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertTriangle size={16} />
                    Urgente
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <p className="text-gray-500">Responsable</p>
                  <p className="font-medium">{getAssigneeName(selectedTask)}</p>
                </div>

                <div>
                  <p className="text-gray-500">Prioridad</p>
                  <span
                    className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${priorityStyle[selectedTask.priority]?.badge}`}
                  >
                    {selectedTask.priority}
                  </span>
                </div>

                <div>
                  <p className="text-gray-500">Fecha de vencimiento</p>
                  <p className="font-medium">{formatDate(selectedTask.due_date)}</p>
                </div>

                <div>
                  <p className="text-gray-500">Vence en</p>
                  <p className={`font-medium ${priorityStyle[selectedTask.priority]?.text}`}>
                    {selectedTask.due_in}
                  </p>
                </div>
              </div>

              <h3 className="font-semibold mb-2">Archivos adjuntos</h3>
              <div className="space-y-2">
                {selectedTask.attachments?.length > 0 ? (
                  selectedTask.attachments.map((f) => (
                    <div
                      key={f.id || f.name}
                      className="flex justify-between items-center p-3 border rounded-lg bg-gray-50"
                    >
                      <span className="text-sm font-medium">{f.name}</span>
                      <a
                        href={f.url}
                        className="text-blue-600 hover:underline text-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Descargar
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No hay archivos adjuntos</p>
                )}
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                className="mt-6 w-full bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-lg transition"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

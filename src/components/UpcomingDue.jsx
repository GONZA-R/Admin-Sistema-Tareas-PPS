import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function UpcomingDue({ tasks, fullHeight = false }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  // Clases para prioridades
  const priorityStyle = {
    Alta: "bg-red-100 text-red-700",
    Media: "bg-yellow-100 text-yellow-700",
    Baja: "bg-green-100 text-green-700"
  };

  useEffect(() => {
    const now = new Date();

    const processed = (tasks || [])
      .map(task => {
        const dueDate = new Date(task.due_date);
        const diffTime = dueDate - now;
        const due_in_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
          ...task,
          due_in_days,
          due_in: `${due_in_days} ${due_in_days === 1 ? "día" : "días"}`
        };
      })
      .filter(task => task.due_in_days >= 0 && task.due_in_days <= 7) // solo próximas 7 días
      .sort((a, b) => a.due_in_days - b.due_in_days); // orden por proximidad

    setUpcomingTasks(processed);
  }, [tasks]);

  if (!upcomingTasks.length) {
    return <div className="text-gray-500 text-center py-10">No hay tareas próximas a vencer</div>;
  }

  const getAssigneeName = (task) => {
    // Maneja diferentes formatos de backend
    if (!task) return "Sin asignar";
    if (typeof task.assignee === "string") return task.assignee;
    if (task.assignee?.username) return task.assignee.username;
    if (task.assigned_to?.username) return task.assigned_to.username;
    return "Sin asignar";
  };

  return (
    <>
      {/* LISTA PRINCIPAL */}
      <div
        className={`bg-white rounded-xl shadow-md p-5 border border-gray-200 
        ${fullHeight ? "h-full flex flex-col" : ""}`}
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Próximos Vencimientos
        </h2>

        <ul className="space-y-3 flex-1 overflow-y-auto">
          {upcomingTasks.map((t) => (
            <li
              key={t.id}
              onClick={() => setSelectedTask(t)}
              className="p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl cursor-pointer transition-all"
            >
              <div className="flex justify-between">
                <p className="font-medium text-gray-900">{t.title}</p>
                <div className="flex gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${priorityStyle[t.priority]}`}
                  >
                    {t.priority}
                  </span>
                  <span className={`text-sm ${t.due_in_days <= 1 ? 'text-red-500' : 'text-gray-700'}`}>
                    {t.due_in}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Responsable: {getAssigneeName(t)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              className="bg-white w-[600px] max-h-[85vh] overflow-y-auto rounded-xl p-6 shadow-xl border border-gray-200"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* TITULO */}
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {selectedTask.title}
              </h2>

              {/* INFO PRINCIPAL */}
              <div className="space-y-2 mb-5">
                <p><strong>Responsable:</strong> {getAssigneeName(selectedTask)}</p>

                <p>
                  <strong>Prioridad:</strong>{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${priorityStyle[selectedTask.priority]}`}
                  >
                    {selectedTask.priority}
                  </span>
                </p>

                <p>
                  <strong>Fecha de vencimiento:</strong>{" "}
                  {new Date(selectedTask.due_date).toLocaleString()}
                </p>

                <p><strong>Vence en:</strong> {selectedTask.due_in}</p>
              </div>

              

              {/* ARCHIVOS ADJUNTOS */}
              <h3 className="text-lg font-semibold mb-3">Archivos Adjuntos</h3>
              <div className="space-y-2 mb-5">
                {selectedTask.attachments?.length > 0 ? (
                  selectedTask.attachments.map((f) => (
                    <div
                      key={f.id}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center"
                    >
                      <span className="font-medium">{f.name}</span>
                      <a
                        href={f.url}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Descargar
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No hay archivos adjuntos.</p>
                )}
              </div>

              {/* BOTÓN CERRAR */}
              <button
                onClick={() => setSelectedTask(null)}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
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

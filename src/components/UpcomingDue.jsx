import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function UpcomingDue({ tasks }) {
  const [selectedTask, setSelectedTask] = useState(null);

  // Datos de ejemplo si no llegan desde backend
  const sample = tasks || [
    {
      id: 1,
      title: "Configurar router",
      assignee: "Juan",
      due_in: "2 días",
      due_date: "2025-02-01T18:00:00",
      priority: "Alta",
      comments: [
        { id: 1, user: "Marta", text: "Revisé el rack.", date: "2025-01-20" },
        { id: 2, user: "Juan", text: "Voy mañana.", date: "2025-01-22" }
      ],
      attachments: [
        { id: 1, name: "instrucciones.pdf", url: "#" },
        { id: 2, name: "configuracion.txt", url: "#" }
      ]
    },
    {
      id: 2,
      title: "Revisar backup",
      assignee: "Marta",
      due_in: "3 días",
      due_date: "2025-02-02T12:00:00",
      priority: "Media",
      comments: [
        { id: 1, user: "Admin", text: "Verificar logs.", date: "2025-01-21" }
      ],
      attachments: []
    }
  ];

  // Clases para prioridades
  const priorityStyle = {
    Alta: "bg-red-100 text-red-700",
    Media: "bg-yellow-100 text-yellow-700",
    Baja: "bg-green-100 text-green-700"
  };

  return (
    <>
      {/* LISTA PRINCIPAL */}
      <div className="bg-white rounded-xl shadow-md p-5 h-full border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Próximos Vencimientos
        </h2>

        <ul className="space-y-3">
          {sample.map((t) => (
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
                  <span className="text-sm text-gray-700">{t.due_in}</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Responsable: {t.assignee}
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
                <p><strong>Responsable:</strong> {selectedTask.assignee}</p>

                <p><strong>Prioridad:</strong>{" "}
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

              {/* COMENTARIOS */}
              <h3 className="text-lg font-semibold mb-3">Seguimiento / Comentarios</h3>
              <div className="space-y-3 mb-5">
                {selectedTask.comments?.length > 0 ? (
                  selectedTask.comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      <p className="font-medium">{c.user}</p>
                      <p className="text-sm text-gray-700 mt-1">{c.text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(c.date).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No hay comentarios todavía.</p>
                )}
              </div>

              {/* ARCHIVOS ADJUNTOS */}
              <h3 className="text-lg font-semibold mb-3">Archivos Adjuntos</h3>
              <div className="space-y-2 mb-5">
                {selectedTask.attachments?.length > 0 ? (
                  selectedTask.attachments.map(f => (
                    <div
                      key={f.id}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center"
                    >
                      <span className="font-medium">{f.name}</span>
                      <a href={f.url} className="text-blue-600 hover:underline text-sm">Descargar</a>
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

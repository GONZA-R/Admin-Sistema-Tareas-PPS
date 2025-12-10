import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function RecentActivity({ activities }) {
  const [selectedActivity, setSelectedActivity] = useState(null);

  if (!activities) return null;

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-3 h-full border border-gray-200">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          Actividad Reciente
        </h2>

        <ul className="space-y-2 max-h-[350px] overflow-y-auto">
          {activities.map((act) => (
            <li
              key={act.id}
              onClick={() => setSelectedActivity(act)}
              className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg cursor-pointer transition-all"
            >
              <div className="flex justify-between items-center">
                <p className="font-medium text-gray-900 text-sm">{act.task_title}</p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    act.type === "update"
                      ? "bg-blue-100 text-blue-700"
                      : act.type === "comment"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {act.type === "comment" ? "Comentario" : "Actualización"}
                </span>
              </div>

              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>{act.user}</span>
                <span>{new Date(act.created_at).toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* MODAL COMPACTO */}
      <AnimatePresence>
        {selectedActivity && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedActivity(null)}
          >
            <motion.div
              className="bg-white w-[500px] max-h-[80vh] overflow-y-auto rounded-xl p-5 shadow-2xl border border-gray-200"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-3 text-gray-800">
                {selectedActivity.task_title}
              </h2>
              <p className="text-sm text-gray-700 mb-2">{selectedActivity.text}</p>
              <p className="text-xs text-gray-500">
                <strong>Usuario:</strong> {selectedActivity.user}
              </p>
              <p className="text-xs text-gray-500">
                <strong>Tipo:</strong>{" "}
                {selectedActivity.type === "comment" ? "Comentario" : "Actualización"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                <strong>Fecha:</strong>{" "}
                {new Date(selectedActivity.created_at).toLocaleString()}
              </p>

              <button
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                onClick={() => setSelectedActivity(null)}
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

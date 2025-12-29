import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

export default function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem("access");
      if (!token) return;

      setLoading(true);

      const res = await axios.get("http://127.0.0.1:8000/api/notifications/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sorted = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setActivities(sorted);
    } catch (err) {
      console.error("Error al traer actividades:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("access");
      if (!token) return;

      await axios.post(
        `http://127.0.0.1:8000/api/notifications/${id}/mark_read/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setActivities((prev) =>
        prev.map((act) => (act.id === id ? { ...act, is_read: true } : act))
      );
    } catch (err) {
      console.error("Error al marcar actividad como leída:", err);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Renderizar título principal
  const renderTitle = (act) => {
    switch (act.type) {
      case "creation":
        return act.task?.title || "-";
      case "delegation":
        return act.task?.title || "-";
      case "status_change":
        return act.task?.title || "-";
      case "comment":
        return act.task?.title || "-";
      default:
        return act.message || "-";
    }
  };

  // Renderizar badge
  const renderBadge = (act) => {
    switch (act.type) {
      case "creation":
        return "bg-purple-100 text-purple-700";
      case "delegation":
        return "bg-yellow-100 text-yellow-700";
      case "status_change":
        return "bg-orange-100 text-orange-700";
      case "comment":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  // Renderizar quién creó
  const renderCreator = (act) => {
    if (act.type === "creation") return act.task?.created_by?.username || "-";
    if (act.type === "delegation") return act.action?.delegated_by?.username || "-";
    if (act.type === "comment") return act.user?.username || "-";
    return "-";
  };

  // Renderizar para quién
  const renderAssigned = (act) => {
    if (act.type === "creation") return act.task?.assigned_to?.username || "-";
    if (act.type === "delegation") return act.action?.delegated_to?.username || "-";
    return "-";
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-4 h-full border border-gray-200">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          Actividad Reciente
        </h2>

        <div className="space-y-3 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {loading ? (
            <p className="text-sm text-gray-500">Cargando...</p>
          ) : activities.length === 0 ? (
            <p className="text-sm text-gray-500">No hay actividades</p>
          ) : (
            activities.map((act) => (
              <motion.div
                key={act.id}
                onClick={() => {
                  setSelectedActivity(act);
                  if (!act.is_read) markAsRead(act.id);
                }}
                className={`p-3 rounded-xl shadow-sm cursor-pointer border transition-all ${
                  act.is_read ? "bg-gray-50 hover:bg-gray-100" : "bg-blue-50 hover:bg-blue-100"
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex justify-between items-center">
                  <p className="font-medium text-gray-900 text-sm">{renderTitle(act)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${renderBadge(act)}`}>
                    {act.type.replace("_", " ").toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>Creado por: {renderCreator(act)}</span>
                  <span>Para: {renderAssigned(act)}</span>
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  {act.created_at ? new Date(act.created_at).toLocaleString() : "-"}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Modal detalle */}
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
                {renderTitle(selectedActivity)}
              </h2>
              <p className="text-sm text-gray-700 mb-2">{selectedActivity.text || selectedActivity.message || "-"}</p>
              <p className="text-xs text-gray-500">
                <strong>Creado por:</strong> {renderCreator(selectedActivity)}
              </p>
              <p className="text-xs text-gray-500">
                <strong>Para:</strong> {renderAssigned(selectedActivity)}
              </p>
              <p className="text-xs text-gray-500">
                <strong>Tipo:</strong> {selectedActivity.type.replace("_", " ").toUpperCase() || "-"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                <strong>Fecha:</strong> {selectedActivity.created_at ? new Date(selectedActivity.created_at).toLocaleString() : "-"}
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

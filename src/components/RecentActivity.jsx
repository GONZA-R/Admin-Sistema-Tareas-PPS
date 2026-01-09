import React, { useEffect, useState } from "react";
import api from "../services/api";

// Card memoizado para evitar re-renders innecesarios
const ActivityCard = React.memo(({ act, onClick, badgeColor }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer p-4 rounded-2xl border transition-all w-full ${
      act.is_read
        ? "border-gray-100 hover:bg-gray-100"
        : "border-blue-300 hover:bg-blue-100 shadow-md"
    }`}
    style={{ backgroundColor: act.is_read ? "#f9fafb" : "#eff6ff" }}
  >
    <div className="flex justify-between items-start flex-wrap">
      <p className="font-medium text-gray-900">{act.message}</p>
      <span className={`text-xs px-2 py-0.5 rounded-full mt-2 md:mt-0 ${badgeColor(act.type)}`}>
        {act.type.toUpperCase()}
      </span>
    </div>
    <div className="mt-2 text-xs text-gray-400">
      {new Date(act.created_at).toLocaleString("es-AR")}
    </div>
  </div>
));

export default function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchActivities = async () => {
    try {
      const res = await api.get("notifications/");
      const sorted = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setActivities((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const newItems = sorted.filter((a) => !existingIds.has(a.id));
        if (newItems.length === 0) return prev;
        return [...newItems, ...prev];
      });
    } catch (err) {
      console.error("Error al traer actividades:", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`notifications/${id}/mark-read/`);
      setActivities((prev) =>
        prev.map((act) => (act.id === id ? { ...act, is_read: true } : act))
      );
    } catch (err) {
      console.error("Error al marcar actividad como leída:", err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchActivities().finally(() => setLoading(false));
    const interval = setInterval(fetchActivities, 10000);
    return () => clearInterval(interval);
  }, []);

  const badgeColor = (type) => {
    switch (type) {
      case "archivo":
        return "bg-blue-100 text-blue-700";
      case "creada":
        return "bg-green-100 text-green-700";
      case "estado":
        return "bg-orange-100 text-orange-700";
      case "nueva":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl flex flex-col border border-gray-200">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 sticky top-0 bg-white z-20">
        <h2 className="text-xl font-bold text-gray-800">Actividad Reciente</h2>
      </div>

      {/* Scrollable */}
      <div className="p-4 overflow-y-auto max-h-[300px] space-y-3">
        {loading ? (
          <p className="text-center text-gray-400 mt-5">Cargando...</p>
        ) : activities.length === 0 ? (
          <p className="text-center text-gray-400 mt-5">No hay actividades</p>
        ) : (
          activities.map((act) => (
            <ActivityCard
              key={act.id}
              act={act}
              badgeColor={badgeColor}
              onClick={() => {
                if (!act.is_read) markAsRead(act.id);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

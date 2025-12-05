import React from "react";

export default function PriorityBreakdown() {
  // Datos fijos por ahora (se pueden conectar al backend más adelante)
  const data = {
    alta: 3,
    media: 1,
    baja: 1,
  };

  const total = Object.values(data).reduce((a, b) => a + b, 0);

  const percent = (value) =>
    total > 0 ? ((value / total) * 100).toFixed(0) : 0;

  return (
    <div className="w-full bg-white shadow rounded-xl p-6">
      <h2 className="text-xl font-bold mb-2">Tareas por Prioridad</h2>
      <p className="text-gray-500 mb-4">Distribución de tareas activas</p>

      <div className="space-y-3">
        {/* Alta */}
        <div className="flex justify-between p-2 border rounded-md">
          <span className="font-semibold text-orange-600">Alta</span>
          <span>
            <strong>{data.alta}</strong> ({percent(data.alta)}%)
          </span>
        </div>

        {/* Media */}
        <div className="flex justify-between p-2 border rounded-md">
          <span className="font-semibold text-yellow-600">Media</span>
          <span>
            <strong>{data.media}</strong> ({percent(data.media)}%)
          </span>
        </div>

        {/* Baja */}
        <div className="flex justify-between p-2 border rounded-md">
          <span className="font-semibold text-green-600">Baja</span>
          <span>
            <strong>{data.baja}</strong> ({percent(data.baja)}%)
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="mt-4 bg-gray-100 p-3 rounded-md text-center">
        <p className="font-bold text-gray-700">
          Total Activas: {total} tareas
        </p>
      </div>
    </div>
  );
}

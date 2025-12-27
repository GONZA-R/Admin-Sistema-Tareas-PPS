import React from "react";

export default function PriorityBreakdown() {
  const data = { alta: 3, media: 1, baja: 1 };
  const total = Object.values(data).reduce((a, b) => a + b, 0);

  const percent = (v) => (total ? ((v / total) * 100).toFixed(0) : 0);

  const items = [
    { label: "Alta", value: data.alta, color: "text-orange-600" },
    { label: "Media", value: data.media, color: "text-yellow-600" },
    { label: "Baja", value: data.baja, color: "text-green-600" },
  ];

  return (
    <div className="w-full bg-white shadow rounded-xl p-4">
      <h2 className="text-lg font-bold">Tareas por Prioridad</h2>

      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex justify-between items-center p-2 border rounded-md"
          >
            <span className={`font-semibold ${item.color}`}>{item.label}</span>
            <span className="text-sm">
              <strong>{item.value}</strong> • {percent(item.value)}%
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 bg-gray-100 p-2 rounded-md text-center">
        <p className="font-semibold text-gray-700 text-sm">
          Total: {total} tareas
        </p>
      </div>
    </div>
  );
}

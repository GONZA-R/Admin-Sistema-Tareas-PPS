import React from "react";

export default function DashboardCards({ stats }) {
  // stats: { total, active, overdue, upcoming, completed }
  const s = stats || { total: 0, active: 0, overdue: 0, upcoming: 0, completed: 0 };

  const items = [
    { title: "Total tareas", value: s.total },
    { title: "Tareas activas", value: s.active },
    { title: "Tareas vencidas", value: s.overdue },
    { title: "Próximos venc.", value: s.upcoming },
    { title: "Completadas", value: s.completed },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
      {items.map((it) => (
        <div key={it.title} className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">{it.title}</div>
          <div className="text-2xl font-bold">{it.value}</div>
        </div>
      ))}
    </div>
  );
}

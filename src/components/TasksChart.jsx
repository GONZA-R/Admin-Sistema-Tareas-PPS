import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export default function TasksChart() {
  const [view, setView] = useState("monthly");

  /* ===========================
       DATOS DE EJEMPLO
     =========================== */

  const monthlyData = [
    { name: "Ene", alta: 5, media: 4, baja: 3 },
    { name: "Feb", alta: 7, media: 6, baja: 6 },
    { name: "Mar", alta: 4, media: 5, baja: 5 },
    { name: "Abr", alta: 9, media: 7, baja: 6 },
    { name: "May", alta: 6, media: 8, baja: 4 },
    { name: "Jun", alta: 10, media: 9, baja: 6 },
  ];

  const weeklyData = [
    { name: "Semana 1", alta: 2, media: 2, baja: 1 },
    { name: "Semana 2", alta: 3, media: 4, baja: 2 },
    { name: "Semana 3", alta: 5, media: 3, baja: 4 },
    { name: "Semana 4", alta: 2, media: 4, baja: 1 },
  ];

  const data = view === "monthly" ? monthlyData : weeklyData;

  return (
    <div className="w-full bg-white shadow-md rounded-2xl p-6 border border-gray-100">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Actividad de Tareas por Prioridad
        </h2>

        <select
          value={view}
          onChange={(e) => setView(e.target.value)}
          className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5
                     focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="monthly">Mensual</option>
          <option value="weekly">Semanal</option>
        </select>
      </div>

      {/* Gráfico */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />

            <XAxis
              dataKey="name"
              tick={{ fill: "#4b5563", fontSize: 12 }}
            />

            <YAxis tick={{ fill: "#4b5563", fontSize: 12 }} />

            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                padding: "10px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />

            <Legend />

            {/* Vertical bars por prioridad */}
            <Bar
              dataKey="alta"
              fill="#f97316"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="media"
              fill="#facc15"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="baja"
              fill="#22c55e"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

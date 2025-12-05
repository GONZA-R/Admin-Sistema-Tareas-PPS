import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Lunes", tasks: 12 },
  { name: "Martes", tasks: 19 },
  { name: "Miércoles", tasks: 3 },
  { name: "Jueves", tasks: 5 },
  { name: "Viernes", tasks: 10 }
];

export default function TasksChart() {
  return (
    <div className="w-full h-72 bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-bold mb-2">Tareas por Día</h2>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="tasks" fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

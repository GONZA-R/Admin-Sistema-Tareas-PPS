import React, { useEffect, useState } from "react";
import api from "../services/api";

import DashboardCards from "../components/DashboardCards";
import TasksChart from "../components/TasksChart";
import PriorityBreakdown from "../components/PriorityBreakdown";
import UpcomingDue from "../components/UpcomingDue";
import RecentActivity from "../components/RecentActivity";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: tasks } = await api.get("/tasks/");
        const now = new Date();

        const tasksWithDays = tasks.map(t => ({
          ...t,
          due_in_days: Math.ceil((new Date(t.due_date) - now) / (1000 * 60 * 60 * 24))
        }));

        const upcomingTasks = tasksWithDays
          .filter(t => t.due_in_days >= 0 && t.due_in_days <= 7)
          .sort((a, b) => a.due_in_days - b.due_in_days);

        setUpcoming(upcomingTasks);

        setStats({
          total: tasks.length,
          completed: tasks.filter(t => t.status === "completada").length,
          overdue: tasks.filter(t => new Date(t.due_date) < now && t.status !== "completada").length,
          active: tasks.filter(t => new Date(t.due_date) >= now && t.status !== "completada").length,
          upcoming: upcomingTasks.length
        });

        setActivities([
          {
            id: 1,
            task_id: 101,
            type: "comment",
            user: "Sofía",
            task_title: "Migración ERP",
            text: "Faltan credenciales para conectarse al servidor.",
            created_at: new Date().toISOString(),
            priority: "alta",
            status: "pendiente",
            attachments: ["credenciales.pdf"],
            comments_count: 3
          },
          {
            id: 2,
            task_id: 102,
            type: "update",
            user: "Carlos",
            task_title: "Revisión de cámaras",
            text: "Tarea completada, cámaras funcionando correctamente.",
            created_at: new Date().toISOString(),
            previous_status: "en progreso",
            status: "completada",
            priority: "media",
            attachments: []
          },
          {
            id: 3,
            task_id: 103,
            type: "comment",
            user: "Gonzalo",
            task_title: "Migración Python",
            text: "Faltan credenciales y librerías necesarias.",
            created_at: new Date().toISOString(),
            priority: "alta",
            status: "pendiente",
            attachments: ["requirements.txt"]
          }
        ]);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6 min-h-screen p-6 bg-gradient-to-br from-yellow-100 via-yellow-200 to-orange-100">

      {/* Tarjetas estadísticas */}
      <DashboardCards stats={stats} />

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* COLUMNA IZQUIERDA */}
        <div className="space-y-6">
          {/* Gráfico de tareas */}
          <div className="bg-gradient-to-br from-orange-200 to-yellow-100 rounded-xl shadow-md p-4 border border-orange-300 rounded-xl shadow-md p-4 border border-gray-200">
            <TasksChart />
          </div>

          {/* Actividad reciente */}
          <div className="bg-gradient-to-br from-orange-200 to-yellow-100 rounded-xl shadow-md p-4 border border-orange-300 rounded-xl shadow-md p-4 border border-gray-200 max-h-[400px] overflow-y-auto">
            <RecentActivity activities={activities} />
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-6">
          {/* Tareas por prioridad */}
          <div className="bg-gradient-to-br from-orange-200 to-yellow-100 rounded-xl shadow-md p-4 border border-orange-300 rounded-xl shadow-md p-4 border border-gray-200">
            <PriorityBreakdown compact />
          </div>

          {/* Próximos vencimientos */}
          <div className="bg-gradient-to-br from-orange-200 to-yellow-100 rounded-xl shadow-md p-4 border border-orange-300 rounded-xl shadow-md p-4 border border-gray-200 max-h-[500px] overflow-y-auto">
            <UpcomingDue tasks={upcoming} fullHeight />
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import api from "../services/api";

import DashboardCards from "../components/DashboardCards";
import TasksChart from "../components/TasksChart";
import PriorityBreakdown from "../components/PriorityBreakdown";
import UpcomingDue from "../components/UpcomingDue";
import RecentActivity from "../components/RecentActivity";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // =========================
        // TRAER TAREAS DEL BACKEND
        // =========================
        const { data } = await api.get("/tasks/");
        setTasks(data);

        const now = new Date();

        // =========================
        // CALCULAR DÍAS RESTANTES
        // =========================
        const tasksWithDays = data.map((t) => ({
          ...t,
          due_in_days: Math.ceil((new Date(t.due_date) - now) / (1000 * 60 * 60 * 24)),
        }));

        // =========================
        // PRÓXIMOS VENCIMIENTOS
        // =========================
        const upcomingTasks = tasksWithDays
          .filter((t) => t.due_in_days >= 0 && t.due_in_days <= 7)
          .map((t) => ({ ...t, priority: t.priority.charAt(0).toUpperCase() + t.priority.slice(1) }))
          .sort((a, b) => a.due_in_days - b.due_in_days);

        setUpcoming(upcomingTasks);

        // =========================
        // ESTADÍSTICAS GENERALES
        // =========================
        setStats({
          total: data.length,
          completed: data.filter((t) => t.status === "completada").length,
          overdue: data.filter((t) => new Date(t.due_date) < now && t.status !== "completada").length,
          active: data.filter((t) => new Date(t.due_date) >= now && t.status !== "completada").length,
          upcoming: upcomingTasks.length,
        });
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="space-y-6 min-h-screen p-6 bg-gradient-to-br from-yellow-100 via-yellow-200 to-orange-100">

      {/* TARJETAS ESTADÍSTICAS */}
      <DashboardCards stats={stats} />

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* COLUMNA IZQUIERDA */}
        <div className="space-y-6">

          {/* GRÁFICO DE TAREAS */}
          <div className="bg-gradient-to-br from-orange-200 to-yellow-100 rounded-xl shadow-md p-4 border border-orange-300">
            <TasksChart />
          </div>

          {/* ACTIVIDAD RECIENTE */}
          <div className="bg-gradient-to-br from-orange-200 to-yellow-100 rounded-xl shadow-md p-4 border border-orange-300 max-h-[400px] overflow-y-auto">
            <RecentActivity /> {/* ⚡ Ya trae los datos de la API por sí mismo */}
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-6">

          {/* TAREAS POR PRIORIDAD */}
          <div className="bg-gradient-to-br from-orange-200 to-yellow-100 rounded-xl shadow-md p-4 border border-orange-300">
            <PriorityBreakdown tasks={tasks} compact />
          </div>

          {/* PRÓXIMOS VENCIMIENTOS */}
          <div className="bg-gradient-to-br from-orange-200 to-yellow-100 rounded-xl shadow-md p-4 border border-orange-300 max-h-[500px] overflow-y-auto">
            <UpcomingDue tasks={upcoming} fullHeight />
          </div>
        </div>
      </div>
    </div>
  );
}

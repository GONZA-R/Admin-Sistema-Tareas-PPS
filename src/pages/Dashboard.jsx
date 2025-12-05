import React, { useEffect, useState } from "react";

// Componentes
import DashboardCards from "../components/DashboardCards";
import TasksChart from "../components/TasksChart";
import PriorityBreakdown from "../components/PriorityBreakdown";
import UpcomingDue from "../components/UpcomingDue";
import RecentActivity from "../components/RecentActivity";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [priorityData, setPriorityData] = useState(null);
  const [upcoming, setUpcoming] = useState(null);
  const [activities, setActivities] = useState(null);

  useEffect(() => {
    // Datos de ejemplo (mock), sin backend
    setStats({
      total: 120,
      active: 50,
      overdue: 8,
      upcoming: 10,
      completed: 62,
    });

    setStatusData([
      { name: "Pendiente", count: 20 },
      { name: "En Progreso", count: 15 },
      { name: "En Revisión", count: 5 },
      { name: "Completada", count: 30 },
    ]);

    setPriorityData([
      { name: "Alta", value: 3 },
      { name: "Media", value: 1 },
      { name: "Baja", value: 1 },
    ]);

    /*
    setUpcoming([
      {
        id: 1,
        title: "Configurar router",
        assignee: "Juan",
        due_in: "2 días",
      },
      {
        id: 2,
        title: "Actualizar servidor",
        assignee: "Laura",
        due_in: "5 días",
      },
    ]);
    */
    setUpcoming([
  {
    id: 1,
    title: "Configurar router",
    assignee: "Juan",
    due_in: "2 días",
    due_date: "2025-02-01T18:00:00",
    priority: "Alta",
    comments: [
      { id: 1, user: "Marta", text: "Revisé el rack.", date: "2025-01-20" },
      { id: 2, user: "Juan", text: "Voy mañana.", date: "2025-01-22" }
    ],
    attachments: [
      { id: 1, name: "instrucciones.pdf", url: "#" },
      { id: 2, name: "configuracion.txt", url: "#" }
    ]
  },
  {
    id: 2,
    title: "Actualizar servidor",
    assignee: "Laura",
    due_in: "5 días",
    due_date: "2025-02-03T12:00:00",
    priority: "Media",
    comments: [
      { id: 1, user: "Admin", text: "Verificar logs.", date: "2025-01-21" }
    ],
    attachments: []
  }
]);

/*
    setActivities([
      {
        id: 1,
        type: "comment",
        user: "Sofía",
        task_title: "Migración ERP",
        text: "Faltan credenciales",
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        type: "update",
        user: "Carlos",
        task_title: "Revisión de cámaras",
        text: "Tarea marcada como completada",
        created_at: new Date().toISOString(),
      },
      {
        id: 3,
        type: "comment",
        user: "Gonzalo",
        task_title: "Migración Python",
        text: "Faltan credenciales",
        created_at: new Date().toISOString(),
      },
    ]);
  }, []);
*/
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
    text: "Tarea marcada como completada, cámaras funcionando correctamente.",
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
  },
]);
}, []);
  return (
    <div className="space-y-6">
      {/* Tarjetas de estadísticas */}
      <DashboardCards stats={stats} />

      {/* Gráfico de estado y lista de prioridad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TasksChart data={statusData} />
        <PriorityBreakdown data={priorityData} />
      </div>

      {/* Actividad reciente + próximos vencimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity activities={activities} />
        </div>

        <UpcomingDue tasks={upcoming} />
      </div>
    </div>
  );
}

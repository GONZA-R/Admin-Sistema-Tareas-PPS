import { X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import api from "../services/api"; // tu instancia axios

const calculateDaysLeft = (dueDate) => {
  if (!dueDate) return "N/A";
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? `${diffDays} día(s)` : "Vencida";
};

export default function TaskDetailModal({ open, onClose, task, onUpdate }) {
  const [status, setStatus] = useState(task?.status || "");
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(task?.comments || []);
  const commentsEndRef = useRef(null);

  useEffect(() => {
    if (task) {
      setStatus(task.status);
      setComments(task.comments || []);
      setNewComment("");
    }
  }, [task]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  if (!open || !task) return null;

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    // se agrega solo en el modal, no se guarda aún en backend
    setComments([
      ...comments,
      {
        id: `temp-${Date.now()}`,
        message: newComment,
        user: { username: "Tú" }, // marcar como usuario local
        created_at: new Date().toLocaleString(),
        isNew: true,
      },
    ]);
    setNewComment("");
  };

  const handleSaveChanges = async () => {
    try {
      // 1️ Actualizar estado de la tarea
      const token = localStorage.getItem("access");
      const resTask = await api.patch(
        `/tasks/${task.id}/`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2️ Guardar comentarios nuevos
      for (const c of comments.filter((c) => c.isNew)) {
        await api.post(
          `/comments/`,
          { task: task.id, message: c.message },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Actualizar localmente
      const updatedTask = {
        ...task,
        status: resTask.data.status,
        comments,
      };
      onUpdate(updatedTask);
      onClose();
    } catch (err) {
      console.error("Error al guardar cambios:", err);
      alert("No se pudieron guardar los cambios.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold">{task.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">

          {/* Descripción */}
          <div>
            <p className="text-gray-500">Descripción</p>
            <p>{task.description}</p>
          </div>

          {/* Prioridad / Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500">Prioridad</p>
              <p className="capitalize">{task.priority}</p>
            </div>

            <div>
              <p className="text-gray-500">Estado</p>
              <div className="flex gap-2 mt-1">
                {["pendiente", "en_progreso", "completada"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`px-3 py-1 rounded border ${
                      status === s
                        ? s === "pendiente"
                          ? "bg-blue-500 text-white"
                          : s === "en_progreso"
                          ? "bg-yellow-400 text-white"
                          : "bg-green-500 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {s.replace("_", " ").toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-gray-500">Inicio</p>
              <p>{task.start_date}</p>
            </div>
            <div>
              <p className="text-gray-500">Vencimiento</p>
              <p>{task.due_date || "-"} ({calculateDaysLeft(task.due_date)})</p>
            </div>
            <div>
              <p className="text-gray-500">Creado por</p>
              <p>{task.created_by?.username}</p>
            </div>
          </div>

          {/* Asignado */}
          <div>
            <p className="text-gray-500">Asignado a</p>
            <p>{task.assigned_to ? task.assigned_to.username : "Sin asignar"}</p>
          </div>

          {/* Comentarios */}
          <div className="mt-2">
            <p className="text-gray-500 mb-1">Comentarios</p>
            <div className="max-h-48 overflow-y-auto border rounded p-2 space-y-2">
              {comments.map((c) => (
                <div key={c.id} className="text-sm">
                  <p className="font-semibold">{c.user.username}</p>
                  <p>{c.message}</p>
                  <p className="text-xs text-gray-400">{c.created_at}</p>
                </div>
              ))}
              <div ref={commentsEndRef}></div>
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Agregar comentario..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddComment}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Enviar
              </button>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border py-2 rounded-lg hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveChanges}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

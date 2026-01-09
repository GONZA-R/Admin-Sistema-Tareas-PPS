import React, { useState, useEffect } from "react";
import api from "../services/api";

/* =======================
   HELPERS DE FECHA
======================= */
const parseLocalDate = (iso) => {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const formatDate = (value) => {
  if (!value) return "Sin fecha";
  try {
    const date = typeof value === "string" ? parseLocalDate(value) : value;
    return date.toLocaleDateString("es-AR");
  } catch {
    return value;
  }
};

const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parseLocalDate(dueDate) < today;
};

const calculateDaysLeft = (dueDate) => {
  if (!dueDate) return "N/A";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = parseLocalDate(dueDate) - today;
  const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? `${diffDays} día(s)` : "VENCIDA";
};

/* =======================
   COMPONENTE MODAL
======================= */
const TaskModal = ({ isOpen, onClose, task, onUpdate }) => {
  const [newStatus, setNewStatus] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  // 🔹 Cargar detalles de la tarea
  useEffect(() => {
    if (!task?.id) return;

    const fetchTaskDetails = async () => {
      try {
        const response = await api.get(`/tasks/${task.id}/`);
        const fullTask = response.data;
        setAttachments(fullTask.attachments || []);
        setNewStatus(fullTask.status);
        setLoaded(true);
      } catch (err) {
        console.error(err);
        showToast("Error al cargar detalles de la tarea", "error");
      }
    };

    fetchTaskDetails();
  }, [task?.id]);

  useEffect(() => {
    if (!isOpen) setLoaded(false);
  }, [isOpen]);

  if (!isOpen || !task) return null;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 🔹 Guardar cambios con actualización inmediata (optimistic)
  const handleSaveChanges = async () => {
    if (!task) return;

    setSaving(true);
    const oldStatus = task.status;

    // Actualización inmediata para que se vea fluido
    onUpdate({ ...task, status: newStatus });
    showToast("Actualizando estado...");

    try {
      const token = localStorage.getItem("access");
      if (!token) throw new Error("No se encontró token");

      await api.patch(
        `/tasks/${task.id}/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("Estado actualizado correctamente", "success");
      onClose();
    } catch (error) {
      // Revertir cambio si falla
      onUpdate({ ...task, status: oldStatus });
      console.error(error);
      showToast("Error al actualizar estado", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Toast fuera del modal */}
      {toast && (
        <div
          className={`fixed top-5 right-5 px-5 py-3 rounded-lg shadow-lg text-white font-semibold z-[1050] ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 px-2">
        <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative">
          {/* Header */}
          <div className="flex justify-between items-center p-5 bg-orange-200 text-orange-900 rounded-t-3xl shadow-inner">
            <h2 className="text-2xl font-bold flex items-center gap-3 break-words">
              {task.title}
              {isOverdue(task.due_date) && (
                <span className="bg-red-200 text-red-800 text-xs px-3 py-1 rounded-full font-bold">
                  VENCIDA
                </span>
              )}
            </h2>
            <button
              onClick={onClose}
              className="text-orange-900 hover:text-orange-700 text-2xl font-bold z-[1010]"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-5 text-gray-700 break-words">
            <p className="text-gray-600">{task.description || "—"}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">Estado:</span>{" "}
                <span
                  className={`font-semibold ${
                    isOverdue(task.due_date)
                      ? "text-red-600"
                      : newStatus === "pendiente"
                      ? "text-orange-500"
                      : newStatus === "en_progreso"
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {isOverdue(task.due_date) ? "VENCIDA" : newStatus.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="font-semibold">Prioridad:</span>{" "}
                <span
                  className={`font-semibold ${
                    task.priority === "alta"
                      ? "text-red-500"
                      : task.priority === "media"
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {task.priority}
                </span>
              </div>
              <div>
                <span className="font-semibold">Vence:</span>{" "}
                {formatDate(task.due_date)} ({calculateDaysLeft(task.due_date)})
              </div>
              <div>
                <span className="font-semibold">Creado por:</span>{" "}
                {task.created_by?.username || "Desconocido"}
              </div>
              <div>
                <span className="font-semibold">Asignado a:</span>{" "}
                {task.assigned_to?.username || "Sin asignar"}
              </div>
            </div>

            {/* Archivos adjuntos */}
            <div>
              <span className="font-semibold text-gray-800">Archivos adjuntos:</span>
              {attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {attachments.map((a) => (
                    <a
                      key={a.id}
                      href={a.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-orange-50 hover:bg-orange-100 rounded-xl p-3 shadow-sm transition hover:shadow-md break-words"
                    >
                      <div className="flex items-center gap-2">
                        <span className="break-words">{a.file.split("/").pop()}</span>
                      </div>
                      <span className="text-gray-400 text-xs">
                        {a.uploaded_by?.username || "Desconocido"}
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic mt-1">No hay archivos adjuntos</p>
              )}
            </div>

            {/* Botones de cambio de estado */}
            <div className="flex flex-wrap gap-3 mt-4">
              {["pendiente", "en_progreso", "completada"].map((s) => (
                <button
                  key={s}
                  onClick={() => setNewStatus(s)}
                  className={`flex-1 py-2 rounded-xl font-semibold transition text-center ${
                    newStatus === s
                      ? s === "pendiente"
                        ? "bg-orange-300 text-orange-900"
                        : s === "en_progreso"
                        ? "bg-yellow-300 text-yellow-900"
                        : "bg-green-300 text-green-900"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {s.replace("_", " ").toUpperCase()}
                </button>
              ))}
            </div>

            {/* Guardar/Cancelar */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="flex-1 bg-orange-300 text-orange-900 py-2 rounded-xl hover:bg-orange-400 transition font-semibold disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-300 transition font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskModal;

import React, { useState, useEffect } from "react";
import axios from "axios";

const calculateDaysLeft = (dueDate) => {
  if (!dueDate) return "N/A";
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? `${diffDays} día(s)` : "VENCIDA";
};

const formatDate = (d) => {
  if (!d) return "Sin fecha";
  try {
    return new Date(d).toLocaleDateString("es-AR");
  } catch {
    return d;
  }
};

const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

const TaskModal = ({ isOpen, onClose, task, onUpdate }) => {
  const [newStatus, setNewStatus] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!task?.id) return;

    const fetchTaskDetails = async () => {
      try {
        const token = localStorage.getItem("access");
        if (!token) throw new Error("No se encontró token");

        const response = await axios.get(
          `http://127.0.0.1:8000/api/tasks/${task.id}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const fullTask = response.data;
        setAttachments(fullTask.attachments || []);

        if (!loaded) {
          setNewStatus(fullTask.status);
          setLoaded(true);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchTaskDetails();
  }, [task?.id, loaded]);

  useEffect(() => {
    if (!isOpen) setLoaded(false);
  }, [isOpen]);

  if (!isOpen || !task) return null;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("access");
      if (!token) throw new Error("No se encontró token");

      const response = await axios.patch(
        `http://127.0.0.1:8000/api/tasks/${task.id}/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedTask = {
        ...task,
        status: response.data.status,
        attachments,
      };

      onUpdate(updatedTask);
      showToast("Estado actualizado correctamente", "success");
    } catch (error) {
      console.error(error);
      showToast("Error al actualizar estado", "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 px-2">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg flex flex-col max-h-[90vh] overflow-hidden">
        {toast && (
          <div
            className={`absolute top-4 right-4 px-4 py-2 rounded shadow-lg text-white font-semibold ${
              toast.type === "success" ? "bg-green-400" : "bg-red-400"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-orange-200 text-orange-800 rounded-t-2xl">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {task.title}
            {isOverdue(task.due_date) && (
              <span className="bg-red-200 text-red-800 text-xs px-2 py-1 rounded-full">
                VENCIDA
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-orange-800 hover:text-orange-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4 text-gray-700">
          <p>{task.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Estado:</span>{" "}
              <span
                className={
                  isOverdue(task.due_date)
                    ? "text-red-600 font-bold"
                    : newStatus === "pendiente"
                    ? "text-orange-500"
                    : newStatus === "en_progreso"
                    ? "text-yellow-500"
                    : "text-green-500"
                }
              >
                {isOverdue(task.due_date) ? "VENCIDA" : newStatus.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="font-semibold">Prioridad:</span>{" "}
              <span
                className={
                  task.priority === "alta"
                    ? "text-red-500"
                    : task.priority === "media"
                    ? "text-yellow-500"
                    : "text-green-500"
                }
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
            <span className="font-semibold">Archivos adjuntos:</span>
            {attachments.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {attachments.map((a) => (
                  <a
                    key={a.id}
                    href={a.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-orange-50 hover:bg-orange-100 rounded-lg p-2 text-sm text-orange-700 flex justify-between items-center"
                  >
                    <span>{a.file.split("/").pop()}</span>
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

          {/* Estado botones */}
          <div className="flex gap-2 mt-4">
            {["pendiente", "en_progreso", "completada"].map((s) => (
              <button
                key={s}
                onClick={() => setNewStatus(s)}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${
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
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSaveChanges}
              className="flex-1 bg-orange-300 text-orange-900 py-2 rounded-lg hover:bg-orange-400 transition"
            >
              Guardar cambios
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;

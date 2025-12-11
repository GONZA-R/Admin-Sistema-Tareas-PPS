import React, { useState, useEffect, useRef } from "react";

const calculateDaysLeft = (dueDate) => {
  if (!dueDate) return "N/A";
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? `${diffDays} día(s)` : "Vencida";
};

const formatDate = (d) => {
  if (!d) return "Sin fecha";
  try {
    return new Date(d).toLocaleDateString("es-AR");
  } catch {
    return d;
  }
};

const TaskModal = ({ isOpen, onClose, task, onUpdate }) => {
  const [newStatus, setNewStatus] = useState(task?.status || "");
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(task?.comments || []);
  const commentsEndRef = useRef(null);

  useEffect(() => {
    setNewStatus(task?.status || "");
    setComments(task?.comments || []);
  }, [task]);

  useEffect(() => {
    // Scroll al final de los comentarios
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  if (!isOpen || !task) return null;

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments([
      ...comments,
      {
        id: Date.now(),
        text: newComment,
        sender: "enviado",
        date: new Date().toLocaleString("es-AR"),
      },
    ]);
    setNewComment("");
  };

  const handleSaveChanges = () => {
    onUpdate({ ...task, status: newStatus, comments });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 px-2">
      <div className="bg-white w-full max-w-3xl rounded-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{task.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl font-bold">
            ×
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
          <p className="text-gray-600">{task.description}</p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-700">
            <div><span className="font-semibold">Estado:</span> {task.status}</div>
            <div>
              <span className="font-semibold">Prioridad:</span>{" "}
              <span
                className={
                  task.priority === "alta"
                    ? "text-red-600"
                    : task.priority === "media"
                    ? "text-yellow-600"
                    : "text-green-600"
                }
              >
                {task.priority}
              </span>
            </div>
            <div><span className="font-semibold">Vence:</span> {formatDate(task.dueDate)} ({calculateDaysLeft(task.dueDate)})</div>
            <div><span className="font-semibold">Asignado por:</span> {task.assignedBy}</div>
          </div>

          {task.files && task.files.length > 0 && (
            <div className="text-sm">
              <span className="font-semibold">Archivos:</span>
              <ul className="ml-4 list-disc text-gray-600">
                {task.files.map((f, i) => (<li key={i}>{f.name}</li>))}
              </ul>
            </div>
          )}

          {/* Cambiar estado */}
          <div className="flex gap-2">
            {["pendiente", "en_progreso", "completada"].map((s) => (
              <button
                key={s}
                onClick={() => setNewStatus(s)}
                className={`px-3 py-1 rounded border ${
                  newStatus === s ? (s === "pendiente" ? "bg-blue-500 text-white" : s === "en_progreso" ? "bg-yellow-400 text-white" : "bg-green-500 text-white") : "bg-gray-100"
                }`}
              >
                {s.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </div>

          {/* Seguimiento tipo chat */}
          <div className="flex-1 max-h-64 overflow-y-auto border-t border-b py-2">
            {comments.map((c) => (
              <div key={c.id} className={`mb-2 flex ${c.sender === "enviado" ? "justify-end" : "justify-start"}`}>
                <div className={`px-3 py-2 rounded-lg max-w-[70%] text-sm ${c.sender === "enviado" ? "bg-green-100 text-gray-800" : "bg-blue-100 text-gray-800"}`}>
                  {c.text}
                  <div className="text-xs text-gray-500 mt-1 text-right">{c.date}</div>
                </div>
              </div>
            ))}
            <div ref={commentsEndRef}></div>
          </div>

          {/* Agregar comentario */}
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

        {/* Guardar cambios siempre visible */}
        <div className="p-4 border-t">
          <button
            onClick={handleSaveChanges}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;

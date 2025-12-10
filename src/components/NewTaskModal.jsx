// src/components/NewTaskModal.jsx
import React, { useState } from "react";
import { X, Upload, Trash2 } from "lucide-react";

export default function NewTaskModal({ open, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("media");
  const [status, setStatus] = useState("por hacer");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [emailNotification, setEmailNotification] = useState(false);
  const [attachments, setAttachments] = useState([]);

  if (!open) return null;

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments = Array.from(files).map((file) => ({
      id: `${Date.now()}-${file.name}`,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
    }));

    setAttachments([...attachments, ...newAttachments]);
  };

  const handleRemoveAttachment = (id) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const newTask = {
      title,
      description,
      priority,
      status,
      dueDate,
      assignedTo,
      emailNotification,
      attachments,
    };
    if (onCreate) onCreate(newTask);
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 px-6 py-3 flex items-center justify-between z-10">
          <h2 className="text-gray-900 dark:text-gray-100 font-semibold text-lg">
            Nueva Tarea
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          {/* Título */}
          <div>
            <label className="block text-gray-700 dark:text-gray-200 mb-1">Título *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
              placeholder="Ej: Diseñar nueva interfaz"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-gray-700 dark:text-gray-200 mb-1">Descripción *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none dark:bg-gray-800 dark:text-gray-100"
              placeholder="Describe los detalles de la tarea..."
              required
            />
          </div>

          {/* Prioridad y Estado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-1">Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-1">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="por hacer">Por hacer</option>
                <option value="en progreso">En progreso</option>
                <option value="completada">Completada</option>
              </select>
            </div>
          </div>

          {/* Fecha de vencimiento y Asignado a */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-1">Vencimiento</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-1">Asignado a</label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                placeholder="Nombre del usuario"
              />
            </div>
          </div>

          {/* Archivos adjuntos */}
          <div>
            <label className="block text-gray-700 dark:text-gray-200 mb-1">Archivos adjuntos</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="flex flex-col items-center gap-1 cursor-pointer">
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300 text-sm">Haz clic o arrastra archivos</span>
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1 truncate text-sm">{file.name}</div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(file.id)}
                      className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notificación por correo */}
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-200 text-sm">Notificación por correo</span>
            <button
              type="button"
              onClick={() => setEmailNotification(!emailNotification)}
              className={`w-12 h-6 flex items-center rounded-full px-1 transition ${
                emailNotification ? "bg-indigo-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition ${
                  emailNotification ? "translate-x-6" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-colors"
            >
              Crear Tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

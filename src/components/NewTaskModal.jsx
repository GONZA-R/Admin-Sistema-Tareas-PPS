import React, { useState, useEffect } from "react";
import { X, Upload, Trash2 } from "lucide-react";
import api from "../services/api";

export default function NewTaskModal({ open, onClose, onCreate }) {

  /* =========================
     ESTADOS
  ========================= */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [priority, setPriority] = useState("Media");
  const [status, setStatus] = useState("Pendiente");

  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [assignedTo, setAssignedTo] = useState("");
  const [users, setUsers] = useState([]);

  const [attachments, setAttachments] = useState([]);

  /* =========================
     CARGAR USUARIOS (HOOK OK)
  ========================= */
  useEffect(() => {
    if (!open) return;

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await api.get("/users/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error cargando usuarios", err);
        setUsers([]);
      }
    };

    fetchUsers();
  }, [open]);

  /* =========================
     SALIDA CONTROLADA (OK)
  ========================= */
  if (!open) return null;

  /* =========================
     ARCHIVOS (VISUAL)
  ========================= */
  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files) return;

    const mapped = Array.from(files).map((file) => ({
      id: `${Date.now()}-${file.name}`,
      name: file.name,
    }));

    setAttachments((prev) => [...prev, ...mapped]);
  };

  const handleRemoveAttachment = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  /* =========================
     MAPEO DRF
  ========================= */
  const mapPriority = {
    Alta: "alta",
    Media: "media",
    Baja: "baja",
  };

  const mapStatus = {
    Pendiente: "pendiente",
    "En Progreso": "en_progreso",
    Completada: "completada",
  };

  /* =========================
     CREAR TAREA
  ========================= */
  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("access");

      const payload = {
        title,
        description,
        priority: mapPriority[priority],
        status: mapStatus[status],
        start_date: startDate,
        due_date: dueDate || null,
        assigned_to: assignedTo ? Number(assignedTo) : null,
      };

      const res = await api.post("/tasks/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onCreate?.(res.data);
      onClose();

      // reset
      setTitle("");
      setDescription("");
      setPriority("Media");
      setStatus("Pendiente");
      setStartDate("");
      setDueDate("");
      setAssignedTo("");
      setAttachments([]);
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Error al crear la tarea");
    }
  };

  /* =========================
     UI MODERNA
  ========================= */
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-xl shadow-2xl overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50 dark:bg-gray-800">
          <h2 className="text-lg font-semibold">Nueva Tarea</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleCreate} className="p-6 space-y-4">

          <input
            placeholder="Título *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          <textarea
            placeholder="Descripción *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option>Alta</option>
              <option>Media</option>
              <option>Baja</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option>Pendiente</option>
              <option>En Progreso</option>
              <option>Completada</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="px-4 py-2 border rounded-lg" />
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="px-4 py-2 border rounded-lg" />
          </div>

          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="px-4 py-2 border rounded-lg w-full"
          >
            <option value="">— Sin asignar —</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username} (ID {u.id})
              </option>
            ))}
          </select>

          {/* ADJUNTOS */}
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <Upload className="w-4 h-4" />
            Adjuntar archivos
            <input type="file" multiple hidden onChange={handleFileUpload} />
          </label>

          {attachments.map((a) => (
            <div key={a.id} className="flex justify-between text-sm">
              {a.name}
              <button type="button" onClick={() => handleRemoveAttachment(a.id)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 border py-2 rounded-lg">
              Cancelar
            </button>
            <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg">
              Crear Tarea
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

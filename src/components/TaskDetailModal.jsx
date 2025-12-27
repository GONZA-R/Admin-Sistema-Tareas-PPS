import { X, Paperclip, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function TaskDetailModal({ open, onClose, task, onUpdate }) {
  // =========================
  // STATE
  // =========================
  const [status, setStatus] = useState("pendiente");

  const [attachments, setAttachments] = useState([]);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [users, setUsers] = useState([]);
  const [enableDelegation, setEnableDelegation] = useState(false);
  const [delegatedTo, setDelegatedTo] = useState("");

  const [toast, setToast] = useState({ message: "", type: "" });

  // =========================
  // LOAD TASK DETAIL
  // =========================
  useEffect(() => {
    if (!task) return;

    const fetchTaskDetail = async () => {
      try {
        const token = localStorage.getItem("access");
        const role = localStorage.getItem("role");

        const res = await api.get(`/tasks/${task.id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStatus(res.data.status || "pendiente");
        setAttachments(res.data.attachments || []);

        // precargar delegación
        setEnableDelegation(!!res.data.delegated_to);
        setDelegatedTo(res.data.delegated_to ? res.data.delegated_to.id : "");

        // cargar usuarios solo si es admin
        if (role === "admin") {
          const usersRes = await api.get("/users/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsers(usersRes.data || []);
        }
      } catch (err) {
        console.error("Error cargando detalle:", err);
      }
    };

    fetchTaskDetail();
  }, [task]);

  if (!open || !task) return null;

  // =========================
  // HELPERS
  // =========================
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3500);
  };

  const role = localStorage.getItem("role");

  // ✅ REGLA CORRECTA: admin → admin
  const canDelegate =
    role === "admin" &&
    task.assigned_to &&
    task.assigned_to.role === "admin";

  // =========================
  // UPLOAD FILES
  // =========================
  const handleUploadFiles = async () => {
    if (filesToUpload.length === 0) return;

    try {
      setUploading(true);
      const token = localStorage.getItem("access");

      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append("task", task.id);
        formData.append("file", file);

        await api.post("/attachments/", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      const res = await api.get(`/tasks/${task.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAttachments(res.data.attachments || []);
      setFilesToUpload([]);
      showToast("Archivos subidos correctamente");
    } catch (err) {
      console.error("Error subiendo archivo:", err);
      showToast("Error al subir archivo", "error");
    } finally {
      setUploading(false);
    }
  };

  // =========================
  // DELETE ATTACHMENT
  // =========================
  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm("¿Eliminar este archivo?")) return;

    try {
      const token = localStorage.getItem("access");

      await api.delete(`/attachments/${attachmentId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
      showToast("Archivo eliminado");
    } catch (err) {
      console.error("Error eliminando archivo:", err);
      showToast("No se pudo eliminar el archivo", "error");
    }
  };

  // =========================
  // SAVE CHANGES
  // =========================
  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("access");

      const payload = { status };

      if (enableDelegation && delegatedTo) {
        payload.delegated_to_id = delegatedTo;
      }

      const res = await api.patch(`/tasks/${task.id}/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onUpdate(res.data);
      showToast("Cambios guardados correctamente");
      onClose();
    } catch (err) {
      console.error("Error guardando cambios:", err.response?.data || err);
      showToast("Error al guardar cambios", "error");
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold">{task.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-5 flex-1 text-sm overflow-y-auto">

          {/* DESCRIPTION */}
          <div>
            <p className="text-gray-500">Descripción</p>
            <p>{task.description}</p>
          </div>

          {/* PRIORITY / STATUS */}
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
                    className={`px-3 py-1 rounded border transition ${
                      status === s
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {s.replace("_", " ").toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DATES */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-gray-500">Inicio</p>
              <p>{task.start_date}</p>
            </div>
            <div>
              <p className="text-gray-500">Vencimiento</p>
              <p>{task.due_date}</p>
            </div>
            <div>
              <p className="text-gray-500">Asignada a</p>
              <p>{task.assigned_to?.username || "-"}</p>
            </div>
          </div>

          {/* DELEGACIÓN */}
          {canDelegate && (
            <div className="border rounded-lg p-4 bg-orange-50">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableDelegation}
                  onChange={(e) => setEnableDelegation(e.target.checked)}
                  className="accent-orange-500"
                />
                <span className="font-medium text-orange-700">
                  Delegar tarea
                </span>
              </label>

              {enableDelegation && (
                <select
                  value={delegatedTo}
                  onChange={(e) => setDelegatedTo(Number(e.target.value))}
                  className="mt-3 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">Seleccionar usuario</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* ATTACHMENTS */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <Paperclip size={16} />
              <p className="font-medium">Archivos adjuntos</p>
            </div>

            {attachments.length > 0 ? (
              <ul className="space-y-1 mb-3">
                {attachments.map((a) => (
                  <li key={a.id} className="flex justify-between text-sm">
                    <a
                      href={a.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      {a.file.split("/").pop()}
                    </a>
                    <button
                      onClick={() => handleDeleteAttachment(a.id)}
                      className="text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm mb-3">
                No hay archivos adjuntos
              </p>
            )}

            <div className="flex gap-2">
              <input
                type="file"
                multiple
                onChange={(e) => setFilesToUpload([...e.target.files])}
              />
              <button
                onClick={handleUploadFiles}
                disabled={uploading || filesToUpload.length === 0}
                className="px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-50"
              >
                <Upload size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t flex gap-2">
          <button onClick={onClose} className="flex-1 border py-2 rounded-lg">
            Cancelar
          </button>
          <button
            onClick={handleSaveChanges}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg"
          >
            Guardar cambios
          </button>
        </div>

        {/* TOAST */}
        {toast.message && (
          <div
            className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white
              ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}
            `}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}

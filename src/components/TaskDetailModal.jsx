import { X, Paperclip, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../services/api";

export default function TaskDetailModal({ open, onClose, task, onUpdate }) {
  const [status, setStatus] = useState("pendiente");
  const [users, setUsers] = useState([]);
  const [enableDelegation, setEnableDelegation] = useState(false);
  const [delegatedTo, setDelegatedTo] = useState("");
  const [toast, setToast] = useState({ message: "", type: "" });


  const [attachments, setAttachments] = useState([]);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [uploading, setUploading] = useState(false);

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    if (!task) return;

    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await api.get(`/tasks/${task.id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStatus(res.data.status || "pendiente");
        setAttachments(res.data.attachments || []);
        setEnableDelegation(false);
        setDelegatedTo("");
      } catch (err) {
        console.error(err);
      }
    };

    fetchDetail();
  }, [task]);

  if (!open || !task) return null;

  // =========================
  // UPLOAD FILES
  // =========================
  const handleUploadFiles = async () => {
    if (filesToUpload.length === 0) return;

    try {
      setUploading(true);
      const token = localStorage.getItem("access");

      for (let file of filesToUpload) {
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

  if (err.response?.data?.file) {
    showToast(err.response.data.file[0], "error");
  } else {
    showToast("Error al subir el archivo", "error");
  }
} finally {
  setUploading(false);
}

  };

  const handleDeleteAttachment = async (attachmentId) => {
  if (!window.confirm("¿Eliminar este archivo?")) return;

  try {
    const token = localStorage.getItem("access");

    await api.delete(`/attachments/${attachmentId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Actualiza la lista sin recargar todo
    setAttachments((prev) =>
      prev.filter((a) => a.id !== attachmentId)
    );

    showToast("Archivo eliminado");
  } catch (err) {
    console.error("Error eliminando archivo:", err);
  }
};


  const showToast = (message, type = "success") => {
  setToast({ message, type });
  setTimeout(() => setToast({ message: "", type: "" }), 3500);
};


  // =========================
  // SAVE
  // =========================
  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("access");

      const resTask = await api.patch(
        `/tasks/${task.id}/`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onUpdate(resTask.data || { ...task, status });
      showToast("Cambios guardados correctamente");
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold">{task.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-5 flex-1 text-sm">

          <div>
            <p className="text-gray-500">Descripción</p>
            <p>{task.description}</p>
          </div>

          {/* PRIORIDAD / ESTADO */}
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

          {/* FECHAS */}
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
              <p className="text-gray-500">Creado por</p>
              <p>{task.created_by?.username}</p>
            </div>
          </div>

          {/* ===== ARCHIVOS ADJUNTOS ===== */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <Paperclip size={16} className="text-gray-500" />
              <p className="font-medium text-gray-700">Archivos adjuntos</p>
            </div>

            {attachments.length > 0 ? (
              <ul className="space-y-1 mb-3">
                {attachments.map((a) => (
  <li
    key={a.id}
    className="flex items-center justify-between text-sm"
  >
    <div className="flex items-center gap-2">
      <Paperclip size={14} className="text-indigo-500" />
      <a
        href={a.file}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-600 hover:underline"
      >
        {a.file.split("/").pop()}
      </a>
    </div>

    {/* BOTÓN ELIMINAR */}
    <button
      onClick={() => handleDeleteAttachment(a.id)}
      className="text-red-500 hover:text-red-700"
      title="Eliminar archivo"
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

            <div className="flex items-center gap-2">
              <input
                type="file"
                multiple
                className="text-sm"
                onChange={(e) => setFilesToUpload([...e.target.files])}
              />

              <button
                onClick={handleUploadFiles}
                disabled={uploading || filesToUpload.length === 0}
                className="flex items-center gap-1 px-3 py-1 rounded bg-indigo-600 text-white text-sm disabled:opacity-50"
              >
                <Upload size={14} />
                {uploading ? "Subiendo..." : "Subir"}
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

        {toast.message && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white transition
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

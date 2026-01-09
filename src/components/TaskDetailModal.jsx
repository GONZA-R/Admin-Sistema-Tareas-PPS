import { X, Paperclip, Upload, Info } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../services/api";
import ConfirmModal from "../components/ConfirmModal";

// 🔹 Formatea DateField (YYYY-MM-DD) sin restar un día
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

// 🔹 Formatea DateTimeField a DD/MM/YYYY HH:MM:SS en zona horaria Argentina
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return "-";
  const d = new Date(dateTimeStr);
  return d.toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// 🔹 Calcula días para vencer de forma confiable
const calculateDueInDays = (dueDateStr) => {
  if (!dueDateStr) return Infinity;

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = today.getMonth() + 1;
  const dd = today.getDate();

  const todayStr = `${yyyy}-${mm.toString().padStart(2, "0")}-${dd.toString().padStart(2, "0")}`;
  const [dueYear, dueMonth, dueDay] = dueDateStr.split("-").map(Number);
  const [todayYear, todayMonth, todayDay] = todayStr.split("-").map(Number);

  const dueDate = new Date(dueYear, dueMonth - 1, dueDay);
  const todayDate = new Date(todayYear, todayMonth - 1, todayDay);

  const diffMs = dueDate.getTime() - todayDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

export default function TaskDetailModal({ open, onClose, task, onUpdate }) {
  const [status, setStatus] = useState("pendiente");
  const [attachments, setAttachments] = useState([]);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [users, setUsers] = useState([]);
  const [enableDelegation, setEnableDelegation] = useState(false);
  const [delegatedTo, setDelegatedTo] = useState("");
  const [toast, setToast] = useState({ message: "", type: "" });
  const [saving, setSaving] = useState(false);

  // 🔹 ConfirmModal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState(null);

  // 🔹 Modal info archivos
  const [infoOpen, setInfoOpen] = useState(false);

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
        setEnableDelegation(!!res.data.delegated_to);
        setDelegatedTo(res.data.delegated_to ? res.data.delegated_to.id : "");

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

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3500);
  };

  const role = localStorage.getItem("role");
  const canDelegate = role === "admin" && task.assigned_to?.role === "admin";

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

  const confirmDeleteAttachment = async () => {
    if (!attachmentToDelete) return;

    try {
      const token = localStorage.getItem("access");
      await api.delete(`/attachments/${attachmentToDelete}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAttachments((prev) =>
        prev.filter((a) => a.id !== attachmentToDelete)
      );
      showToast("Archivo eliminado");
    } catch (err) {
      console.error("Error eliminando archivo:", err);
      showToast("No se pudo eliminar el archivo", "error");
    } finally {
      setConfirmOpen(false);
      setAttachmentToDelete(null);
    }
  };

  const handleSaveChanges = async () => {
    if (!task) return;
    setSaving(true);

    const oldStatus = task.status;
    onUpdate({ ...task, status });
    showToast("Actualizando estado...");

    try {
      const token = localStorage.getItem("access");
      const payload = { status };

      if (enableDelegation && delegatedTo) {
        payload.delegated_to_id = delegatedTo;
      }

      await api.patch(`/tasks/${task.id}/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showToast("Cambios guardados correctamente");
      onClose();
    } catch (err) {
      onUpdate({ ...task, status: oldStatus });
      console.error("Error guardando cambios:", err.response?.data || err);
      showToast("Error al guardar cambios", "error");
    } finally {
      setSaving(false);
    }
  };

  // 🔹 Info archivos permitidos
  const ALLOWED_FILES_INFO = "Tipos permitidos: .pdf, .txt, .doc, .docx, .odt, .xls, .xlsx, .ods, .csv, .ppt, .pptx, .odp, .jpg, .jpeg, .png, .bmp, .gif, .zip, .rar, .7z. Tamaño máximo: 20 MB";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2">
      <div className="bg-white w-full max-w-md sm:max-w-2xl md:max-w-3xl max-h-[85vh] rounded-2xl shadow-xl flex flex-col overflow-hidden border border-orange-200">

        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-orange-50">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
            {task.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-3 sm:p-4 flex-1 overflow-y-auto space-y-3 text-sm">

          {/* DESCRIPTION */}
          <div className="bg-orange-50 p-2 rounded-xl shadow-sm">
            <p className="text-gray-500 font-medium mb-1">Descripción</p>
            <p className="text-gray-800 font-semibold">{task.description}</p>
          </div>

          {/* PRIORITY / STATUS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <p className="text-gray-500 font-medium mb-1">Prioridad</p>
              <p className="capitalize">{task.priority}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium mb-1">Estado</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {["pendiente", "en_progreso", "completada"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`px-2 py-1 rounded-2xl font-medium text-xs sm:text-sm transition ${
                      status === s
                        ? "bg-orange-500 text-white shadow"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {s.replace("_", " ").toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DATES / ASIGNADO / CREADOR */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs sm:text-sm">
            <div>
              <p className="text-gray-500 font-medium mb-1">Inicio</p>
              <p className="text-gray-700">{formatDate(task.start_date)}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium mb-1">Vencimiento</p>
              <p className="text-gray-700">
                {formatDate(task.due_date)}{" "}
                <span
                  className={`text-xs font-medium ${
                    calculateDueInDays(task.due_date) <= 0 ? "text-red-600" : "text-gray-400"
                  }`}
                >
                  ({calculateDueInDays(task.due_date)} {calculateDueInDays(task.due_date) === 1 ? "día" : "días"} para vencer)
                </span>
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium mb-1">Asignada a</p>
              <p className="text-gray-700">
                {task.assigned_to?.username || "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium mb-1">Creada por</p>
              <p className="text-gray-700">
                {task.created_by?.username || "-"} <br />
                <span className="text-xs text-gray-400">
                  {formatDateTime(task.created_at)}
                </span>
              </p>
            </div>
          </div>

          {/* DELEGACIÓN */}
          {canDelegate && (
            <div className="border rounded-2xl p-2 bg-orange-50">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
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
                  className="mt-2 w-full border rounded-2xl px-2 py-1 text-sm focus:ring-1 focus:ring-orange-400 outline-none"
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
          <div className="border rounded-2xl p-2 bg-gray-50 text-sm relative">
            <div className="flex items-center gap-2 mb-2">
              <Paperclip size={14} />
              <p className="font-medium text-gray-700">Archivos adjuntos</p>
              <button
                onClick={() => setInfoOpen(true)}
                className="ml-1 text-gray-400 hover:text-gray-600 transition"
              >
                <Info size={14} />
              </button>
            </div>

            {/* Info modal */}
            {infoOpen && (
              <div
                className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
                onClick={() => setInfoOpen(false)}
              >
                <div
                  className="bg-white rounded-2xl p-4 max-w-xs w-11/12 shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-sm text-gray-700">{ALLOWED_FILES_INFO}</p>
                  <button
                    className="mt-3 w-full bg-orange-500 text-white py-2 rounded-xl font-medium hover:bg-orange-600"
                    onClick={() => setInfoOpen(false)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}

            {attachments.length > 0 ? (
              <ul className="space-y-1 mb-3 max-h-36 overflow-y-auto">
                {attachments.map((a) => (
                  <li
                    key={a.id}
                    className="flex justify-between items-center text-xs sm:text-sm"
                  >
                    <a
                      href={a.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline truncate max-w-[180px]"
                    >
                      {a.file.split("/").pop()}
                    </a>
                    <button
                      onClick={() => {
                        setAttachmentToDelete(a.id);
                        setConfirmOpen(true);
                      }}
                      className="text-red-500 hover:text-red-700"
                      title="Eliminar archivo"
                    >
                      <X size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-xs mb-3">
                No hay archivos adjuntos
              </p>
            )}

            {/* SELECCIÓN DE ARCHIVOS */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-indigo-600 font-medium">
                <Upload size={14} />
                Seleccionar archivos
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setFilesToUpload(Array.from(e.target.files))
                  }
                  className="hidden"
                />
              </label>

              {filesToUpload.length > 0 && (
                <div className="bg-white border rounded-xl p-2">
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Archivos a subir:
                  </p>
                  <ul className="space-y-1 text-xs">
                    {filesToUpload.map((file, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <span className="truncate max-w-[180px]">
                          {file.name}
                        </span>
                        <button
                          onClick={() =>
                            setFilesToUpload((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                          className="text-red-400 hover:text-red-600"
                          title="Quitar archivo"
                        >
                          <X size={12} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={handleUploadFiles}
                disabled={uploading || filesToUpload.length === 0}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-2xl text-xs font-medium disabled:opacity-50"
              >
                <Upload size={14} />
                {uploading
                  ? "Subiendo archivos..."
                  : `Subir ${filesToUpload.length || ""} archivo(s)`}
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-2 sm:p-3 border-t flex flex-col sm:flex-row gap-1 sm:gap-2 text-sm">
          <button
            onClick={onClose}
            className="flex-1 border py-2 rounded-2xl hover:bg-gray-100 transition font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="flex-1 bg-orange-500 text-white py-2 rounded-2xl hover:bg-orange-600 transition font-semibold"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>

        {/* TOAST */}
        {toast.message && (
          <div
            className={`fixed bottom-4 right-4 px-4 py-2 rounded-2xl text-white shadow-md ${
              toast.type === "error" ? "bg-red-500" : "bg-green-500"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* CONFIRM MODAL */}
        <ConfirmModal
          open={confirmOpen}
          title="Eliminar archivo"
          message="¿Estás seguro de que querés eliminar este archivo?"
          onConfirm={confirmDeleteAttachment}
          onCancel={() => {
            setConfirmOpen(false);
            setAttachmentToDelete(null);
          }}
        />
      </div>
    </div>
  );
}

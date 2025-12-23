import { X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import api from "../services/api";

const calculateDaysLeft = (dueDate) => {
  if (!dueDate) return "N/A";
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? `${diffDays} día(s)` : "Vencida";
};

export default function TaskDetailModal({ open, onClose, task, onUpdate }) {
  const [status, setStatus] = useState("");
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);

  const [enableDelegation, setEnableDelegation] = useState(false);
  const [delegatedTo, setDelegatedTo] = useState("");

  const commentsEndRef = useRef(null);

  const loggedUser = JSON.parse(localStorage.getItem("user"));

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    if (!task) return;

    setStatus(task.status);
    setComments(task.comments || []);
    setEnableDelegation(false);
    setDelegatedTo("");
  }, [task]);

  // =========================
  // AUTOSCROLL COMMENTS
  // =========================
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  // =========================
  // ¿PUEDE DELEGAR?
  // =========================
  const canDelegate =
    loggedUser?.is_staff &&
    task?.assigned_to?.id === loggedUser.id &&        // me asignaron la tarea
    task?.created_by?.id !== loggedUser.id &&         // no la creé yo
    task?.created_by?.is_staff === true;              // viene de otro admin

  // =========================
  // LOAD EMPLOYEES
  // =========================
  useEffect(() => {
    if (!canDelegate || !enableDelegation) return;

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await api.get("/users/under-my-charge/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Error cargando usuarios:", err);
      }
    };

    fetchUsers();
  }, [canDelegate, enableDelegation]);

  if (!open || !task) return null;

  // =========================
  // ADD COMMENT
  // =========================
  const handleAddComment = () => {
    if (!newComment.trim()) return;

    setComments([
      ...comments,
      {
        id: `temp-${Date.now()}`,
        message: newComment,
        user: { username: "Tú" },
        created_at: new Date().toLocaleString(),
        isNew: true,
      },
    ]);

    setNewComment("");
  };

  // =========================
  // SAVE
  // =========================
  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("access");

      // 🔹 Delegar
      if (canDelegate && enableDelegation && delegatedTo) {
        await api.post(
          `/tasks/${task.id}/delegate/`,
          { delegated_to_id: delegatedTo },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // 🔹 Estado
      const resTask = await api.patch(
        `/tasks/${task.id}/`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 🔹 Comentarios nuevos
      for (const c of comments.filter((c) => c.isNew)) {
        await api.post(
          `/comments/`,
          { task: task.id, message: c.message },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      onUpdate({ ...resTask.data, comments });
      onClose();
    } catch (err) {
      console.error("Error al guardar cambios:", err);
      alert("No se pudieron guardar los cambios.");
    }
  };

  // =========================
  // UI
  // =========================
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
                    className={`px-3 py-1 rounded border ${
                      status === s
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100"
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
              <p>
                {task.due_date} ({calculateDaysLeft(task.due_date)})
              </p>
            </div>
            <div>
              <p className="text-gray-500">Creado por</p>
              <p>{task.created_by?.username}</p>
            </div>
          </div>

          {/* ASIGNADO */}
          <div>
            <p className="text-gray-500">Asignado a</p>
            <p>{task.assigned_to?.username || "Sin asignar"}</p>
          </div>

          {/* DELEGADA POR (solo empleado) */}
          {!loggedUser?.is_staff && task.delegated_by && (
            <div className="text-sm text-gray-600">
              <b>Delegada por:</b> {task.delegated_by.username}
            </div>
          )}

          {/* 🔹 DELEGACIÓN */}
          {canDelegate && (
            <div className="border rounded-lg p-3 space-y-2 bg-gray-50">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={enableDelegation}
                  onChange={(e) => setEnableDelegation(e.target.checked)}
                />
                <span>Delegar esta tarea a un empleado</span>
              </label>

              {enableDelegation && (
                <select
                  value={delegatedTo}
                  onChange={(e) => setDelegatedTo(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Seleccionar empleado</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* COMENTARIOS */}
          <div>
            <p className="text-gray-500 mb-1">Comentarios</p>
            <div className="max-h-48 overflow-y-auto border rounded p-2 space-y-2">
              {comments.map((c) => (
                <div key={c.id}>
                  <p className="font-semibold">{c.user.username}</p>
                  <p>{c.message}</p>
                  <p className="text-xs text-gray-400">{c.created_at}</p>
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>

            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Agregar comentario..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2"
              />
              <button
                onClick={handleAddComment}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Enviar
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
      </div>
    </div>
  );
}

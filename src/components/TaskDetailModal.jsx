import { X } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../services/api";

export default function TaskDetailModal({ open, onClose, task, onUpdate }) {
  const [status, setStatus] = useState("pendiente");
  const [users, setUsers] = useState([]);
  const [enableDelegation, setEnableDelegation] = useState(false);
  const [delegatedTo, setDelegatedTo] = useState("");
  const [toast, setToast] = useState(""); // Mensaje de notificación



  // =========================
  // INIT
  // =========================
  useEffect(() => {
    if (!task) return;

    setStatus(task.status || "pendiente"); // por defecto pendiente
    setEnableDelegation(false);
    setDelegatedTo("");
  }, [task]);

  // =========================
  // ¿PUEDE DELEGAR? (admin → admin)
  // =========================
  const canDelegate =
    task?.created_by?.role === "admin" &&
    task?.assigned_to?.role === "admin" &&
    task.created_by.id !== task.assigned_to.id;

  // =========================
  // LOAD USERS
  // =========================
  useEffect(() => {
    if (!canDelegate || !enableDelegation) return;

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await api.get("/users/", {
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
  // SAVE CHANGES
  // =========================
  


  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("access");

      // 🔹 Delegar
      if (canDelegate && enableDelegation && delegatedTo) {
        await api.patch(
          `/tasks/${task.id}/`,
          { delegated_to_id: parseInt(delegatedTo) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // 🔹 Estado
      const resTask = await api.patch(
        `/tasks/${task.id}/`,
        { status: status || "pendiente" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onUpdate(resTask.data || { ...task, status });
      showToast("Cambios guardados correctamente");

      onClose();
    } catch (err) {
      console.error("Error al guardar cambios:", err);
      // ❌ NO alert para que no aparezca falso error
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
        <div className="p-6 space-y-4 flex-1 text-sm">

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
                      status === s ? "bg-indigo-600 text-white" : "bg-gray-100"
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

          {/* ASIGNADO Y OPCIÓN DE DELEGAR */}
          <div>
            <p className="text-gray-500">Asignado a</p>
            <p>{task.assigned_to?.username || "Sin asignar"}</p>

            {canDelegate && (
              <div className="mt-2 border p-2 rounded bg-gray-50">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableDelegation}
                    onChange={(e) => setEnableDelegation(e.target.checked)}
                  />
                  Delegar esta tarea a un empleado
                </label>

                {enableDelegation && (
                  <select
                    value={delegatedTo}
                    onChange={(e) => setDelegatedTo(e.target.value)}
                    className="mt-1 w-full border rounded px-2 py-1"
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
      {toast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          {toast}
        </div>
      )}
      </div>
      

    </div>
  );
}

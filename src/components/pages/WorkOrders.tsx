import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

/* TYPES */
interface WorkOrder {
  _id: string;
  title: string;
  asset: string;
  status: "Open" | "In Progress" | "Completed";
  assignedTo: string;
  dueDate: string;
  notes?: string;
}

export default function WorkOrders() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedOrder, setSelectedOrder] =
    useState<WorkOrder | null>(null);

  /*FETCH WORK ORDERS */
  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/work-orders`);
        if (!res.ok) throw new Error();
        const data: WorkOrder[] = await res.json();
        setWorkOrders(data);
      } catch {
        console.warn("Work orders API not available yet");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrders();
  }, []);

  /* ADMIN: CREATE WORK ORDER */
  const handleCreate = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch(`${BASE_URL}/api/work-orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          asset: formData.get("asset"),
          assignedTo: formData.get("assignedTo"),
          dueDate: formData.get("dueDate"),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create work order");
        return;
      }

      setWorkOrders((prev) => [data, ...prev]);
      setShowCreateForm(false);
      form.reset();
    } catch {
      alert("Server error while creating work order");
    }
  };

  /* USER: UPDATE STATUS */
  const handleUpdate = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch(
        `${BASE_URL}/api/work-orders/${selectedOrder._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: formData.get("status"),
            notes: formData.get("notes"),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update work order");
        return;
      }

      setWorkOrders((prev) =>
        prev.map((wo) => (wo._id === data._id ? data : wo))
      );

      setSelectedOrder(null);
    } catch {
      alert("Server error while updating work order");
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-500">
        Loading work orders…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Work Orders
          </h1>
          <p className="text-sm text-gray-500">
            Track and execute maintenance work
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Create Work Order
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="rounded-lg bg-white border overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-500">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500">
                Asset
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500">
                Due Date
              </th>
              {isUser && (
                <th className="px-6 py-3 text-right text-xs text-gray-500">
                  Action
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y">
            {workOrders.map((order) => (
              <tr key={order._id}>
                <td className="px-6 py-4 text-sm font-medium">
                  {order.title}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {order.asset}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      order.status === "Open"
                        ? "bg-red-100 text-red-700"
                        : order.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {order.assignedTo}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {order.dueDate}
                </td>

                {isUser && (
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Update
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* USER UPDATE MODAL */}
      {selectedOrder && isUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-medium">
              Update Work Order
            </h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <select
                name="status"
                defaultValue={selectedOrder.status}
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option>Open</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>

              <textarea
                name="notes"
                required
                placeholder="Execution notes"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-md border px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN CREATE MODAL */}
      {isAdmin && showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-medium">
              Create Work Order
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <input
                name="title"
                required
                placeholder="Work order title"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />

              <input
                name="asset"
                required
                placeholder="Asset"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />

              <input
                name="assignedTo"
                required
                placeholder="Assigned team"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />

              <input
                name="dueDate"
                type="date"
                required
                className="w-full rounded-md border px-3 py-2 text-sm"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-md border px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

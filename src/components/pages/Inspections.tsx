import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

/* TYPES */
interface Inspection {
  _id: string;
  name: string;
  asset: string;
  status: "Scheduled" | "Completed" | "Action Required";
  inspector: string;
  dueDate: string;
  remarks?: string;
}

export default function Inspections() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";

  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedInspection, setSelectedInspection] =
    useState<Inspection | null>(null);

  /* FETCH INSPECTIONS */
  useEffect(() => {
    const fetchInspections = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/inspections`);
        if (!res.ok) throw new Error();
        const data: Inspection[] = await res.json();
        setInspections(data);
      } catch {
        console.warn("Inspections API not available yet");
      } finally {
        setLoading(false);
      }
    };

    fetchInspections();
  }, []);

  /* ADMIN: SCHEDULE INSPECTION */
  const handleScheduleInspection = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch(`${BASE_URL}/api/inspections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          asset: formData.get("asset"),
          inspector: formData.get("inspector"),
          dueDate: formData.get("dueDate"),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to schedule inspection");
        return;
      }

      setInspections((prev) => [data, ...prev]);
      setShowScheduleModal(false);
      form.reset();
    } catch {
      alert("Server error while scheduling inspection");
    }
  };

  /* USER: SUBMIT INSPECTION */
  const handleSubmitInspection = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!selectedInspection) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch(
        `${BASE_URL}/api/inspections/${selectedInspection._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            remarks: formData.get("remarks"),
            hasIssue: formData.get("hasIssue") === "on",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to submit inspection");
        return;
      }

      setInspections((prev) =>
        prev.map((i) => (i._id === data._id ? data : i))
      );

      setSelectedInspection(null);
    } catch {
      alert("Server error while submitting inspection");
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-500">
        Loading inspections…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Inspections
          </h1>
          <p className="text-sm text-gray-500">
            Schedule inspections and track compliance
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowScheduleModal(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Schedule Inspection
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="rounded-lg bg-white border overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-500">
                Inspection
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500">
                Asset
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500">
                Inspector
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500">
                Due Date
              </th>
              <th className="px-6 py-3 text-right text-xs text-gray-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {inspections.map((inspection) => (
              <tr key={inspection._id}>
                <td className="px-6 py-4 text-sm font-medium">
                  {inspection.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {inspection.asset}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      inspection.status === "Scheduled"
                        ? "bg-blue-100 text-blue-700"
                        : inspection.status === "Action Required"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {inspection.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {inspection.inspector}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {inspection.dueDate}
                </td>

                <td className="px-6 py-4 text-right">
                  {isUser &&
                    inspection.status === "Scheduled" && (
                      <button
                        onClick={() => setSelectedInspection(inspection)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Submit
                      </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* USER SUBMIT MODAL */}
      {selectedInspection && isUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-medium">
              Submit Inspection
            </h2>

            <form onSubmit={handleSubmitInspection} className="space-y-4">
              <textarea
                name="remarks"
                required
                placeholder="Inspection findings"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="hasIssue" />
                Issue found – follow-up required
              </label>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedInspection(null)}
                  className="rounded-md border px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN SCHEDULE MODAL */}
      {isAdmin && showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-medium">
              Schedule Inspection
            </h2>

            <form
              onSubmit={handleScheduleInspection}
              className="space-y-4"
            >
              <input
                name="name"
                required
                placeholder="Inspection name"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />

              <input
                name="asset"
                required
                placeholder="Asset"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />

              <input
                name="inspector"
                required
                placeholder="Inspector / Team"
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
                  onClick={() => setShowScheduleModal(false)}
                  className="rounded-md border px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

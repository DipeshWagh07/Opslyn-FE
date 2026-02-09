import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

/* TYPES */
interface Asset {
  _id: string;
  name: string;
  type: string;
  location: string;
  status: "Active" | "Under Maintenance" | "Retired";
}

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function Assets() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [assets, setAssets] = useState<Asset[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* FETCH ASSETS */
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/assets`);

        if (!res.ok) {
          throw new Error("Failed to fetch assets");
        }

        const data: Asset[] = await res.json();
        setAssets(data);
      } catch {
        setError("Failed to load assets");
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  /* ADMIN: CREATE ASSET */
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch(`${BASE_URL}/api/assets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          type: formData.get("type"),
          location: formData.get("location"),
          status: formData.get("status"),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create asset");
        return;
      }

      // update UI immediately
      setAssets((prev) => [data, ...prev]);
      setShowForm(false);
      form.reset();
    } catch {
      alert("Server error while creating asset");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Assets
          </h1>
          <p className="text-sm text-gray-500">
            Company assets managed by administrators
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Asset
          </button>
        )}
      </div>

      {/* READ ONLY NOTICE */}
      {!isAdmin && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
          You have read-only access to assets.
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="rounded-md bg-red-100 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="rounded-lg border bg-white overflow-x-auto">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">
            Loading assets…
          </div>
        ) : (
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                  Location
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {assets.map((asset) => (
                <tr key={asset._id}>
                  <td className="px-4 py-2 text-sm">
                    {asset.name}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {asset.type}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {asset.location}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {asset.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE ASSET MODAL */}
      {isAdmin && showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-medium">
              Create Asset
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                required
                placeholder="Asset Name"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />

              <select
                name="type"
                required
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="">Select Type</option>
                <option>Utility</option>
                <option>IT Equipment</option>
                <option>Safety</option>
                <option>Office Equipment</option>
              </select>

              <input
                name="location"
                required
                placeholder="Location"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />

              <select
                name="status"
                defaultValue="Active"
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option>Active</option>
                <option>Under Maintenance</option>
                <option>Retired</option>
              </select>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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

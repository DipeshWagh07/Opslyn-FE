import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5001";

interface DashboardData {
  totalAssets: number;
  openWorkOrders: number;
  inspectionsDue: number;
  completedThisMonth: number;
  workOrdersByStatus: {
    Open: number;
    "In Progress": number;
    Completed: number;
  };
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/dashboard`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        setData(json);
      } catch {
        console.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-gray-500">
        Loading dashboard…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-sm text-red-500">
        Dashboard unavailable
      </div>
    );
  }

  const stats = [
    { label: "Total Assets", value: data.totalAssets },
    { label: "Open Work Orders", value: data.openWorkOrders },
    { label: "Inspections Due", value: data.inspectionsDue },
    { label: "Completed This Month", value: data.completedThisMonth },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Real-time overview of operations
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg bg-white p-6 shadow-sm border"
          >
            <div className="text-sm text-gray-500">
              {stat.label}
            </div>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* WORK ORDER STATUS */}
      <div className="rounded-lg bg-white border">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">
            Work Orders Status
          </h2>
        </div>

        <table className="min-w-full divide-y">
          <tbody>
            {Object.entries(data.workOrdersByStatus).map(
              ([status, count]) => (
                <tr key={status}>
                  <td className="px-6 py-4 text-sm font-medium">
                    {status}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {count}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

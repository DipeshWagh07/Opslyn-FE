import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

export default function Users() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const url = isAdmin
          ? `${BASE_URL}/api/users`
          : `${BASE_URL}/api/users/me`;

        const res = await fetch(url, {
          headers: {
            "x-user-id": user?.id || "",
          },
        });

        if (!res.ok) throw new Error();

        const data = await res.json();

        setUsers(isAdmin ? data : [data]);
      } catch {
        alert("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchUsers();
  }, [isAdmin, user]);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading users…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500">
          {isAdmin
            ? "Manage users across the platform"
            : "Your account details"}
        </p>
      </div>

      <div className="rounded-lg bg-white border overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs text-gray-500">
                Role
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {users.map((u) => (
              <tr
                key={u._id}
                className={u._id === user?.id ? "bg-blue-50" : ""}
              >
                <td className="px-6 py-4 text-sm font-medium">
                  {u.name}
                  {u._id === user?.id && (
                    <span className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                      You
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {u.email}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      u.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

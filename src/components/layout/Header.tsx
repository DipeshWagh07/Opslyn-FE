import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <h1 className="text-lg font-semibold">Opslyn</h1>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 capitalize">
          {user?.name} ({user?.role})
        </span>

        <button
          onClick={logout}
          className="rounded-md bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", to: "/" },
  { label: "Assets", to: "/assets" },
  { label: "Work Orders", to: "/work-orders" },
  { label: "Inspections", to: "/inspections" },
  { label: "Users", to: "/users" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col">
      <div className="px-6 py-4 text-xl font-semibold border-b border-slate-800">
        Opslyn
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded-md px-4 py-2 text-sm font-medium ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

import { createContext, useState } from "react";

export type Role = "admin" | "user" | null;

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>(null);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

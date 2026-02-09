import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import AppLayout from "./components/layout/Applayout";
import Login from "./components/pages/Login";
import Dashboard from "./components/pages/Dashboard";
import Assets from "./components/pages/Assets";
import WorkOrders from "./components/pages/WorkOrders";
import Inspections from "./components/pages/Inspections";
import Users from "./components/pages/Users";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/work-orders" element={<WorkOrders />} />
          <Route path="/inspections" element={<Inspections />} />
          <Route path="/users" element={<Users />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;

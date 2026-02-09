import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Modal from "../ui/Modal";
import { useState } from "react";

export default function AppLayout() {
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <Outlet context={{ setModalContent }} />
        </main>
      </div>

      {/* GLOBAL MODAL */}
      <Modal open={!!modalContent} onClose={() => setModalContent(null)}>
        {modalContent}
      </Modal>
    </div>
  );
}

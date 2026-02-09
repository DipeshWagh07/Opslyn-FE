interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* modal content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

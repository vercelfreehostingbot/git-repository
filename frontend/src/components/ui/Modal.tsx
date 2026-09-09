import type { ReactNode } from "react";

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  // Whether clicking the dimmed backdrop closes the modal. Defaults to
  // true (safe for view-only modals like DetailModal/ConfirmDialog,
  // where there's no data to lose). Form modals (Create/Edit) should
  // pass false — an accidental outside-click shouldn't silently
  // discard everything the user just typed.
  closeOnBackdropClick?: boolean;
}

export function Modal({ children, onClose, closeOnBackdropClick = true }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4"
      onClick={closeOnBackdropClick ? onClose : undefined}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-fit">
        {children}
      </div>
    </div>
  );
}
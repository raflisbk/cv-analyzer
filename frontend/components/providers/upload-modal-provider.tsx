"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface UploadModalContextValue {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  openCount: number; // increments each open — used as key prop on UploadSection to reset state
}

const UploadModalContext = createContext<UploadModalContextValue | null>(null);

export function UploadModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);

  const openModal = () => {
    setIsOpen(true);
    setOpenCount((c) => c + 1);
  };

  const closeModal = () => setIsOpen(false);

  return (
    <UploadModalContext.Provider value={{ isOpen, openModal, closeModal, openCount }}>
      {children}
    </UploadModalContext.Provider>
  );
}

export function useUploadModal() {
  const ctx = useContext(UploadModalContext);
  if (!ctx) { throw new Error("useUploadModal must be used within UploadModalProvider"); }
  return ctx;
}

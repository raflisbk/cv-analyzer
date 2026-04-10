"use client";

import { useUploadModal } from "@/components/providers/upload-modal-provider";

export default function ProductCardCTA() {
  const { openModal } = useUploadModal();

  return (
    <button
      onClick={openModal}
      className="text-sm text-primary hover:underline transition-colors"
    >
      Analyze My CV →
    </button>
  );
}

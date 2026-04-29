import type { Metadata } from "next";
import { UploadWorkspaceContent } from "@/components/workspace-v2/upload-workspace-content";

export const metadata: Metadata = {
  title: "Upload CV — Path Karir",
  description: "Upload your CV for AI-powered analysis",
};

export default function UploadWorkspacePage() {
  return <UploadWorkspaceContent />;
}

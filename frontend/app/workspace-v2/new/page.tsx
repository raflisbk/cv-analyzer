import type { Metadata } from "next";
import { WorkspaceV2Shell } from "@/components/workspace-v2/shell";

export const metadata: Metadata = {
  title: "Upload CV — Path Karir",
  description: "Upload your CV for AI-powered analysis",
};

export default function UploadWorkspacePage() {
  return <WorkspaceV2Shell mode="upload" />;
}

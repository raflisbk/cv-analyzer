import type { Metadata } from "next";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

export const metadata: Metadata = {
  title: "Analisis CV | CV Analyzer",
};

export default function WorkspaceV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

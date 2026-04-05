"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

interface DocumentPreviewProps {
  file: File;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export function DocumentPreview({ file, onAnalyze, isAnalyzing }: DocumentPreviewProps) {
  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
  const fileType = file.name.endsWith(".pdf") ? "PDF" : "DOCX";

  return (
    <Card className="max-w-[600px] mx-auto p-6">
      <div className="flex items-start gap-4">
        {/* Thumbnail per UI-SPEC: 120px × 120px */}
        <div className="flex-shrink-0 w-[120px] h-[120px] border-2 border-slate-200 rounded-lg flex items-center justify-center bg-slate-50">
          <FileText className="w-12 h-12 text-slate-400" />
        </div>

        {/* Metadata per UI-SPEC */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-900 truncate mb-1">
            {file.name}
          </h3>

          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">{fileType}</Badge>
            <span className="text-sm text-slate-500">{fileSizeMB} MB</span>
          </div>

          {/* Per D-06: "Analyze CV" button is primary action */}
          <Button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="w-full sm:w-auto"
            size="default"
          >
            {isAnalyzing ? "Starting Analysis..." : "Analyze CV"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

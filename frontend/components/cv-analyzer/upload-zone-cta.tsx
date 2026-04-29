import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function UploadZoneCTA() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <Link
        href="/workspace-v2/new"
        className="rounded-full bg-[#F5F2D8] text-[#141414] font-extrabold text-base
                   px-7 py-3 hover:bg-white transition-colors duration-150"
      >
        Analyze My CV
      </Link>
      <Link
        href="/workspace-v2/new"
        aria-label="Start CV analysis"
        className="w-14 h-14 rounded-full bg-[#CAFF43] flex items-center justify-center
                   hover:bg-[#CAFF43]/85 transition-colors duration-150 flex-shrink-0"
      >
        <ArrowRight className="w-5 h-5 text-[#141414]" />
      </Link>
      <p className="text-xs text-[#F5F2D8]/40 sm:ml-2">
        PDF or DOCX · Max 10 MB
      </p>
    </div>
  );
}

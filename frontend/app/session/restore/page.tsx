"use client";

import Image from "next/image";
import { Suspense } from "react";
import { useAuthRestore } from "@/hooks/use-auth-restore";
import { pathyPoseSrc } from "@/lib/pathy/pose";

function RestoreState() {
  useAuthRestore();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#fff4ee] text-[#1a0b07]">
      <Image
        src={pathyPoseSrc("think")}
        alt=""
        width={180}
        height={180}
        priority
      />
      <h1 className="text-center text-2xl font-bold">
        Restoring your session…
      </h1>
    </main>
  );
}

export default function RestorePage() {
  return (
    <Suspense>
      <RestoreState />
    </Suspense>
  );
}

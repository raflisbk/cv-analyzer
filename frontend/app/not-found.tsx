import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F5F2D8] px-4 text-center">
      <div className="rounded-2xl border border-[#141414]/10 bg-white p-8 shadow-sm">
        <h1 className="text-6xl font-black tracking-tighter text-[#141414]">
          404
        </h1>
        <p className="mt-2 text-sm text-[#141414]/60">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-[#141414] px-6 py-2.5 text-sm font-bold text-[#F5F2D8] transition-colors hover:bg-[#141414]/80"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}

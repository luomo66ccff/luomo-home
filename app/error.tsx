"use client";

import { useEffect } from "react";

export default function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Luomo Home] page boundary", {
      digest: error.digest,
      message: error.message,
    });
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <section className="max-w-lg text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Cloud route interrupted</p>
        <h1 className="mt-3 text-3xl font-semibold">This section could not finish loading.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          The rest of the service remains isolated. Retry this route without reloading the whole site.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100 hover:bg-cyan-300/20"
        >
          Retry
        </button>
      </section>
    </main>
  );
}

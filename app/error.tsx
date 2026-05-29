"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-6">
      <div 
        className="w-full max-w-md p-8 rounded-xl flex flex-col items-center text-center shadow-2xl"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid rgba(255, 34, 68, 0.3)",
          boxShadow: "0 10px 40px rgba(255, 34, 68, 0.1)",
        }}
      >
        <div className="w-12 h-12 rounded-full bg-[rgba(255,34,68,0.1)] flex items-center justify-center mb-6">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--state-danger)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h2 
          className="text-xl font-bold mb-3 text-[var(--text-primary)] tracking-wide"
          style={{ fontFamily: "var(--font-jetbrains), monospace" }}
        >
          SYSTEM MALFUNCTION
        </h2>
        
        <p className="text-sm text-[var(--text-secondary)] mb-8 leading-relaxed">
          An unexpected error occurred in the analysis module. 
          The diagnostic data has been safely cleared.
        </p>

        <div className="flex flex-col w-full gap-3">
          <button
            onClick={() => reset()}
            className="w-full py-3 px-4 rounded-lg text-sm font-bold tracking-widest uppercase transition-colors"
            style={{
              background: "rgba(255, 34, 68, 0.1)",
              border: "1px solid rgba(255, 34, 68, 0.4)",
              color: "var(--state-danger)",
              fontFamily: "var(--font-jetbrains), monospace",
            }}
          >
            Attempt Recovery
          </button>
          
          <Link href="/">
            <button
              className="w-full py-3 px-4 rounded-lg text-sm font-bold tracking-widest uppercase transition-colors mt-2"
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-jetbrains), monospace",
              }}
            >
              Return to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

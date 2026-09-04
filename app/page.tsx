"use client";

import { useState } from "react";
import RequestBuilder from "./components/RequestBuilder";
import ResponseViewer from "./components/ResponseViewer";
import type { ProxyResponseBody } from "./lib/types";

export default function Home() {
  const [response, setResponse] = useState<ProxyResponseBody | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResponse = (
    res: ProxyResponseBody | null,
    err: string | null,
  ) => {
    setResponse(res);
    setError(err);
  };

  return (
    <main className="min-h-[100dvh] flex flex-col p-6 gap-6">
      <header className="flex items-center gap-3 pb-4 border-b border-border">
        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(232,176,90,0.45)]" />
        <h1 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
          api-engine
        </h1>
        <span className="text-muted text-xs ml-auto">api.strueller.de</span>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* Left: request builder */}
        <div className="lg:w-1/2 flex flex-col gap-4">
          <span className="text-muted text-xs tracking-wide">Request</span>
          <RequestBuilder
            onResponse={handleResponse}
            onLoadingChange={setLoading}
          />
        </div>

        {/* Right: response viewer */}
        <div className="lg:w-1/2 flex flex-col gap-4">
          <span className="text-muted text-xs tracking-wide">Response</span>
          <div className="flex-1">
            <ResponseViewer
              response={response}
              error={error}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

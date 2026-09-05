"use client";

import { useState, useCallback } from "react";
import RequestBuilder from "./components/RequestBuilder";
import ResponseViewer from "./components/ResponseViewer";
import CollectionsSidebar, {
  type LoadedRequestData,
} from "./components/CollectionsSidebar";
import type { ProxyResponseBody, RequestMethod, HeaderRow } from "./lib/types";

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export default function Home() {
  const [response, setResponse] = useState<ProxyResponseBody | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [method, setMethod] = useState<RequestMethod>("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<HeaderRow[]>([
    { id: generateId(), key: "", value: "" },
  ]);
  const [body, setBody] = useState("");

  const handleResponse = (
    res: ProxyResponseBody | null,
    err: string | null,
  ) => {
    setResponse(res);
    setError(err);
  };

  const handleLoadRequest = useCallback((data: LoadedRequestData) => {
    setMethod(data.method);
    setUrl(data.url);
    setHeaders(data.headers);
    setBody(data.body);
    setResponse(null);
    setError(null);
  }, []);

  const getCurrentRequest = useCallback((): LoadedRequestData => {
    return { method, url, headers, body };
  }, [method, url, headers, body]);

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
        {/* Sidebar: collections */}
        <aside className="lg:w-64 shrink-0 flex flex-col gap-4 lg:max-h-[calc(100dvh-120px)]">
          <CollectionsSidebar
            onLoadRequest={handleLoadRequest}
            getCurrentRequest={getCurrentRequest}
          />
        </aside>

        {/* Center: request builder */}
        <div className="flex-1 flex flex-col gap-4">
          <span className="text-muted text-xs tracking-wide">Request</span>
          <RequestBuilder
            method={method}
            url={url}
            headers={headers}
            body={body}
            onMethodChange={setMethod}
            onUrlChange={setUrl}
            onHeadersChange={setHeaders}
            onBodyChange={setBody}
            onResponse={handleResponse}
            onLoadingChange={setLoading}
          />
        </div>

        {/* Right: response viewer */}
        <div className="lg:w-[35%] flex flex-col gap-4">
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

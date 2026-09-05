"use client";

import { useState, useCallback } from "react";
import RequestBuilder from "./components/RequestBuilder";
import ResponseViewer from "./components/ResponseViewer";
import CollectionsSidebar, {
  type LoadedRequestData,
} from "./components/CollectionsSidebar";
import EndpointsSidebar from "./components/EndpointsSidebar";
import EndpointEditor from "./components/EndpointEditor";
import type { ProxyResponseBody, RequestMethod, HeaderRow } from "./lib/types";
import type { EndpointDef } from "@/lib/endpoint-types";

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

type ShowPanel = "collections" | "endpoints";

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

  const [showPanel, setShowPanel] = useState<ShowPanel>("collections");
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDef | null>(
    null,
  );
  const [showEndpointEditor, setShowEndpointEditor] = useState(false);

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

  const handleSelectEndpoint = (ep: EndpointDef) => {
    setSelectedEndpoint(ep);
    setShowEndpointEditor(true);
  };

  const handleCreateNewEndpoint = () => {
    setSelectedEndpoint(null);
    setShowEndpointEditor(true);
  };

  const handleEndpointSaved = () => {
    setShowEndpointEditor(false);
    setSelectedEndpoint(null);
  };

  const handleDeleteEndpoint = () => {
    setSelectedEndpoint(null);
    setShowEndpointEditor(false);
  };

  const handleSendToRunner = (slug: string, epMethod: string) => {
    setUrl("/api/e/" + slug);
    setMethod(epMethod as RequestMethod);
    setShowPanel("collections");
    setShowEndpointEditor(false);
    setResponse(null);
    setError(null);
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
        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0 flex flex-col gap-4 lg:max-h-[calc(100dvh-120px)]">
          {/* Tab toggle */}
          <div className="flex gap-1 border border-border rounded-lg p-0.5">
            <button
              onClick={() => setShowPanel("collections")}
              className={`flex-1 text-xs px-2 py-1.5 rounded-md transition-colors cursor-pointer ${
                showPanel === "collections"
                  ? "bg-accent text-bg font-medium"
                  : "text-muted hover:text-fg"
              }`}
            >
              Collections
            </button>
            <button
              onClick={() => setShowPanel("endpoints")}
              className={`flex-1 text-xs px-2 py-1.5 rounded-md transition-colors cursor-pointer ${
                showPanel === "endpoints"
                  ? "bg-accent text-bg font-medium"
                  : "text-muted hover:text-fg"
              }`}
            >
              Endpoints
            </button>
          </div>

          {showPanel === "collections" ? (
            <CollectionsSidebar
              onLoadRequest={handleLoadRequest}
              getCurrentRequest={getCurrentRequest}
            />
          ) : (
            <>
              <EndpointsSidebar
                onSelectEndpoint={handleSelectEndpoint}
                onCreateNew={handleCreateNewEndpoint}
                onDeleteEndpoint={handleDeleteEndpoint}
              />

              {showEndpointEditor && (
                <EndpointEditor
                  endpoint={selectedEndpoint}
                  onSave={handleEndpointSaved}
                  onSendToRunner={handleSendToRunner}
                />
              )}
            </>
          )}
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

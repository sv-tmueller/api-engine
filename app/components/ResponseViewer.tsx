"use client";

import { useState } from "react";
import type { ProxyResponseBody } from "../lib/types";

interface ResponseViewerProps {
  response: ProxyResponseBody | null;
  error: string | null;
  loading: boolean;
}

function statusCodeColor(status: number): string {
  if (status >= 200 && status < 300) return "text-green-400";
  if (status >= 300 && status < 400) return "text-yellow-400";
  if (status >= 400 && status < 500) return "text-orange-400";
  if (status >= 500) return "text-red-400";
  return "text-muted";
}

function tryPrettyPrint(body: string, contentType: string): string {
  const isJson =
    contentType.includes("application/json") ||
    (body.trim().startsWith("{") && body.trim().endsWith("}")) ||
    (body.trim().startsWith("[") && body.trim().endsWith("]"));

  if (!isJson) return body;

  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
}

export default function ResponseViewer({
  response,
  error,
  loading,
}: ResponseViewerProps) {
  const [showHeaders, setShowHeaders] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <span className="text-muted text-sm animate-pulse">Sending...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2 h-full min-h-[200px] justify-center">
        <span className="text-red-400 text-sm font-mono">Error</span>
        <pre className="text-fg-2 text-sm font-mono whitespace-pre-wrap break-all">
          {error}
        </pre>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <span className="text-muted text-sm">
          Send a request to see the response
        </span>
      </div>
    );
  }

  const contentType =
    response.headers["content-type"] || response.headers["Content-Type"] || "";

  const prettyBody = tryPrettyPrint(response.body, contentType);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Status bar */}
      <div className="flex items-center gap-4">
        <span
          className={`text-sm font-mono font-medium ${statusCodeColor(response.status)}`}
        >
          {response.status} {response.statusText}
        </span>
        <span className="text-muted text-xs">{response.elapsedMs} ms</span>
      </div>

      {/* Response headers (collapsible) */}
      <div>
        <button
          onClick={() => setShowHeaders(!showHeaders)}
          className="text-muted text-xs tracking-wide hover:text-accent transition-colors cursor-pointer"
        >
          {showHeaders ? "v" : ">"} Headers ({Object.keys(response.headers).length})
        </button>
        {showHeaders && (
          <div className="mt-2 border border-border rounded-lg p-3 max-h-[200px] overflow-y-auto">
            {Object.entries(response.headers).map(([key, value]) => (
              <div
                key={key}
                className="flex gap-2 text-xs font-mono py-0.5"
              >
                <span className="text-muted shrink-0">{key}:</span>
                <span className="text-fg-2 break-all">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Response body */}
      <div className="flex-1 overflow-auto">
        <pre className="text-fg-2 text-sm font-mono whitespace-pre-wrap break-all bg-[var(--color-bg-glow)] border border-border rounded-lg p-3 min-h-[100px]">
          {prettyBody || "(empty body)"}
        </pre>
      </div>
    </div>
  );
}

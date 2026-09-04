"use client";

import { useState, useCallback } from "react";
import type {
  RequestMethod,
  HeaderRow,
  ProxyResponseBody,
} from "../lib/types";

const METHODS: RequestMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

interface RequestBuilderProps {
  onResponse: (response: ProxyResponseBody | null, error: string | null) => void;
  onLoadingChange?: (loading: boolean) => void;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export default function RequestBuilder({
  onResponse,
  onLoadingChange,
}: RequestBuilderProps) {
  const [method, setMethod] = useState<RequestMethod>("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<HeaderRow[]>([
    { id: generateId(), key: "", value: "" },
  ]);
  const [body, setBody] = useState("");

  const showBody = method === "POST" || method === "PUT" || method === "PATCH";

  const addHeader = () => {
    setHeaders([...headers, { id: generateId(), key: "", value: "" }]);
  };

  const removeHeader = (id: string) => {
    setHeaders(headers.filter((h) => h.id !== id));
  };

  const updateHeader = (id: string, field: "key" | "value", val: string) => {
    setHeaders(
      headers.map((h) => (h.id === id ? { ...h, [field]: val } : h)),
    );
  };

  const sendRequest = useCallback(async () => {
    if (!url.trim()) {
      onResponse(null, "URL is required");
      return;
    }

    onLoadingChange?.(true);

    const headerObj: Record<string, string> = {};
    for (const h of headers) {
      if (h.key.trim()) {
        headerObj[h.key.trim()] = h.value;
      }
    }

    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          url: url.trim(),
          headers: headerObj,
          body: showBody ? body : "",
        }),
      });

      const data = await res.json();

      if (data.error) {
        onResponse(null, data.error);
      } else {
        onResponse(data, null);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Request failed";
      onResponse(null, msg);
    } finally {
      onLoadingChange?.(false);
    }
  }, [method, url, headers, body, showBody, onResponse, onLoadingChange]);

  return (
    <div className="flex flex-col gap-4">
      {/* Method + URL bar */}
      <div className="flex gap-2">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as RequestMethod)}
          className="bg-[var(--color-bg-glow)] text-fg border border-border rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-accent transition-colors"
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendRequest();
          }}
          placeholder="https://api.example.com/endpoint"
          className="flex-1 bg-[var(--color-bg-glow)] text-fg border border-border rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-accent transition-colors placeholder:text-muted"
        />
        <button
          onClick={sendRequest}
          className="bg-accent text-bg border border-accent rounded-lg px-5 py-2 text-sm font-medium hover:brightness-110 transition-filter cursor-pointer whitespace-nowrap"
        >
          Send
        </button>
      </div>

      {/* Headers editor */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-muted text-xs tracking-wide">Headers</span>
          <button
            onClick={addHeader}
            className="text-accent text-xs border border-[var(--accent-border)] rounded-full px-2.5 py-0.5 hover:bg-[rgba(232,176,90,0.05)] transition-colors cursor-pointer"
          >
            +
          </button>
        </div>
        {headers.map((h) => (
          <div key={h.id} className="flex gap-2 items-center">
            <input
              type="text"
              value={h.key}
              onChange={(e) => updateHeader(h.id, "key", e.target.value)}
              placeholder="header name"
              className="flex-1 bg-[var(--color-bg-glow)] text-fg-2 border border-border rounded-lg px-3 py-1.5 text-sm font-mono outline-none focus:border-accent transition-colors placeholder:text-muted"
            />
            <input
              type="text"
              value={h.value}
              onChange={(e) => updateHeader(h.id, "value", e.target.value)}
              placeholder="value"
              className="flex-1 bg-[var(--color-bg-glow)] text-fg-2 border border-border rounded-lg px-3 py-1.5 text-sm font-mono outline-none focus:border-accent transition-colors placeholder:text-muted"
            />
            <button
              onClick={() => removeHeader(h.id)}
              className="text-muted hover:text-accent text-sm px-2 cursor-pointer transition-colors"
              aria-label="Remove header"
            >
              x
            </button>
          </div>
        ))}
      </div>

      {/* Body editor */}
      {showBody && (
        <div className="flex flex-col gap-2">
          <span className="text-muted text-xs tracking-wide">Body</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder='{ "key": "value" }'
            rows={6}
            className="bg-[var(--color-bg-glow)] text-fg-2 border border-border rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-accent transition-colors placeholder:text-muted resize-y"
          />
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import type { EndpointDef } from "@/lib/endpoint-types";

interface EndpointsSidebarProps {
  onSelectEndpoint: (endpoint: EndpointDef) => void;
  onCreateNew: () => void;
  onDeleteEndpoint: (id: string) => void;
}

export default function EndpointsSidebar({
  onSelectEndpoint,
  onCreateNew,
  onDeleteEndpoint,
}: EndpointsSidebarProps) {
  const [endpoints, setEndpoints] = useState<EndpointDef[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEndpoints = useCallback(async () => {
    try {
      const res = await fetch("/api/endpoints");
      if (!res.ok) throw new Error("Failed to load endpoints");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEndpoints(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEndpoints();
  }, [fetchEndpoints]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this endpoint?")) return;
    try {
      const res = await fetch(`/api/endpoints/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to delete");
      }
      await fetchEndpoints();
      onDeleteEndpoint(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const methodColor = (m: string) =>
    m === "GET"
      ? "text-green-400"
      : m === "POST"
        ? "text-yellow-400"
        : m === "PUT" || m === "PATCH"
          ? "text-blue-400"
          : "text-red-400";

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <span className="text-muted text-xs tracking-wide">Endpoints</span>
        <button
          onClick={onCreateNew}
          className="text-accent text-xs border border-[var(--accent-border)] rounded-full px-2.5 py-0.5 hover:bg-[rgba(232,176,90,0.05)] transition-colors cursor-pointer"
        >
          +
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-xs font-mono p-2 border border-border rounded-lg">
          {error}
        </div>
      )}

      {loading && !error && (
        <div className="text-muted text-xs text-center py-8">Loading...</div>
      )}

      {!loading && endpoints.length === 0 && !error && (
        <div className="text-muted text-xs text-center py-8">
          No endpoints yet. Click + to create one.
        </div>
      )}

      <div className="flex flex-col gap-1 overflow-y-auto">
        {endpoints.map((ep) => (
          <div
            key={ep.id}
            className="flex items-center gap-2 min-h-9 py-1 px-2.5 -mx-2.5 rounded-lg hover:bg-[rgba(232,176,90,0.05)] transition-colors group cursor-pointer"
            onClick={() => onSelectEndpoint(ep)}
          >
            <span
              className={`text-[0.65rem] font-mono shrink-0 ${methodColor(ep.method)}`}
            >
              {ep.method}
            </span>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm text-fg-2 truncate">{ep.name}</span>
              <span className="text-[0.65rem] text-muted truncate font-mono">
                {ep.slug}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(ep.id);
              }}
              className="text-muted hover:text-accent text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Delete endpoint"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

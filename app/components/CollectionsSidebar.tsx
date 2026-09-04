"use client";

import { useState, useEffect, useCallback } from "react";
import type { RequestMethod, HeaderRow } from "../lib/types";

export interface SavedCollection {
  id: string;
  name: string;
  created_at: string;
}

export interface SavedRequest {
  id: string;
  collection_id: string;
  name: string;
  method: RequestMethod;
  url: string;
  headers: Array<{ key: string; value: string }>;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface LoadedRequestData {
  method: RequestMethod;
  url: string;
  headers: HeaderRow[];
  body: string;
}

interface CollectionsSidebarProps {
  onLoadRequest: (data: LoadedRequestData) => void;
  getCurrentRequest: () => LoadedRequestData;
}

export default function CollectionsSidebar({
  onLoadRequest,
  getCurrentRequest,
}: CollectionsSidebarProps) {
  const [collections, setCollections] = useState<SavedCollection[]>([]);
  const [requests, setRequests] = useState<SavedRequest[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [selectedCollectionId, setSelectedCollectionId] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [colRes, reqRes] = await Promise.all([
        fetch("/api/collections"),
        fetch("/api/requests"),
      ]);

      if (!colRes.ok || !reqRes.ok) {
        throw new Error("Failed to load collections");
      }

      const cols = await colRes.json();
      const reqs = await reqRes.json();

      if (cols.error) throw new Error(cols.error);
      if (reqs.error) throw new Error(reqs.error);

      setCollections(cols || []);
      setRequests(reqs || []);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      setError(msg);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleExpand = (id: string) => {
    setExpanded({ ...expanded, [id]: !expanded[id] });
  };

  const createCollection = async () => {
    const name = prompt("Collection name:");
    if (!name) return;
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  const renameCollection = async (id: string, currentName: string) => {
    const name = prompt("Rename collection:", currentName);
    if (!name || name === currentName) return;
    try {
      const res = await fetch(`/api/collections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  const deleteCollection = async (id: string) => {
    if (!confirm("Delete this collection and all its requests?")) return;
    try {
      const res = await fetch(`/api/collections/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleSave = async () => {
    if (!saveName.trim() || !selectedCollectionId) return;
    setSaving(true);
    try {
      const current = getCurrentRequest();
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection_id: selectedCollectionId,
          name: saveName.trim(),
          method: current.method,
          url: current.url,
          headers: current.headers
            .filter((h) => h.key.trim())
            .map((h) => ({ key: h.key.trim(), value: h.value })),
          body: current.body,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      setShowSaveDialog(false);
      setSaveName("");
      setSelectedCollectionId("");
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const loadSavedRequest = (req: SavedRequest) => {
    const headerRows: HeaderRow[] = (req.headers || []).map((h) => ({
      id: Math.random().toString(36).slice(2, 11),
      key: h.key,
      value: h.value,
    }));
    if (headerRows.length === 0) {
      headerRows.push({
        id: Math.random().toString(36).slice(2, 11),
        key: "",
        value: "",
      });
    }
    onLoadRequest({
      method: req.method,
      url: req.url,
      headers: headerRows,
      body: req.body || "",
    });
  };

  const deleteRequest = async (id: string) => {
    if (!confirm("Delete this request?")) return;
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed");
      }
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  const getRequestCount = (collectionId: string) =>
    requests.filter((r) => r.collection_id === collectionId).length;

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <span className="text-muted text-xs tracking-wide">Collections</span>
        <button
          onClick={createCollection}
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

      {collections.length === 0 && !error && (
        <div className="text-muted text-xs text-center py-8">
          No collections yet. Click + to create one.
        </div>
      )}

      <div className="flex flex-col gap-1 overflow-y-auto">
        {collections.map((col) => (
          <div key={col.id}>
            <div className="flex items-center gap-2 min-h-9 py-1 px-2.5 -mx-2.5 rounded-lg hover:bg-[rgba(232,176,90,0.05)] transition-colors group">
              <button
                onClick={() => toggleExpand(col.id)}
                className="text-muted text-xs cursor-pointer"
                aria-label="Toggle expand"
              >
                {expanded[col.id] ? "v" : ">"}
              </button>
              <span
                className="shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--dot-dim)]"
                aria-hidden="true"
              />
              <span className="text-sm text-fg-2 truncate flex-1">
                {col.name}
              </span>
              <span className="text-[0.65rem] text-muted">
                {getRequestCount(col.id)}
              </span>
              <button
                onClick={() => renameCollection(col.id, col.name)}
                className="text-muted hover:text-accent text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Rename"
              >
                e
              </button>
              <button
                onClick={() => deleteCollection(col.id)}
                className="text-muted hover:text-accent text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Delete"
              >
                x
              </button>
            </div>

            {expanded[col.id] &&
              requests
                .filter((r) => r.collection_id === col.id)
                .map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center gap-2 ml-6 min-h-8 py-1 px-2.5 -mx-2.5 rounded-lg hover:bg-[rgba(232,176,90,0.05)] transition-colors group"
                  >
                    <span
                      className={`text-[0.65rem] font-mono shrink-0 ${
                        req.method === "GET"
                          ? "text-green-400"
                          : req.method === "POST"
                            ? "text-yellow-400"
                            : req.method === "PUT" || req.method === "PATCH"
                              ? "text-blue-400"
                              : "text-red-400"
                      }`}
                    >
                      {req.method}
                    </span>
                    <button
                      onClick={() => loadSavedRequest(req)}
                      className="text-sm text-fg-2 hover:text-white truncate flex-1 text-left cursor-pointer"
                    >
                      {req.name}
                    </button>
                    <button
                      onClick={() => deleteRequest(req.id)}
                      className="text-muted hover:text-accent text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      aria-label="Delete request"
                    >
                      x
                    </button>
                  </div>
                ))}
          </div>
        ))}
      </div>

      {/* Save current request */}
      {showSaveDialog && (
        <div className="flex flex-col gap-2 p-3 border border-border rounded-lg">
          <span className="text-muted text-xs">Save current request</span>
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Request name"
            className="bg-[var(--color-bg-glow)] text-fg border border-border rounded-lg px-3 py-1.5 text-sm font-mono outline-none focus:border-accent placeholder:text-muted"
          />
          <select
            value={selectedCollectionId}
            onChange={(e) => setSelectedCollectionId(e.target.value)}
            className="bg-[var(--color-bg-glow)] text-fg border border-border rounded-lg px-3 py-1.5 text-sm font-mono outline-none focus:border-accent"
          >
            <option value="">Select collection...</option>
            {collections.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!saveName.trim() || !selectedCollectionId || saving}
              className="bg-accent text-bg rounded-lg px-3 py-1.5 text-xs font-medium hover:brightness-110 transition-filter cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setShowSaveDialog(false);
                setSaveName("");
                setSelectedCollectionId("");
              }}
              className="text-muted hover:text-fg text-xs px-3 py-1.5 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!showSaveDialog && (
        <button
          onClick={() => setShowSaveDialog(true)}
          className="text-accent text-xs border border-[var(--accent-border)] rounded-lg px-3 py-2 hover:bg-[rgba(232,176,90,0.05)] transition-colors cursor-pointer"
        >
          Save current request
        </button>
      )}
    </div>
  );
}

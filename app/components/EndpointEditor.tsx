"use client";

import { useState, useEffect } from "react";
import type { EndpointDef } from "@/lib/endpoint-types";
import type { RequestMethod } from "../lib/types";

const METHODS: RequestMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const SLUG_RE = /^[a-z0-9-]+$/;

interface EndpointEditorProps {
  endpoint: EndpointDef | null;
  onSave: () => void;
  onSendToRunner: (slug: string, method: string) => void;
}

export default function EndpointEditor({
  endpoint,
  onSave,
  onSendToRunner,
}: EndpointEditorProps) {
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [method, setMethod] = useState<RequestMethod>("GET");
  const [functionBody, setFunctionBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (endpoint) {
      setSlug(endpoint.slug);
      setName(endpoint.name);
      setMethod(endpoint.method as RequestMethod);
      setFunctionBody(endpoint.function_body || "");
    } else {
      setSlug("");
      setName("");
      setMethod("GET");
      setFunctionBody("");
    }
    setError(null);
  }, [endpoint]);

  const slugValid = SLUG_RE.test(slug);
  const nameValid = name.trim().length > 0;
  const canSave = slugValid && nameValid && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        slug: slug.trim(),
        name: name.trim(),
        method,
        function_body: functionBody,
      };
      const isEdit = !!endpoint;
      const res = isEdit
        ? await fetch(`/api/endpoints/${endpoint!.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/endpoints", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(
          d.error ||
            (isEdit ? "Failed to update endpoint" : "Failed to create endpoint"),
        );
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSendToRunner = () => {
    if (slugValid) {
      onSendToRunner(slug.trim(), method);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 border border-border rounded-lg bg-[var(--color-bg-glow)]">
      <span className="text-muted text-xs tracking-wide">
        {endpoint ? "Edit endpoint" : "New endpoint"}
      </span>

      {error && (
        <div className="text-red-400 text-xs font-mono p-2 border border-border rounded-lg">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-muted text-xs">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase())}
          placeholder="my-endpoint"
          className={`bg-[var(--color-bg-glow)] text-fg border rounded-lg px-3 py-1.5 text-sm font-mono outline-none focus:border-accent placeholder:text-muted ${
            slug.length > 0 && !slugValid
              ? "border-red-400"
              : "border-border"
          }`}
        />
        {slug.length > 0 && !slugValid && (
          <span className="text-red-400 text-xs">
            Slug must be lowercase letters, digits, and hyphens only.
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-muted text-xs">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Endpoint"
          className="bg-[var(--color-bg-glow)] text-fg border border-border rounded-lg px-3 py-1.5 text-sm font-mono outline-none focus:border-accent placeholder:text-muted"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-muted text-xs">Method</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as RequestMethod)}
          className="bg-[var(--color-bg-glow)] text-fg border border-border rounded-lg px-3 py-1.5 text-sm font-mono outline-none focus:border-accent"
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-muted text-xs">Handler function body</label>
        <textarea
          value={functionBody}
          onChange={(e) => setFunctionBody(e.target.value)}
          rows={12}
          placeholder={"// req has: method, url, headers, query, body\nreturn { status: 200, body: JSON.stringify({ ok: true }) }"}
          className="bg-[var(--color-bg-glow)] text-fg border border-border rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-accent placeholder:text-muted resize-y"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="bg-accent text-bg rounded-lg px-3 py-1.5 text-xs font-medium hover:brightness-110 transition-filter cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={handleSendToRunner}
          disabled={!slugValid}
          className="text-accent text-xs border border-[var(--accent-border)] rounded-lg px-3 py-1.5 hover:bg-[rgba(232,176,90,0.05)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send to Runner
        </button>
      </div>
    </div>
  );
}

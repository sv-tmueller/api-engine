import { NextRequest, NextResponse } from "next/server";
import type { ProxyRequestBody, ProxyResponseBody } from "../../lib/types";

export async function POST(request: NextRequest) {
  let parsed: ProxyRequestBody;
  try {
    parsed = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { method, url, headers, body } = parsed;

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(targetUrl.protocol)) {
    return NextResponse.json(
      { error: "Only http and https protocols are supported" },
      { status: 400 },
    );
  }

  const init: RequestInit = {
    method,
    headers: headers || {},
  };

  if (body && method !== "GET" && method !== "DELETE") {
    init.body = body;
  }

  const startTime = performance.now();

  try {
    const response = await fetch(targetUrl.href, init);
    const elapsedMs = Math.round(performance.now() - startTime);

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    const responseBody = await response.text();

    const result: ProxyResponseBody = {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      elapsedMs,
    };

    return NextResponse.json(result);
  } catch (err) {
    const elapsedMs = Math.round(performance.now() - startTime);
    const message =
      err instanceof Error ? err.message : "Unknown fetch error";

    return NextResponse.json(
      { error: message, elapsedMs },
      { status: 502 },
    );
  }
}

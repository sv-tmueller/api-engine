import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import type { EndpointReq, EndpointResult } from "@/lib/endpoint-types";

async function lookupBySlug(slug: string) {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("endpoints")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function handleRequest(
  request: NextRequest,
  slugParam: string
): Promise<NextResponse> {
  try {
    const endpoint = await lookupBySlug(slugParam);

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint not found" },
        { status: 404 }
      );
    }

    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const req: EndpointReq = {
      method: request.method ?? "GET",
      url: request.url,
      headers,
      query: Object.fromEntries(request.nextUrl.searchParams),
      body: await request.text(),
    };

    const fn = new Function("req", endpoint.function_body) as (
      req: EndpointReq
    ) => Promise<EndpointResult | string>;
    const raw = await fn(req);

    let result: Partial<EndpointResult>;
    if (typeof raw === "string") {
      result = { status: 200, body: raw };
    } else if (raw && typeof raw === "object") {
      result = raw;
    } else {
      result = { status: 200 };
    }

    const status = result.status ?? 200;
    const payload = result.body ? JSON.parse(result.body) : result;
    return NextResponse.json(payload, {
      status,
      headers: result.headers,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Execution failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return handleRequest(request, slug);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return handleRequest(request, slug);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return handleRequest(request, slug);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return handleRequest(request, slug);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return handleRequest(request, slug);
}

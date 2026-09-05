import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

const SLUG_RE = /^[a-z0-9-]+$/;

export async function GET() {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("endpoints")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to connect";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, name, method, function_body } = body;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }
    if (!SLUG_RE.test(slug)) {
      return NextResponse.json(
        { error: "Slug must match /^[a-z0-9-]+$/" },
        { status: 400 }
      );
    }
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }
    if (!method || typeof method !== "string") {
      return NextResponse.json({ error: "Missing method" }, { status: 400 });
    }
    if (!function_body || typeof function_body !== "string") {
      return NextResponse.json(
        { error: "Missing function_body" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    const { data: existing } = await supabase
      .from("endpoints")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("endpoints")
      .insert({ slug, name, method, function_body })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to connect";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

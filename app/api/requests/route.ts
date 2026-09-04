import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const collectionId = request.nextUrl.searchParams.get("collection_id");

    const supabase = getSupabaseServer();
    let query = supabase
      .from("saved_requests")
      .select("*")
      .order("created_at", { ascending: true });

    if (collectionId) {
      query = query.eq("collection_id", collectionId);
    }

    const { data, error } = await query;

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

    const { collection_id, name, method, url, headers, body: reqBody } = body;

    if (!collection_id || !name || !method || !url) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("saved_requests")
      .insert({
        collection_id,
        name,
        method,
        url,
        headers: headers || [],
        body: reqBody || "",
      })
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

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { normalizeTelemetry, type Telemetry } from "@/lib/telemetry";

export const dynamic = "force-dynamic";

const memoryStore: Telemetry[] = [];
const API_TOKEN = process.env.INGEST_TOKEN;

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function checkToken(request: Request) {
  if (!API_TOKEN) return true;
  return request.headers.get("authorization") === `Bearer ${API_TOKEN}`;
}

function debugInfo() {
  return {
    storage: supabase ? "supabase" : "memory",
    hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasIngestToken: Boolean(process.env.INGEST_TOKEN),
    supabaseUrlStart: process.env.SUPABASE_URL
      ? process.env.SUPABASE_URL.slice(0, 35)
      : null,
  };
}

export async function GET(request: Request) {
  if (!checkToken(request)) return unauthorized();

  if (supabase) {
    const { data, error } = await supabase
      .from("telemetry")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          debug: debugInfo(),
          supabaseError: error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      debug: debugInfo(),
      data,
    });
  }

  return NextResponse.json({
    ok: true,
    debug: debugInfo(),
    data: memoryStore.slice(-50).reverse(),
  });
}

export async function POST(request: Request) {
  if (!checkToken(request)) return unauthorized();

  const body = await request.json();
  const item = normalizeTelemetry(body);

  if (supabase) {
    const { data, error } = await supabase
      .from("telemetry")
      .insert(item)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          debug: debugInfo(),
          itemTriedToInsert: item,
          supabaseError: error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        debug: debugInfo(),
        data,
      },
      { status: 201 }
    );
  }

  const saved = {
    ...item,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };

  memoryStore.push(saved);

  return NextResponse.json(
    {
      ok: true,
      debug: debugInfo(),
      data: saved,
    },
    { status: 201 }
  );
}
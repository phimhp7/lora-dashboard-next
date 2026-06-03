import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import { normalizeTelemetry, type Telemetry } from "@/lib/telemetry";

export const dynamic = "force-dynamic";

const memoryStore: Telemetry[] = [];
const API_TOKEN = process.env.INGEST_TOKEN;

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

function isAuthorized(request: Request) {
  if (!API_TOKEN) return true;

  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${API_TOKEN}`;
}

function getLimit(request: Request) {
  const url = new URL(request.url);
  const rawLimit = Number(url.searchParams.get("limit") ?? 20);

  if (Number.isNaN(rawLimit)) return 20;

  return Math.min(Math.max(rawLimit, 1), 100);
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
  const limit = getLimit(request);

  if (supabase) {
    const { data, error } = await supabase
      .from("telemetry")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return jsonResponse(
        {
          ok: false,
          error: error.message,
          debug: debugInfo(),
          supabaseError: error,
        },
        500
      );
    }

    return jsonResponse({
      ok: true,
      debug: debugInfo(),
      data: data ?? [],
    });
  }

  return jsonResponse({
    ok: true,
    debug: debugInfo(),
    data: memoryStore.slice(-limit).reverse(),
  });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return jsonResponse(
      {
        ok: false,
        error: "Unauthorized",
      },
      401
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      {
        ok: false,
        error: "Invalid JSON body",
      },
      400
    );
  }

  const item = normalizeTelemetry(body);

  if (supabase) {
    const { data, error } = await supabase
      .from("telemetry")
      .insert(item)
      .select("*")
      .single();

    if (error) {
      return jsonResponse(
        {
          ok: false,
          error: error.message,
          debug: debugInfo(),
          itemTriedToInsert: item,
          supabaseError: error,
        },
        500
      );
    }

    return jsonResponse(
      {
        ok: true,
        debug: debugInfo(),
        data,
      },
      201
    );
  }

  const saved: Telemetry = {
    ...item,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };

  memoryStore.push(saved);

  return jsonResponse(
    {
      ok: true,
      debug: debugInfo(),
      data: saved,
    },
    201
  );
}
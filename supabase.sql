create table if not exists telemetry (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  counter integer,
  status text,
  rssi integer,
  snr real,
  distance_km real,
  temperature real,
  humidity real,
  payload_raw text,
  source text,
  created_at timestamptz not null default now()
);

create index if not exists telemetry_created_at_idx on telemetry (created_at desc);

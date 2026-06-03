import { Activity, Gauge, Radio, Thermometer, Wifi } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import type { Telemetry } from "@/lib/telemetry";

export const dynamic = "force-dynamic";

async function getTelemetry(): Promise<Telemetry[]> {
  if (!supabase) return [];

  const { data } = await supabase
    .from("telemetry")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return data ?? [];
}

function metric(value: number | null | undefined, suffix: string) {
  if (value === null || value === undefined) return "N/A";
  return `${value}${suffix}`;
}

export default async function Home() {
  const rows = await getTelemetry();
  const latest = rows[0];

  return (
    <main className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge className="mb-3 bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
              ESP32 + LoRa-E5 + TTN
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Dashboard couverture LoRa</h1>
            <p className="mt-3 max-w-2xl text-zinc-400">
              Suivi des uplinks, RSSI, SNR, distance estimée et futures données capteur comme DHT11.
            </p>
          </div>
          <div className="text-sm text-zinc-500">
            Dernière mise à jour : {latest?.created_at ? new Date(latest.created_at).toLocaleString("fr-FR") : "aucune donnée"}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <Card className="card-gradient">
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><Radio size={18}/>RSSI</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{metric(latest?.rssi, " dBm")}</div><p className="mt-2 text-sm text-zinc-400">Signal reçu</p></CardContent>
          </Card>
          <Card className="card-gradient">
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><Gauge size={18}/>SNR</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{metric(latest?.snr, " dB")}</div><p className="mt-2 text-sm text-zinc-400">Qualité radio</p></CardContent>
          </Card>
          <Card className="card-gradient">
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><Wifi size={18}/>Distance</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{metric(latest?.distance_km, " km")}</div><p className="mt-2 text-sm text-zinc-400">Estimation approximative</p></CardContent>
          </Card>
          <Card className="card-gradient">
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><Thermometer size={18}/>Température</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{metric(latest?.temperature, " °C")}</div><p className="mt-2 text-sm text-zinc-400">Option DHT11</p></CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity size={18}/>Historique</CardTitle>
            <CardDescription>Les 20 derniers messages reçus par le webhook/API.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-zinc-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900 text-zinc-400">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Device</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">RSSI</th>
                    <th className="p-3">SNR</th>
                    <th className="p-3">Distance</th>
                    <th className="p-3">Temp</th>
                    <th className="p-3">Hum</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr><td className="p-4 text-zinc-500" colSpan={8}>Aucune donnée pour l’instant. Envoie un POST sur /api/telemetry ou branche le webhook TTN.</td></tr>
                  ) : rows.map((row) => (
                    <tr key={row.id ?? row.created_at} className="border-t border-zinc-800">
                      <td className="p-3 text-zinc-400">{row.created_at ? new Date(row.created_at).toLocaleString("fr-FR") : "-"}</td>
                      <td className="p-3">{row.device_id}</td>
                      <td className="p-3"><Badge>{row.status ?? row.source ?? "-"}</Badge></td>
                      <td className="p-3">{metric(row.rssi, " dBm")}</td>
                      <td className="p-3">{metric(row.snr, " dB")}</td>
                      <td className="p-3">{metric(row.distance_km, " km")}</td>
                      <td className="p-3">{metric(row.temperature, " °C")}</td>
                      <td className="p-3">{metric(row.humidity, " %")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

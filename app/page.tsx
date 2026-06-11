"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	Activity,
	AlertTriangle,
	Database,
	Droplets,
	Gauge,
	Radio,
	RefreshCw,
	Thermometer,
	Wifi,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { Telemetry } from "@/lib/telemetry";
import { FirmwareToolsDialog } from "@/components/ui/FirmwareToolsDialog";

const REFRESH_INTERVAL_MS = 5000;

function metric(value: number | null | undefined, suffix: string, digits = 1) {
	if (value === null || value === undefined) return "N/A";

	if (Number.isInteger(value)) {
		return `${value}${suffix}`;
	}

	return `${Number(value).toFixed(digits)}${suffix}`;
}

function formatDate(value: string | null | undefined) {
	if (!value) return "-";

	return new Date(value).toLocaleString("fr-FR", {
		dateStyle: "short",
		timeStyle: "medium",
	});
}

function qualityFromRssi(rssi: number | null | undefined) {
	if (rssi === null || rssi === undefined) return "Aucune donnée";
	if (rssi >= -80) return "Très bon signal";
	if (rssi >= -95) return "Signal correct";
	if (rssi >= -110) return "Signal faible";
	return "Signal très faible";
}

function qualityBadgeClass(rssi: number | null | undefined) {
	if (rssi === null || rssi === undefined) {
		return "border-zinc-700 bg-zinc-800 text-zinc-300";
	}

	if (rssi >= -80) {
		return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
	}

	if (rssi >= -95) {
		return "border-blue-500/30 bg-blue-500/10 text-blue-300";
	}

	if (rssi >= -110) {
		return "border-orange-500/30 bg-orange-500/10 text-orange-300";
	}

	return "border-red-500/30 bg-red-500/10 text-red-300";
}

export default function Home() {
	const [rows, setRows] = useState<Telemetry[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
	const [error, setError] = useState<string | null>(null);

	const latest = rows[0];

	const loadTelemetry = useCallback(async () => {
		try {
			setRefreshing(true);
			setError(null);

			const response = await fetch("/api/telemetry?limit=20", {
				method: "GET",
				cache: "no-store",
			});

			const json = await response.json();

			if (!response.ok || !json.ok) {
				throw new Error(json?.error ?? "Erreur API telemetry");
			}

			setRows(json.data ?? []);
			setLastRefresh(new Date());
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erreur inconnue");
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, []);

	useEffect(() => {
		loadTelemetry();

		const interval = window.setInterval(() => {
			loadTelemetry();
		}, REFRESH_INTERVAL_MS);

		return () => window.clearInterval(interval);
	}, [loadTelemetry]);

	const radioQuality = useMemo(
		() => qualityFromRssi(latest?.rssi),
		[latest?.rssi],
	);

	return (
		<main className="min-h-screen px-4 py-8 sm:px-8">
			<div className="mx-auto max-w-6xl space-y-8">
				<section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div className="flex items-start gap-4">
						<div className="flex h-30 w-30 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-zinc-900/80 shadow-lg shadow-emerald-500/10 sm:h-30 sm:w-30">
							<Image
								src="/SAE%202.png"
								alt="Logo SAE"
								width={128}
								height={128}
								className="h-18 w-18 object-contain sm:h-18 sm:w-18"
								priority
							/>
						</div>

						<div>
							<Badge className="mb-3 border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
								LORA HIVE SAE S2 2024
							</Badge>

							<h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
								Dashboard couverture LoRa
							</h1>

							<p className="mt-3 max-w-2xl text-zinc-400">
								Suivi live des uplinks TTN, RSSI, SNR, distance
								estimée, température et humidité.
							</p>
						</div>
					</div>

					<div className="flex flex-col items-start gap-2 text-sm text-zinc-500 sm:items-end">
						<div>
							Dernière donnée :{" "}
							<span className="text-zinc-300">
								{latest?.created_at
									? formatDate(latest.created_at)
									: "aucune donnée"}
							</span>
						</div>

						<div>
							Dernier refresh :{" "}
							<span className="text-zinc-300">
								{lastRefresh
									? lastRefresh.toLocaleTimeString("fr-FR")
									: "-"}
							</span>
						</div>
						<div className="flex flex-wrap gap-2">
							<button
								type="button"
								onClick={loadTelemetry}
								disabled={refreshing}
								className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-zinc-300 transition hover:bg-zinc-900 disabled:opacity-50"
							>
								<RefreshCw
									size={16}
									className={refreshing ? "animate-spin" : ""}
								/>
								Refresh manuel
							</button>

							<FirmwareToolsDialog />
						</div>
					</div>
				</section>

				{error && (
					<Card className="border-red-500/30 bg-red-500/10">
						<CardContent className="flex items-center gap-3 p-4 text-red-200">
							<AlertTriangle size={18} />
							<span>{error}</span>
						</CardContent>
					</Card>
				)}

				<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
					<Card className="card-gradient">
						<CardHeader className="pb-2">
							<CardTitle className="flex items-center gap-2">
								<Radio size={18} />
								RSSI
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold">
								{metric(latest?.rssi, " dBm", 0)}
							</div>
							<p className="mt-2 text-sm text-zinc-400">
								{radioQuality}
							</p>
						</CardContent>
					</Card>

					<Card className="card-gradient">
						<CardHeader className="pb-2">
							<CardTitle className="flex items-center gap-2">
								<Gauge size={18} />
								SNR
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold">
								{metric(latest?.snr, " dB", 1)}
							</div>
							<p className="mt-2 text-sm text-zinc-400">
								Qualité radio
							</p>
						</CardContent>
					</Card>

					<Card className="card-gradient">
						<CardHeader className="pb-2">
							<CardTitle className="flex items-center gap-2">
								<Wifi size={18} />
								Distance
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold">
								{metric(latest?.distance_km, " km", 2)}
							</div>
							<p className="mt-2 text-sm text-zinc-400">
								Estimation approximative
							</p>
						</CardContent>
					</Card>

					<Card className="card-gradient">
						<CardHeader className="pb-2">
							<CardTitle className="flex items-center gap-2">
								<Thermometer size={18} />
								Température
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold">
								{metric(latest?.temperature, " °C", 1)}
							</div>
							<p className="mt-2 text-sm text-zinc-400">
								Capteur DHT11
							</p>
						</CardContent>
					</Card>

					<Card className="card-gradient">
						<CardHeader className="pb-2">
							<CardTitle className="flex items-center gap-2">
								<Droplets size={18} />
								Humidité
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold">
								{metric(latest?.humidity, " %", 1)}
							</div>
							<p className="mt-2 text-sm text-zinc-400">
								Capteur DHT11
							</p>
						</CardContent>
					</Card>
				</section>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Activity size={18} />
							Historique
						</CardTitle>
						<CardDescription>
							Les 20 derniers messages reçus par le webhook/API.
							Refresh auto toutes les {REFRESH_INTERVAL_MS / 1000}{" "}
							secondes.
						</CardDescription>
					</CardHeader>

					<CardContent>
						<div className="overflow-x-auto rounded-lg border border-zinc-800">
							<table className="w-full text-left text-sm">
								<thead className="bg-zinc-900 text-zinc-400">
									<tr>
										<th className="p-3">Date</th>
										<th className="p-3">Device</th>
										<th className="p-3">Counter</th>
										<th className="p-3">Status</th>
										<th className="p-3">RSSI</th>
										<th className="p-3">SNR</th>
										<th className="p-3">Distance</th>
										<th className="p-3">Temp</th>
										<th className="p-3">Hum</th>
										<th className="p-3">Source</th>
									</tr>
								</thead>

								<tbody>
									{loading ? (
										<tr>
											<td
												className="p-4 text-zinc-500"
												colSpan={10}
											>
												Chargement des données...
											</td>
										</tr>
									) : rows.length === 0 ? (
										<tr>
											<td
												className="p-4 text-zinc-500"
												colSpan={10}
											>
												Aucune donnée pour l’instant.
												Envoie un POST sur
												/api/telemetry ou branche le
												webhook TTN.
											</td>
										</tr>
									) : (
										rows.map((row) => (
											<tr
												key={
													row.id ??
													`${row.device_id}-${row.created_at}`
												}
												className="border-t border-zinc-800"
											>
												<td className="whitespace-nowrap p-3 text-zinc-400">
													{formatDate(row.created_at)}
												</td>

												<td className="whitespace-nowrap p-3">
													{row.device_id ?? "-"}
												</td>

												<td className="p-3">
													{row.counter ?? "-"}
												</td>

												<td className="p-3">
													<Badge
														className={qualityBadgeClass(
															row.rssi,
														)}
													>
														{row.status ?? "-"}
													</Badge>
												</td>

												<td className="p-3">
													{metric(
														row.rssi,
														" dBm",
														0,
													)}
												</td>
												<td className="p-3">
													{metric(row.snr, " dB", 1)}
												</td>
												<td className="p-3">
													{metric(
														row.distance_km,
														" km",
														2,
													)}
												</td>
												<td className="p-3">
													{metric(
														row.temperature,
														" °C",
														1,
													)}
												</td>
												<td className="p-3">
													{metric(
														row.humidity,
														" %",
														1,
													)}
												</td>
												<td className="p-3 text-zinc-400">
													{row.source ?? "-"}
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>

				<Card className="border-zinc-800 bg-zinc-950/50">
					<CardContent className="flex items-center gap-3 p-4 text-sm text-zinc-400">
						<Database size={18} />
						<span>
							Le dashboard lit <code>/api/telemetry</code> côté
							navigateur. La clé Supabase service role reste
							uniquement côté serveur.
						</span>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}

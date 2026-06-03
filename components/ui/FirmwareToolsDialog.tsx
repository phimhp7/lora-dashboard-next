"use client";

import { useEffect, useState } from "react";
import {
	AlertTriangle,
	Cable,
	CheckCircle2,
	Cpu,
	Settings,
	Upload,
	X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const ESP_WEB_TOOLS_SCRIPT =
	"https://unpkg.com/esp-web-tools@10/dist/web/install-button.js?module";

export function FirmwareToolsDialog() {
	const [open, setOpen] = useState(false);
	const [isSecure, setIsSecure] = useState(false);
	const [serialSupported, setSerialSupported] = useState(false);

	useEffect(() => {
		setIsSecure(window.isSecureContext);
		setSerialSupported("serial" in navigator);

		const alreadyLoaded = document.querySelector(
			`script[src="${ESP_WEB_TOOLS_SCRIPT}"]`,
		);

		if (alreadyLoaded) return;

		const script = document.createElement("script");
		script.type = "module";
		script.src = ESP_WEB_TOOLS_SCRIPT;
		document.body.appendChild(script);
	}, []);

	const canFlash = isSecure && serialSupported;

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900"
			>
				<Settings size={16} />
				Outils / Réglages
			</button>

			{open && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
					<div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
						<div className="flex items-start justify-between border-b border-zinc-800 p-5">
							<div>
								<div className="mb-2 flex items-center gap-2">
									<Cpu size={20} />
									<h2 className="text-xl font-semibold">
										Outils ESP32
									</h2>
								</div>

								<p className="text-sm text-zinc-400">
									Flash du firmware directement depuis le
									navigateur via USB.
								</p>
							</div>

							<button
								type="button"
								onClick={() => setOpen(false)}
								className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white"
							>
								<X size={18} />
							</button>
						</div>

						<div className="space-y-4 p-5">
							<div className="grid gap-3 sm:grid-cols-2">
								<Card className="border-zinc-800 bg-zinc-900/40">
									<CardContent className="flex items-center gap-3 p-4">
										{isSecure ? (
											<CheckCircle2
												className="text-emerald-400"
												size={20}
											/>
										) : (
											<AlertTriangle
												className="text-orange-400"
												size={20}
											/>
										)}

										<div>
											<p className="font-medium">
												HTTPS / contexte sécurisé
											</p>
											<p className="text-sm text-zinc-400">
												{isSecure
													? "OK"
													: "Nécessaire pour Web Serial"}
											</p>
										</div>
									</CardContent>
								</Card>

								<Card className="border-zinc-800 bg-zinc-900/40">
									<CardContent className="flex items-center gap-3 p-4">
										{serialSupported ? (
											<CheckCircle2
												className="text-emerald-400"
												size={20}
											/>
										) : (
											<AlertTriangle
												className="text-orange-400"
												size={20}
											/>
										)}

										<div>
											<p className="font-medium">
												Web Serial
											</p>
											<p className="text-sm text-zinc-400">
												{serialSupported
													? "Navigateur compatible"
													: "Utilise Chrome ou Edge"}
											</p>
										</div>
									</CardContent>
								</Card>
							</div>

							<div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
								<div className="mb-3 flex flex-wrap items-center gap-2">
									<Badge className="border-blue-500/30 bg-blue-500/10 text-blue-300">
										Firmware v1.0.0
									</Badge>

									<Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
										ESP32
									</Badge>

									<Badge className="border-purple-500/30 bg-purple-500/10 text-purple-300">
										DHT11 + LoRa-E5
									</Badge>
								</div>

								<p className="mb-4 text-sm text-zinc-400">
									Branche l’ESP32 en USB, clique sur le bouton
									ci-dessous, sélectionne le port série, puis
									lance l’installation. Si la carte ne passe
									pas en mode flash automatiquement, maintiens
									BOOT pendant la connexion.
								</p>

								<div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
									{canFlash ? (
										<esp-web-install-button manifest="/firmware/manifest.json">
											<button
												slot="activate"
												className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-black transition hover:bg-zinc-200"
											>
												<Upload size={16} />
												Flasher l’ESP32
											</button>

											<span
												slot="unsupported"
												className="text-sm text-red-300"
											>
												Navigateur non compatible avec
												Web Serial.
											</span>

											<span
												slot="not-allowed"
												className="text-sm text-red-300"
											>
												Page non sécurisée. Utilise
												HTTPS ou localhost.
											</span>
										</esp-web-install-button>
									) : (
										<div className="flex items-center gap-3 text-sm text-orange-300">
											<AlertTriangle size={18} />
											Flash indisponible sur ce navigateur
											ou cette page.
										</div>
									)}
								</div>
							</div>

							<div className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-400">
								<div className="mb-2 flex items-center gap-2 text-zinc-200">
									<Cable size={16} />
									Connexion
								</div>

								<ul className="list-inside list-disc space-y-1">
									<li>
										Utilise Chrome ou Edge sur ordinateur.
									</li>
									<li>Branche l’ESP32 en USB.</li>
									<li>
										Sélectionne le port USB série de
										l’ESP32.
									</li>
									<li>
										Le firmware utilisé est celui dans{" "}
										<code>/public/firmware/</code>.
									</li>
									<li>
										Cette action remplace le programme
										actuellement dans l’ESP.
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

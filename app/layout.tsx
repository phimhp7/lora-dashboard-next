import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Dashboard couverture LoRa",
	description:
		"Suivi live des uplinks TTN, RSSI, SNR, distance estimée, température et humidité.",
	icons: {
		icon: [
			{
				url: "/SAE%202.png",
				type: "image/png",
			},
		],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="fr" className="dark">
			<body>{children}</body>
		</html>
	);
}

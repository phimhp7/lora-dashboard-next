import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoRa Coverage Dashboard",
  description: "Dashboard de test couverture LoRa/TTN avec ESP32 + LoRa-E5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body>{children}</body>
    </html>
  );
}

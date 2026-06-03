# LoRa Coverage Dashboard — Next.js + Tailwind + shadcn-like UI

Dashboard de test pour ESP32 + LoRa-E5 + TTN.

## Lancer en local

```bash
npm install
npm run dev
```

Ouvre `http://localhost:3000`.

## Tester l'API sans TTN

Sans `INGEST_TOKEN` :

```bash
curl -X POST http://localhost:3000/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{"device_id":"esp32-lora-e5","counter":1,"status":"TX OK","rssi":-92,"snr":7.5,"temperature":23.4,"humidity":51}'
```

Avec `INGEST_TOKEN` :

```bash
curl -X POST http://localhost:3000/api/telemetry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer change-moi" \
  -d '{"device_id":"esp32-lora-e5","counter":1,"status":"TX OK","rssi":-92,"snr":7.5}'
```

## Stockage

- Sans Supabase : stockage mémoire uniquement, pratique en local, pas fiable sur Vercel.
- Avec Supabase : exécute `supabase.sql`, puis ajoute `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` dans les variables d'environnement Vercel.

## TTN Webhook

Dans The Things Stack / TTN :

- Integrations → Webhooks → Add webhook
- Format : JSON
- Base URL : `https://ton-projet.vercel.app`
- Uplink path : `/api/telemetry`
- Header optionnel : `Authorization: Bearer change-moi`

Le code accepte aussi les payloads directs envoyés en JSON.

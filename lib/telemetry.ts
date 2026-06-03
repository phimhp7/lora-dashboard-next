export type Telemetry = {
  id?: string;
  device_id: string;
  counter?: number | null;
  status?: string | null;
  rssi?: number | null;
  snr?: number | null;
  distance_km?: number | null;
  temperature?: number | null;
  humidity?: number | null;
  payload_raw?: string | null;
  source?: string | null;
  created_at?: string;
};

export function estimateDistanceKmFromRssi(rssi: number, txPowerDbm = 14, freqMhz = 868) {
  const pathLoss = txPowerDbm - rssi;
  const exponent = (pathLoss - 32.44 - 20 * Math.log10(freqMhz)) / 20;
  return Number(Math.pow(10, exponent).toFixed(3));
}

function bestGatewayMetrics(rxMetadata: any[] | undefined) {
  if (!Array.isArray(rxMetadata) || rxMetadata.length === 0) return { rssi: null, snr: null };

  const sorted = [...rxMetadata].sort((a, b) => (b.rssi ?? -999) - (a.rssi ?? -999));
  const best = sorted[0];
  return {
    rssi: typeof best?.rssi === "number" ? best.rssi : null,
    snr: typeof best?.snr === "number" ? best.snr : null,
  };
}

export function normalizeTelemetry(body: any): Telemetry {
  const isTtn = Boolean(body?.uplink_message);

  if (isTtn) {
    const uplink = body.uplink_message;
    const decoded = uplink.decoded_payload ?? {};
    const metrics = bestGatewayMetrics(uplink.rx_metadata);
    const rssi = typeof decoded.rssi === "number" ? decoded.rssi : metrics.rssi;
    const snr = typeof decoded.snr === "number" ? decoded.snr : metrics.snr;

    return {
      device_id: body.end_device_ids?.device_id ?? "ttn-device",
      counter: typeof uplink.f_cnt === "number" ? uplink.f_cnt : null,
      status: "TTN UPLINK",
      rssi,
      snr,
      distance_km:
        typeof decoded.distance_km === "number"
          ? decoded.distance_km
          : typeof rssi === "number"
            ? estimateDistanceKmFromRssi(rssi)
            : null,
      temperature: typeof decoded.temperature === "number" ? decoded.temperature : null,
      humidity: typeof decoded.humidity === "number" ? decoded.humidity : null,
      payload_raw: uplink.frm_payload ?? null,
      source: "ttn-webhook",
    };
  }

  const rssi = typeof body.rssi === "number" ? body.rssi : null;

  return {
    device_id: body.device_id ?? body.deviceId ?? "esp32-lora-e5",
    counter: typeof body.counter === "number" ? body.counter : null,
    status: body.status ?? "DIRECT POST",
    rssi,
    snr: typeof body.snr === "number" ? body.snr : null,
    distance_km:
      typeof body.distance_km === "number"
        ? body.distance_km
        : typeof body.distanceKm === "number"
          ? body.distanceKm
          : typeof rssi === "number"
            ? estimateDistanceKmFromRssi(rssi)
            : null,
    temperature: typeof body.temperature === "number" ? body.temperature : null,
    humidity: typeof body.humidity === "number" ? body.humidity : null,
    payload_raw: body.payload_raw ?? body.payload ?? null,
    source: "direct-http",
  };
}

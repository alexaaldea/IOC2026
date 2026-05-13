// Real ambient + track weather for the current Grand Prix venue.
// Uses Open-Meteo (no API key required, free, CORS-enabled).

export type TrackWeather = {
  venue: string;
  airTempC: number;       // ambient air temperature
  trackTempC: number;     // estimated track surface temp (air + solar offset)
  windKph: number;
  humidity: number;       // %
  rainMmH: number;        // precipitation rate
  updatedAt: number;
  stale: boolean;
};

// Default venue: Autodromo Nazionale Monza (Italian GP).
const VENUE = { name: "MONZA", lat: 45.6156, lon: 9.2811 };

const URL =
  `https://api.open-meteo.com/v1/forecast` +
  `?latitude=${VENUE.lat}&longitude=${VENUE.lon}` +
  `&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,shortwave_radiation` +
  `&wind_speed_unit=kmh&timezone=auto`;

export async function fetchTrackWeather(): Promise<TrackWeather> {
  const r = await fetch(URL);
  if (!r.ok) throw new Error(`weather ${r.status}`);
  const j = await r.json();
  const c = j.current ?? {};
  const air = Number(c.temperature_2m ?? 22);
  const sun = Number(c.shortwave_radiation ?? 0); // W/m²
  // Empirical: tarmac runs ~10–25°C above air on a sunny day.
  const trackTempC = air + Math.min(28, sun * 0.025);
  return {
    venue: VENUE.name,
    airTempC: Math.round(air * 10) / 10,
    trackTempC: Math.round(trackTempC * 10) / 10,
    windKph: Math.round(Number(c.wind_speed_10m ?? 0)),
    humidity: Math.round(Number(c.relative_humidity_2m ?? 0)),
    rainMmH: Number(c.precipitation ?? 0),
    updatedAt: Date.now(),
    stale: false,
  };
}

import { useEffect, useState } from 'react';
import type { Weather } from '../components/Seasonal/SeasonalOverlay';

/** Vast fallback-punt (Utrecht) als locatie niet beschikbaar is. */
const DEFAULT_LAT = 52.0907;
const DEFAULT_LON = 5.1214;
const CACHE_KEY = 'weer-cache';
const CACHE_TTL_MS = 30 * 60 * 1000;

const readCachedWeather = (): Weather => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ts: number; weather: Weather };
    if (Date.now() - parsed.ts > 6 * CACHE_TTL_MS) return null;
    return parsed.weather;
  } catch {
    return null;
  }
};

const cacheWeather = (weather: Weather) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), weather }));
  } catch {
    /* cache is optioneel */
  }
};

/** WMO-codes: regen 51–67/80–82/95–99, sneeuw 71–77/85–86. */
const weatherCodeToWeather = (code: number): Weather => {
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'sneeuw';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) return 'regen';
  return null;
};

const readLocation = (): { lat: number; lon: number } | null => {
  const value = new URLSearchParams(window.location.search).get('loc');
  if (!value) return null;
  const [lat, lon] = value.split(',').map(Number);
  if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };
  return null;
};

const fetchWeather = async (lat: number, lon: number): Promise<Weather> => {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code`,
  );
  if (!response.ok) return null;
  const data = (await response.json()) as { current?: { weather_code?: number } };
  const code = data.current?.weather_code;
  return code === undefined ? null : weatherCodeToWeather(code);
};

/**
 * Live weer via Open-Meteo (gratis, zonder API-sleutel). Locatie: `?loc=lat,lon`,
 * anders browser-geolocatie, anders Utrecht. Elke 30 minuten ververst.
 */
export const useWeather = (): Weather => {
  const [weather, setWeather] = useState<Weather>(readCachedWeather);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      let lat = DEFAULT_LAT;
      let lon = DEFAULT_LON;
      const fixed = readLocation();
      if (fixed) {
        lat = fixed.lat;
        lon = fixed.lon;
      } else if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition | null>((resolve) => {
          navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), {
            timeout: 5000,
          });
        });
        if (position) {
          lat = position.coords.latitude;
          lon = position.coords.longitude;
        }
      }
      try {
        const result = await fetchWeather(lat, lon);
        if (cancelled || result === null) return;
        setWeather(result);
        cacheWeather(result);
      } catch {
        /* geen netwerk: houd de cache */
      }
    };

    void load();
    const id = setInterval(load, CACHE_TTL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return weather;
};

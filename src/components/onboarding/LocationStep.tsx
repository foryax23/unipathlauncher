import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { reverseGeocode, forwardGeocode } from "@/lib/geocode.functions";
import { CAMPUSES } from "@/components/marketing/data/courses";
import { MapPin, LocateFixed, Search } from "lucide-react";

type Loc = { lat: number; lng: number; city: string | null };

export function LocationStep({
  value,
  onChange,
}: {
  value: Loc | null;
  onChange: (v: Loc) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<any>(null);
  const userMarker = useRef<any>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ label: string; lat: number; lng: number }[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const reverse = useServerFn(reverseGeocode);
  const forward = useServerFn(forwardGeocode);

  // Lazy-init Leaflet (browser only)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !mapRef.current || mapObj.current) return;
      const start = value ?? { lat: 54.5, lng: -3, city: null };
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([start.lat, start.lng], value ? 10 : 5);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 18,
      }).addTo(map);
      // Campus markers
      CAMPUSES.forEach((c) => {
        L.circleMarker([c.lat, c.lng], {
          radius: 6,
          color: "#e8b84b",
          fillColor: "#e8b84b",
          fillOpacity: 0.85,
          weight: 2,
        }).addTo(map).bindTooltip(c.city);
      });
      if (value) placeUser(L, map, value.lat, value.lng);
      mapObj.current = { L, map };
    })();
    return () => {
      cancelled = true;
      if (mapObj.current?.map) {
        mapObj.current.map.remove();
        mapObj.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function placeUser(L: any, map: any, lat: number, lng: number) {
    if (userMarker.current) userMarker.current.remove();
    userMarker.current = L.circleMarker([lat, lng], {
      radius: 10,
      color: "#0f2b5b",
      fillColor: "#0f2b5b",
      fillOpacity: 0.9,
      weight: 3,
    }).addTo(map);
    map.flyTo([lat, lng], 10, { duration: 0.8 });
  }

  async function pick(lat: number, lng: number) {
    const { city } = await reverse({ data: { lat, lng } });
    const next = { lat, lng, city };
    onChange(next);
    if (mapObj.current) placeUser(mapObj.current.L, mapObj.current.map, lat, lng);
  }

  async function useDevice() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await pick(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  async function search(q: string) {
    setQuery(q);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const { results } = await forward({ data: { q } });
    setResults(results);
    setSearching(false);
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder="Search a UK city or postcode"
          className="tap w-full rounded-2xl border border-input bg-background pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        {results.length > 0 && (
          <ul className="absolute z-10 mt-2 max-h-56 w-full overflow-auto rounded-2xl border border-border bg-popover p-1 shadow-xl">
            {results.map((r) => (
              <li key={`${r.lat}-${r.lng}`}>
                <button
                  type="button"
                  onClick={() => {
                    setResults([]);
                    setQuery(r.label.split(",")[0]);
                    pick(r.lat, r.lng);
                  }}
                  className="tap flex w-full items-start gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  <MapPin className="mt-0.5 size-4 text-gold" />
                  <span className="line-clamp-2">{r.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {searching && (
          <p className="mt-2 text-xs text-muted-foreground">Searching…</p>
        )}
      </div>

      <button
        type="button"
        onClick={useDevice}
        disabled={locating}
        className="tap inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
      >
        <LocateFixed className="size-4" />
        {locating ? "Locating…" : "Use my current location"}
      </button>

      <div
        ref={mapRef}
        className="h-72 w-full overflow-hidden rounded-3xl border border-border bg-surface-muted"
      />

      {value && (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Selected</p>
          <p className="mt-1 font-medium text-foreground">
            {value.city ?? `${value.lat.toFixed(2)}, ${value.lng.toFixed(2)}`}
          </p>
          <NearestCampuses lat={value.lat} lng={value.lng} />
        </div>
      )}
    </div>
  );
}

function NearestCampuses({ lat, lng }: { lat: number; lng: number }) {
  const sorted = [...CAMPUSES]
    .map((c) => ({ ...c, km: haversine(lat, lng, c.lat, c.lng) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, 3);
  return (
    <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
      {sorted.map((c) => (
        <li key={c.city} className="flex justify-between">
          <span>{c.city} campus</span>
          <span className="font-mono text-xs">{Math.round(c.km)} km</span>
        </li>
      ))}
    </ul>
  );
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

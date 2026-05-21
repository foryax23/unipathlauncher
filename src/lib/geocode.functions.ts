import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const UA = "Bridge Gateway/1.0 (uk-student-leadgen)";

export const reverseGeocode = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${data.lat}&lon=${data.lng}&zoom=10&addressdetails=1`,
        { headers: { "User-Agent": UA, Accept: "application/json" } },
      );
      if (!res.ok) return { city: null, country: null };
      const j = (await res.json()) as { address?: Record<string, string> };
      const a = j.address ?? {};
      const city = a.city ?? a.town ?? a.village ?? a.county ?? null;
      const country = a.country ?? null;
      return { city, country };
    } catch {
      return { city: null, country: null };
    }
  });

export const forwardGeocode = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ q: z.string().trim().min(2).max(120) }).parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=gb&limit=5&q=${encodeURIComponent(data.q)}`,
        { headers: { "User-Agent": UA, Accept: "application/json" } },
      );
      if (!res.ok) return { results: [] };
      const j = (await res.json()) as Array<{
        display_name: string;
        lat: string;
        lon: string;
      }>;
      return {
        results: j.map((r) => ({
          label: r.display_name,
          lat: Number(r.lat),
          lng: Number(r.lon),
        })),
      };
    } catch {
      return { results: [] };
    }
  });

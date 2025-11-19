"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import mapboxgl, { type AnyLayer, type GeoJSONSource } from "mapbox-gl";
import type { FeatureCollection, Point } from "geojson";
import type { Lead } from "@/types";

const MAPBOX_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.MAPBOX_TOKEN || "pk.test-token";

mapboxgl.accessToken = MAPBOX_TOKEN;

const heatmapLayer: AnyLayer = {
  id: "lead-heat",
  type: "heatmap",
  source: "leads",
  maxzoom: 15,
  paint: {
    "heatmap-weight": ["interpolate", ["linear"], ["get", "score"], 60, 0, 100, 1],
    "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0,
      "rgba(33,102,172,0)",
      0.2,
      "rgb(103,169,207)",
      0.4,
      "rgb(209,229,240)",
      0.6,
      "rgb(253,219,199)",
      0.8,
      "rgb(239,138,98)",
      1,
      "rgb(178,24,43)",
    ],
    "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 8, 20, 14, 40],
  },
};

function buildGeoJSON(leads: Lead[]): FeatureCollection<Point, { score: number }> {
  return {
    type: "FeatureCollection",
    features: leads
      .filter((lead) => lead.lat !== null && lead.lng !== null)
      .map((lead) => ({
        type: "Feature",
        properties: {
          score: lead.opportunity_score,
        },
        geometry: {
          type: "Point",
          coordinates: [lead.lng!, lead.lat!],
        },
      })),
  };
}

export function LeadMap({ leads = [] }: { leads?: Lead[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const dataRef = useRef(buildGeoJSON(leads));

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-117.1611, 32.7157],
      zoom: 10.5,
    });
    mapRef.current.on("load", () => {
      mapRef.current?.addSource("leads", {
        type: "geojson",
        data: dataRef.current,
      });
      mapRef.current?.addLayer(heatmapLayer);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    dataRef.current = buildGeoJSON(leads);
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource("leads") as GeoJSONSource | undefined;
    if (source) {
      source.setData(dataRef.current);
    }
  }, [leads]);

  return (
    <Card className="h-[500px] overflow-hidden rounded-3xl border-white/10 bg-white/[0.02]">
      <div ref={containerRef} className="h-full w-full" />
    </Card>
  );
}

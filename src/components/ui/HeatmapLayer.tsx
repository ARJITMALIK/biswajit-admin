import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

interface HeatmapLayerProps {
    points: Array<[number, number, number]>; // [lat, lng, intensity]
    options?: {
        minOpacity?: number;
        maxZoom?: number;
        max?: number;
        radius?: number;
        blur?: number;
        gradient?: { [key: number]: string };
    };
}

export default function HeatmapLayer({ points, options }: HeatmapLayerProps) {
    const map = useMap();

    useEffect(() => {
        if (!points || points.length === 0) return;

        // @ts-ignore
        const heatLayer = L.heatLayer(points, options).addTo(map);

        return () => {
            map.removeLayer(heatLayer);
        };
    }, [map, points, options]);

    return null;
}

import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ElectionResult, Mla } from '../../types';
import SearchableSelect from './SearchableSelect';
import { HiOutlineUserGroup, HiOutlineMapPin } from 'react-icons/hi2';

interface ResultsMapProps {
    results: ElectionResult[];
    mlas: Mla[];
}

function MapUpdater({ mapData }: { mapData: any[] }) {
    const map = useMap();

    useEffect(() => {
        if (mapData.length > 0) {
            const bounds = L.latLngBounds(mapData.map(r => [Number(r.latitude), Number(r.longitude)]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
        }
    }, [mapData, map]);

    return null;
}

export default function ResultsMap({ results, mlas }: ResultsMapProps) {
    const [selectedMlaId, setSelectedMlaId] = useState<string>('');

    // Filter results for the selected MLA and only those with valid coordinates
    const mapData = useMemo(() => {
        if (!selectedMlaId) return [];
        return results.filter(r => {
            if (r.mla_id !== selectedMlaId) return false;
            if (r.latitude == null || r.longitude == null) return false;
            const lat = Number(r.latitude);
            const lng = Number(r.longitude);
            return !isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0);
        });
    }, [results, selectedMlaId]);

    const selectedMla = useMemo(() => mlas.find(m => m.id === selectedMlaId), [mlas, selectedMlaId]);

    // Calculate map center (default to Assam roughly if no data, otherwise average of points)
    const center: [number, number] = useMemo(() => {
        if (mapData.length === 0) return [26.1445, 91.7362]; // Default to Guwahati
        const avgLat = mapData.reduce((sum, r) => sum + Number(r.latitude), 0) / mapData.length;
        const avgLng = mapData.reduce((sum, r) => sum + Number(r.longitude), 0) / mapData.length;
        return [avgLat, avgLng];
    }, [mapData]);

    // Calculate maximum votes for dynamic bubble sizing
    const maxVotes = useMemo(() => {
        if (results.length === 0) return 0;
        return Math.max(...results.map(r => r.votes_gained || 0));
    }, [results]);

    return (
        <div className="space-y-3 relative">
            <div className="flex flex-col md:flex-row md:items-center gap-3 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm relative z-50">
                <div className="w-full md:w-1/3 space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select MLA to Visualize</label>
                    <SearchableSelect
                        options={mlas.map(m => ({ id: m.id, label: `${m.name} (${m.party_abbreviation || 'No Party'})` }))}
                        value={selectedMlaId}
                        onChange={setSelectedMlaId}
                        placeholder="Search MLA..."
                    />
                </div>
                
                {selectedMla && (
                    <div className="flex-1 flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        {selectedMla.image_url ? (
                            <img src={selectedMla.image_url} alt={selectedMla.name} className="w-12 h-12 rounded-full object-cover shadow-sm border-2 border-white" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border-2 border-slate-100">
                                <HiOutlineUserGroup className="w-6 h-6" />
                            </div>
                        )}
                        <div>
                            <h3 className="font-bold text-slate-800">{selectedMla.name}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase text-white shadow-sm" style={{ backgroundColor: selectedMla.party_color || '#64748b' }}>
                                    {selectedMla.party_abbreviation || selectedMla.party_name || 'Independent'}
                                </span>
                                <span className="text-xs font-bold text-slate-500">
                                    Total Booths mapped: <span className="text-brand-600">{mapData.length}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 relative h-[70vh] z-0">
                {!selectedMlaId ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 z-10">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg text-slate-400 mb-4">
                            <HiOutlineMapPin className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-black text-slate-700">Select an MLA</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">Choose an MLA from the dropdown to view their booth-wise results on the map.</p>
                    </div>
                ) : mapData.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 z-10">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg text-slate-400 mb-4">
                            <HiOutlineMapPin className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-black text-slate-700">No Geodata Available</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">None of the booths assigned to this MLA have coordinates.</p>
                    </div>
                ) : null}

                {/* React-Leaflet Map */}
                <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }}>
                    <MapUpdater mapData={mapData} />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {mapData.map((result) => {
                        const lat = Number(result.latitude);
                        const lng = Number(result.longitude);
                        const color = selectedMla?.party_color || '#3B82F6';
                        
                        let radius = 6;
                        if (maxVotes > 0 && result.votes_gained) {
                            // Scale area proportionally: Math.sqrt(votes) / Math.sqrt(max)
                            const scale = Math.sqrt(result.votes_gained) / Math.sqrt(maxVotes);
                            radius = 6 + (scale * 34); // Min 6px, Max 40px
                        }
                        
                        return (
                            <CircleMarker 
                                key={result.id} 
                                center={[lat, lng]} 
                                pathOptions={{ 
                                    color: color, 
                                    fillColor: color, 
                                    fillOpacity: 0.7, 
                                    weight: 2 
                                }}
                                radius={radius}
                            >
                                <Tooltip direction="top" offset={[0, -10]} opacity={1} className="!p-0 !border-0 !bg-transparent !shadow-none">
                                    <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-4 min-w-[200px]">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Booth #{result.booth_no}</div>
                                        <div className="font-bold text-slate-800 text-sm leading-tight mb-3">{result.booth_name}</div>
                                        <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-500">Votes</span>
                                            <span className="font-black text-lg" style={{ color: color }}>
                                                {result.votes_gained?.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </Tooltip>
                            </CircleMarker>
                        );
                    })}
                </MapContainer>
            </div>
        </div>
    );
}

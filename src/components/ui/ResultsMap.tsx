import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ElectionResult, Mla } from '../../types';
import SearchableSelect from './SearchableSelect';
import { HiOutlineUserGroup, HiOutlineMapPin, HiOutlineArrowsRightLeft } from 'react-icons/hi2';
import HeatmapLayer from './HeatmapLayer';

type FilterType = 'all' | 'max' | 'least' | 'compare_max' | 'compare_least';

interface ResultsMapProps {
    results: ElectionResult[];
    mlas: Mla[];
}

function MapUpdater({ mapData, compareData }: { mapData: any[], compareData: any[] }) {
    const map = useMap();
    useEffect(() => {
        const combined = [...mapData, ...compareData];
        if (combined.length > 0) {
            const bounds = L.latLngBounds(combined.map(r => [Number(r.latitude), Number(r.longitude)]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
        }
    }, [mapData, compareData, map]);
    return null;
}

export default function ResultsMap({ results, mlas }: ResultsMapProps) {
    const [selectedMlaId, setSelectedMlaId] = useState<string>('');
    const [compareMlaId, setCompareMlaId] = useState<string>('');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [isCompareMode, setIsCompareMode] = useState(false);

    const selectedMla = useMemo(() => mlas.find(m => m.id === selectedMlaId), [mlas, selectedMlaId]);
    const compareMla = useMemo(() => mlas.find(m => m.id === compareMlaId), [mlas, compareMlaId]);

    // Group all results by booth
    const boothGroups = useMemo(() => {
        const groups = new Map<string, ElectionResult[]>();
        for (const r of results) {
            if (!r.latitude || !r.longitude) continue;
            if (!groups.has(r.booth_id)) groups.set(r.booth_id, []);
            groups.get(r.booth_id)!.push(r);
        }
        return groups;
    }, [results]);

    // All booths for MLA 1
    const allData1 = useMemo(() => {
        if (!selectedMlaId) return [];
        return Array.from(boothGroups.values()).map(bg => bg.find(r => r.mla_id === selectedMlaId)).filter(Boolean) as ElectionResult[];
    }, [boothGroups, selectedMlaId]);

    // All booths for MLA 2
    const allData2 = useMemo(() => {
        if (!compareMlaId) return [];
        return Array.from(boothGroups.values()).map(bg => bg.find(r => r.mla_id === compareMlaId)).filter(Boolean) as ElectionResult[];
    }, [boothGroups, compareMlaId]);

    // Filter results for the selected MLA(s) based on the filterType
    const { mapData, compareData } = useMemo(() => {
        if (!selectedMlaId) return { mapData: [], compareData: [] };

        if (!isCompareMode) {
            if (filterType === 'all') {
                return { mapData: allData1, compareData: [] };
            } else if (filterType === 'max') {
                const maxVotes = Math.max(...allData1.map(r => r.votes_gained || 0));
                return { mapData: allData1.filter(r => r.votes_gained === maxVotes), compareData: [] };
            } else if (filterType === 'least') {
                const minVotes = Math.min(...allData1.map(r => r.votes_gained || 0));
                return { mapData: allData1.filter(r => r.votes_gained === minVotes), compareData: [] };
            }
        } else {
            // Compare Mode
            if (!compareMlaId) return { mapData: [], compareData: [] };
            
            const attachCounterpart = (dataArr: ElectionResult[], counterpartMlaId: string) => {
                return dataArr.map(r => {
                    const bg = boothGroups.get(r.booth_id) || [];
                    const counterpart = bg.find(c => c.mla_id === counterpartMlaId);
                    return { ...r, _compare_votes: counterpart?.votes_gained || 0 };
                });
            };

            const data1WithComp = attachCounterpart(allData1, compareMlaId);
            const data2WithComp = attachCounterpart(allData2, selectedMlaId);

            if (filterType === 'all') {
                return { mapData: data1WithComp, compareData: data2WithComp };
            } else if (filterType === 'compare_max') {
                const max1 = Math.max(...data1WithComp.map(r => r.votes_gained || 0));
                const max2 = Math.max(...data2WithComp.map(r => r.votes_gained || 0));
                return { 
                    mapData: data1WithComp.filter(r => r.votes_gained === max1), 
                    compareData: data2WithComp.filter(r => r.votes_gained === max2) 
                };
            } else if (filterType === 'compare_least') {
                const min1 = Math.min(...data1WithComp.map(r => r.votes_gained || 0));
                const min2 = Math.min(...data2WithComp.map(r => r.votes_gained || 0));
                return { 
                    mapData: data1WithComp.filter(r => r.votes_gained === min1), 
                    compareData: data2WithComp.filter(r => r.votes_gained === min2) 
                };
            }
        }
        return { mapData: [], compareData: [] };
    }, [allData1, allData2, boothGroups, selectedMlaId, compareMlaId, filterType, isCompareMode]);

    // Calculate map center
    const center: [number, number] = useMemo(() => {
        const combined = [...mapData, ...compareData];
        if (combined.length === 0) return [26.1445, 91.7362]; // Default to Guwahati
        const avgLat = combined.reduce((sum, r) => sum + Number(r.latitude), 0) / combined.length;
        const avgLng = combined.reduce((sum, r) => sum + Number(r.longitude), 0) / combined.length;
        return [avgLat, avgLng];
    }, [mapData, compareData]);

    const maxVotes1 = useMemo(() => Math.max(0, ...allData1.map(r => r.votes_gained ?? 0)), [allData1]);
    const maxVotes2 = useMemo(() => Math.max(0, ...allData2.map(r => r.votes_gained ?? 0)), [allData2]);

    const heatmapPoints1: Array<[number, number, number]> = useMemo(() => {
        return allData1.map(r => [Number(r.latitude), Number(r.longitude), Math.sqrt(r.votes_gained ?? 0)]);
    }, [allData1]);
    
    const heatmapPoints2: Array<[number, number, number]> = useMemo(() => {
        return allData2.map(r => [Number(r.latitude), Number(r.longitude), Math.sqrt(r.votes_gained ?? 0)]);
    }, [allData2]);

    return (
        <div className="space-y-3 relative">
            <div className="flex flex-col gap-3 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm relative z-50">
                
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="w-full md:w-1/3 space-y-3">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select Primary MLA</label>
                            <SearchableSelect
                                options={mlas.map(m => ({ id: m.id, label: `${m.name} (${m.party_abbreviation || 'No Party'})` }))}
                                value={selectedMlaId}
                                onChange={setSelectedMlaId}
                                placeholder="Search MLA..."
                            />
                        </div>
                        
                        <div className="flex bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
                            {!isCompareMode ? (
                                <>
                                    <button onClick={() => setFilterType('all')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'all' ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-700'}`}>All (Heatmap)</button>
                                    <button onClick={() => setFilterType('max')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'max' ? 'bg-white text-emerald-600 shadow' : 'text-slate-500 hover:text-slate-700'}`}>Max Vote Booth</button>
                                    <button onClick={() => setFilterType('least')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'least' ? 'bg-white text-rose-600 shadow' : 'text-slate-500 hover:text-slate-700'}`}>Least Vote Booth</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setFilterType('compare_max')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'compare_max' ? 'bg-white text-emerald-600 shadow' : 'text-slate-500 hover:text-slate-700'}`}>Compare Max Votes</button>
                                    <button onClick={() => setFilterType('compare_least')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'compare_least' ? 'bg-white text-rose-600 shadow' : 'text-slate-500 hover:text-slate-700'}`}>Compare Least Votes</button>
                                </>
                            )}
                            <button onClick={() => { setIsCompareMode(!isCompareMode); setFilterType(isCompareMode ? 'all' : 'compare_max'); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ml-1 ${isCompareMode ? 'bg-brand-500 text-white shadow' : 'text-brand-500 hover:bg-brand-50 border border-brand-200'}`}><HiOutlineArrowsRightLeft className="w-3 h-3"/> Compare Mode</button>
                        </div>
                    </div>

                    {isCompareMode && (
                        <div className="w-full md:w-1/3 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Compare With MLA</label>
                            <SearchableSelect
                                options={mlas.filter(m => m.id !== selectedMlaId).map(m => ({ id: m.id, label: `${m.name} (${m.party_abbreviation || 'No Party'})` }))}
                                value={compareMlaId}
                                onChange={setCompareMlaId}
                                placeholder="Search 2nd MLA..."
                            />
                        </div>
                    )}
                </div>
                
                {(selectedMla || compareMla) && (
                    <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100">
                        {selectedMla && (
                            <div className="flex-1 min-w-[250px] flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                                {selectedMla.image_url ? (
                                    <img src={selectedMla.image_url} alt={selectedMla.name} className="w-10 h-10 rounded-full object-cover shadow-sm border-2 border-white" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border-2 border-slate-100">
                                        <HiOutlineUserGroup className="w-5 h-5" />
                                    </div>
                                )}
                                <div>
                                    <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Primary {filterType === 'all' && '(Heatmap)'}</div>
                                    <h3 className="font-bold text-slate-800 leading-tight">{selectedMla.name}</h3>
                                    <div className="text-xs font-bold text-slate-500 mt-0.5">
                                        Max: <span className="text-emerald-600">{maxVotes1.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isCompareMode && compareMla && (
                            <div className="flex-1 min-w-[250px] flex items-center gap-3 p-3 rounded-2xl bg-rose-50/50 border border-rose-100">
                                {compareMla.image_url ? (
                                    <img src={compareMla.image_url} alt={compareMla.name} className="w-10 h-10 rounded-full object-cover shadow-sm border-2 border-white" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border-2 border-slate-100">
                                        <HiOutlineUserGroup className="w-5 h-5" />
                                    </div>
                                )}
                                <div>
                                    <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Compared</div>
                                    <h3 className="font-bold text-slate-800 leading-tight">{compareMla.name}</h3>
                                    <div className="text-xs font-bold text-slate-500 mt-0.5">
                                        Max: <span className="text-rose-600">{maxVotes2.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 relative h-[65vh] z-0">
                {!selectedMlaId ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 z-10">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg text-slate-400 mb-4">
                            <HiOutlineMapPin className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-black text-slate-700">Select an MLA</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">Choose an MLA from the dropdown to view their booth-wise results on the map.</p>
                    </div>
                ) : (mapData.length === 0 && compareData.length === 0) ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 z-10">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg text-slate-400 mb-4">
                            <HiOutlineMapPin className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-black text-slate-700">No Booths Match Filter</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">No geodata matches the current selection and filter criteria.</p>
                    </div>
                ) : null}

                {/* React-Leaflet Map */}
                <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }}>
                    <MapUpdater mapData={mapData} compareData={compareData} />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {filterType === 'all' && !isCompareMode && (
                        <HeatmapLayer 
                            points={heatmapPoints1} 
                            options={{ 
                                max: maxVotes1 > 0 ? Math.sqrt(maxVotes1) : 1, 
                                radius: 35, 
                                blur: 25, 
                                maxZoom: 13,
                                gradient: {
                                    0.2: '#4ade80', // green-400
                                    0.4: '#22c55e', // green-500
                                    0.6: '#15803d', // green-700
                                    0.8: '#14532d', // green-900
                                    1.0: '#052e16'  // green-950
                                }
                            }} 
                        />
                    )}

                    {/* Show invisible markers for tooltips in Heatmap mode, or visible dots for filter modes */}
                    {[...mapData, ...compareData].map((result, idx) => {
                        const lat = Number(result.latitude);
                        const lng = Number(result.longitude);
                        const isPrimary = idx < mapData.length;
                        
                        const mlaData = isPrimary ? selectedMla : compareMla;
                        const isDotVisible = filterType !== 'all';
                        
                        return (
                            <CircleMarker 
                                key={result.id + (isPrimary ? '_1' : '_2')} 
                                center={[lat, lng]} 
                                pathOptions={{ 
                                    color: isDotVisible ? (isPrimary ? '#10b981' : '#f43f5e') : 'transparent', // emerald or rose
                                    fillColor: isDotVisible ? (isPrimary ? '#10b981' : '#f43f5e') : 'transparent',
                                    fillOpacity: isDotVisible ? 0.9 : 0,
                                    weight: isDotVisible ? 2 : 0
                                }}
                                radius={isDotVisible ? 12 : 10}
                            >
                                <Tooltip direction="top" offset={[0, -10]} opacity={1} className="!p-0 !border-0 !bg-transparent !shadow-none">
                                    <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-4 min-w-[200px]">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Booth #{result.booth_no}</div>
                                        <div className="font-bold text-slate-800 text-sm leading-tight mb-3">{result.booth_name}</div>
                                        {isCompareMode ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-bold text-slate-500">{isPrimary ? selectedMla?.name : compareMla?.name} (Dot Owner)</span>
                                                    <span className={`font-black ${isPrimary ? 'text-emerald-600' : 'text-rose-600'}`}>{result.votes_gained?.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-medium text-slate-400">{isPrimary ? compareMla?.name : selectedMla?.name}</span>
                                                    <span className="font-bold text-slate-400">{(result as any)._compare_votes?.toLocaleString() || '0'}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-500">{mlaData?.name}</span>
                                                <span className={`font-black text-lg ${isPrimary ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {result.votes_gained?.toLocaleString()}
                                                </span>
                                            </div>
                                        )}
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

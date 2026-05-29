import { useState, useEffect, useMemo } from 'react';
import { HiOutlineFlag, HiOutlineUserGroup, HiOutlineMapPin, HiOutlineTrophy, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiMagnifyingGlass, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';
import { resultsApi } from '../../api/results';
import { PoliticalParty, Mla, ElectionResult, Constituency } from '../../types';
import FileUpload from '../../components/ui/FileUpload';
import SearchableSelect from '../../components/ui/SearchableSelect';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ResultsMap from '../../components/ui/ResultsMap';
import toast from 'react-hot-toast';

type Tab = 'parties' | 'mlas' | 'booths' | 'results' | 'map';

export default function ResultsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('parties');
    const [parties, setParties] = useState<PoliticalParty[]>([]);
    const [mlas, setMlas] = useState<Mla[]>([]);
    const [booths, setBooths] = useState<any[]>([]);
    const [results, setResults] = useState<ElectionResult[]>([]);
    const [constituencies, setConstituencies] = useState<Constituency[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<Tab>('parties');
    const [editItem, setEditItem] = useState<any>(null);
    const [deletingId, setDeletingId] = useState<any>(null);
    const [deletingType, setDeletingType] = useState('');
    const [flagFile, setFlagFile] = useState<File | null>(null);
    const [mlaFile, setMlaFile] = useState<File | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    useEffect(() => { loadData(); }, [activeTab]);
    useEffect(() => { setPage(1); }, [activeTab, search, perPage]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [pRes, cRes] = await Promise.all([resultsApi.getParties(), resultsApi.getConstituencies()]);
            setParties(pRes.data || []);
            setConstituencies(cRes.data || []);
            if (activeTab === 'mlas') { const r = await resultsApi.getMlas(); setMlas(r.data || []); }
            if (activeTab === 'booths') { const r = await resultsApi.getBooths(); setBooths(r.data || []); }
            if (activeTab === 'results' || activeTab === 'map') {
                const [mR, bR, eR] = await Promise.all([resultsApi.getMlas(), resultsApi.getBooths(), resultsApi.getElectionResults()]);
                setMlas(mR.data || []); setBooths(bR.data || []); setResults(eR.data || []);
            }
        } catch { toast.error('Failed to load data'); }
        setLoading(false);
    };

    const openModal = (type: Tab, item: any = null) => {
        setModalType(type); setFlagFile(null); setMlaFile(null);
        if (item) {
            if (type === 'results') {
                const itemResultsMap = new Map(item.results.map((r: any) => [r.mla_id, r.votes_gained]));
                const fullResults = mlas.map(m => ({
                    mla_id: m.id,
                    votes_gained: itemResultsMap.get(m.id) || 0
                }));
                setEditItem({ ...item, results: fullResults });
            } else {
                setEditItem({ ...item }); 
            }
        }
        else {
            if (type === 'parties') setEditItem({ name: '', abbreviation: '', color: '#3B82F6', flag_image_url: '' });
            else if (type === 'mlas') setEditItem({ name: '', party_id: '', image_url: '' });
            else if (type === 'booths') setEditItem({ name: '', booth_no: 1, constituency_id: '', latitude: '', longitude: '' });
            else {
                const fullResults = mlas.map(m => ({
                    mla_id: m.id,
                    votes_gained: 0
                }));
                setEditItem({ booth_id: '', election_year: new Date().getFullYear(), results: fullResults });
            }
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (modalType === 'parties') {
                const fd = new FormData();
                fd.append('name', editItem.name); fd.append('abbreviation', editItem.abbreviation);
                if (editItem.color) fd.append('color', editItem.color);
                if (flagFile) fd.append('flag_image', flagFile);
                else if (editItem.flag_image_url) fd.append('flag_image_url', editItem.flag_image_url);
                editItem.id ? await resultsApi.updateParty(editItem.id, fd) : await resultsApi.createParty(fd);
            } else if (modalType === 'mlas') {
                const fd = new FormData();
                fd.append('name', editItem.name); fd.append('party_id', editItem.party_id);
                if (mlaFile) fd.append('mla_image', mlaFile);
                else if (editItem.image_url) fd.append('image_url', editItem.image_url);
                editItem.id ? await resultsApi.updateMla(editItem.id, fd) : await resultsApi.createMla(fd);
            } else if (modalType === 'booths') {
                const payload = { name: editItem.name, booth_no: Number(editItem.booth_no), constituency_id: editItem.constituency_id, latitude: editItem.latitude ? parseFloat(editItem.latitude) : null, longitude: editItem.longitude ? parseFloat(editItem.longitude) : null };
                editItem.id ? await resultsApi.updateBooth(editItem.id, payload) : await resultsApi.createBooth(payload);
            } else {
                const validResults = editItem.results.filter((r: any) => Number(r.votes_gained) > 0);
                const payload = { booth_id: editItem.booth_id, election_year: Number(editItem.election_year), results: validResults };
                await resultsApi.createBulkElectionResults(payload);
            }
            toast.success('Saved successfully'); setIsModalOpen(false); loadData();
        } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed to save'); }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            if (deletingType === 'parties') await resultsApi.deleteParty(deletingId as string);
            else if (deletingType === 'mlas') await resultsApi.deleteMla(deletingId as string);
            else if (deletingType === 'booths') await resultsApi.deleteBooth(deletingId as string);
            else {
                const group = deletingId as any;
                await Promise.all(group.results.map((mr: any) => resultsApi.deleteElectionResult(mr.id)));
            }
            toast.success('Deleted'); loadData();
        } catch { toast.error('Failed to delete'); }
        setDeletingId(null);
    };

    const tabs: { key: Tab; label: string; icon: any }[] = [
        { key: 'parties', label: 'Parties', icon: HiOutlineFlag },
        { key: 'mlas', label: 'MLAs', icon: HiOutlineUserGroup },
        { key: 'booths', label: 'Booths', icon: HiOutlineMapPin },
        { key: 'results', label: 'Results', icon: HiOutlineTrophy },
        { key: 'map', label: 'Map View', icon: HiOutlineMapPin },
    ];

    // ─── Client-side search filtering ─────────────────────────────
    const currentFullData = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (activeTab === 'parties') return q ? parties.filter(p => p.name.toLowerCase().includes(q) || p.abbreviation.toLowerCase().includes(q)) : parties;
        if (activeTab === 'mlas') return q ? mlas.filter(m => m.name.toLowerCase().includes(q) || (m.party_name || '').toLowerCase().includes(q)) : mlas;
        if (activeTab === 'booths') return q ? booths.filter((b: any) => b.name.toLowerCase().includes(q) || (b.constituency_name || '').toLowerCase().includes(q)) : booths;
        
        const groupedMap = new Map<string, any>();
        for (const r of results) {
            const key = `${r.booth_id}_${r.election_year}`;
            if (!groupedMap.has(key)) {
                groupedMap.set(key, {
                    id: key,
                    booth_id: r.booth_id,
                    booth_name: r.booth_name,
                    booth_no: r.booth_no,
                    constituency_name: r.constituency_name,
                    election_year: r.election_year,
                    results: []
                });
            }
            groupedMap.get(key).results.push({
                id: r.id,
                mla_id: r.mla_id,
                mla_name: r.mla_name,
                party_abbreviation: r.party_abbreviation,
                party_color: r.party_color,
                votes_gained: r.votes_gained
            });
        }
        const grouped = Array.from(groupedMap.values());
        return q ? grouped.filter(g => 
            (g.booth_name || '').toLowerCase().includes(q) || 
            g.results.some((mr: any) => (mr.mla_name || '').toLowerCase().includes(q) || (mr.party_abbreviation || '').toLowerCase().includes(q))
        ) : grouped;
    }, [activeTab, parties, mlas, booths, results, search]);

    const total = currentFullData.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const paginatedData = currentFullData.slice((page - 1) * perPage, page * perPage);

    const thCls = "text-left px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest";

    const renderTable = () => {
        if (loading) return <div className="p-6"><LoadingSkeleton rows={5} /></div>;
        if (activeTab === 'map') return <ResultsMap results={results} mlas={mlas} />;

        const rows = paginatedData as any[];
        if (rows.length === 0) return <div className="p-16 text-center"><p className="text-sm font-bold text-slate-400">No records found</p></div>;

        if (activeTab === 'parties') return (
            <table className="w-full"><thead><tr className="border-b bg-slate-50/50"><th className={thCls}>Party</th><th className={thCls}>Abbr</th><th className={thCls}>Color</th><th className={thCls}>Flag</th><th className={thCls + ' !text-right'}>Actions</th></tr></thead>
            <tbody>{rows.map((p: any) => (
                <tr key={p.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{p.name}</td>
                    <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase">{p.abbreviation}</span></td>
                    <td className="px-6 py-4"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full border border-slate-200 shadow-inner" style={{ backgroundColor: p.color || '#ccc' }} /><span className="text-xs font-mono text-slate-500">{p.color || '—'}</span></div></td>
                    <td className="px-6 py-4">{p.flag_image_url ? <img src={p.flag_image_url} className="w-10 h-7 object-contain rounded border border-slate-100" /> : <span className="text-xs text-slate-400">—</span>}</td>
                    <td className="px-6 py-4 text-right"><button onClick={() => openModal('parties', p)} className="mr-2 p-2 rounded-lg hover:bg-brand-50 text-brand-600"><HiOutlinePencil /></button><button onClick={() => { setDeletingId(p.id); setDeletingType('parties'); }} className="p-2 rounded-lg hover:bg-rose-50 text-rose-600"><HiOutlineTrash /></button></td>
                </tr>
            ))}</tbody></table>
        );
        if (activeTab === 'mlas') return (
            <table className="w-full"><thead><tr className="border-b bg-slate-50/50"><th className={thCls}>MLA</th><th className={thCls}>Party</th><th className={thCls}>Photo</th><th className={thCls + ' !text-right'}>Actions</th></tr></thead>
            <tbody>{rows.map((m: any) => (
                <tr key={m.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{m.name}</td>
                    <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase text-white" style={{ backgroundColor: m.party_color || '#64748b' }}>{m.party_abbreviation || m.party_name}</span></td>
                    <td className="px-6 py-4">{m.image_url ? <img src={m.image_url} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow" /> : <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><HiOutlineUserGroup className="w-5 h-5" /></div>}</td>
                    <td className="px-6 py-4 text-right"><button onClick={() => openModal('mlas', m)} className="mr-2 p-2 rounded-lg hover:bg-brand-50 text-brand-600"><HiOutlinePencil /></button><button onClick={() => { setDeletingId(m.id); setDeletingType('mlas'); }} className="p-2 rounded-lg hover:bg-rose-50 text-rose-600"><HiOutlineTrash /></button></td>
                </tr>
            ))}</tbody></table>
        );
        if (activeTab === 'booths') return (
            <table className="w-full"><thead><tr className="border-b bg-slate-50/50"><th className={thCls}>No.</th><th className={thCls}>Booth</th><th className={thCls}>Constituency</th><th className={thCls}>Coordinates</th><th className={thCls + ' !text-right'}>Actions</th></tr></thead>
            <tbody>{rows.map((b: any) => (
                <tr key={b.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400">{b.booth_no}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{b.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-bold">{b.constituency_name || '—'}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{b.latitude && b.longitude ? `${b.latitude}, ${b.longitude}` : '—'}</td>
                    <td className="px-6 py-4 text-right"><button onClick={() => openModal('booths', b)} className="mr-2 p-2 rounded-lg hover:bg-brand-50 text-brand-600"><HiOutlinePencil /></button><button onClick={() => { setDeletingId(b.id); setDeletingType('booths'); }} className="p-2 rounded-lg hover:bg-rose-50 text-rose-600"><HiOutlineTrash /></button></td>
                </tr>
            ))}</tbody></table>
        );
        return (
            <table className="w-full"><thead><tr className="border-b bg-slate-50/50"><th className={thCls}>Year</th><th className={thCls}>Booth</th><th className={thCls}>MLA Votes</th><th className={thCls + ' !text-right'}>Actions</th></tr></thead>
            <tbody>{rows.map((r: any) => (
                <tr key={r.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-brand-600">{r.election_year}</td>
                    <td className="px-6 py-4"><div><span className="font-bold text-slate-800">{r.booth_name}</span><span className="block text-[10px] text-slate-400 font-bold">{r.constituency_name}</span></div></td>
                    <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                            {r.results.map((mr: any) => (
                                <div key={mr.mla_id} className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                    <span className="px-2 py-1 text-[10px] font-black uppercase text-white" style={{ backgroundColor: mr.party_color || '#64748b' }}>
                                        {mr.party_abbreviation || mr.mla_name.split(' ')[0]}
                                    </span>
                                    <span className="px-2 py-1 text-xs font-bold text-slate-700">
                                        {mr.mla_name}: <span className="text-emerald-600">{mr.votes_gained?.toLocaleString()}</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button onClick={() => openModal('results', r)} className="mr-2 p-2 rounded-lg hover:bg-brand-50 text-brand-600"><HiOutlinePencil /></button>
                        <button onClick={() => { setDeletingId(r); setDeletingType('results'); }} className="p-2 rounded-lg hover:bg-rose-50 text-rose-600"><HiOutlineTrash /></button>
                    </td>
                </tr>
            ))}</tbody></table>
        );
    };

    const inputCls = "w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white outline-none transition-all text-sm font-bold shadow-inner";
    const labelCls = "text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1";

    return (
        <div className="space-y-4 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Election <span className="text-brand-600">Results</span></h1>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Parties · MLAs · Booths · Vote Tracking</p>
                </div>
                <button onClick={() => openModal(activeTab)} className="flex items-center gap-2 px-6 py-3.5 rounded-2xl gradient-primary text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-500/30 active:scale-95 transition-all">
                    <HiOutlinePlus className="w-4 h-4" /> Add {activeTab === 'parties' ? 'Party' : activeTab === 'mlas' ? 'MLA' : activeTab === 'booths' ? 'Booth' : 'Result'}
                </button>
            </div>

            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl w-fit border border-slate-200/60 shadow-sm">
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === t.key ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
                        <t.icon className="w-4 h-4" /> {t.label}
                    </button>
                ))}
            </div>

            {/* Search bar */}
            {activeTab !== 'map' && (
                <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200/60 shadow-sm">
                    <div className="relative flex-1 min-w-[200px]">
                        <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input type="text" placeholder={`Search ${activeTab}...`} value={search} onChange={e => setSearch(e.target.value)} className="pl-11 pr-4 py-2.5 w-full rounded-xl bg-transparent border-none focus:ring-0 outline-none text-sm font-medium transition-all placeholder:text-slate-400" />
                    </div>
                    <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block" />
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Per page</span>
                        <select value={perPage} onChange={e => setPerPage(Number(e.target.value))} className="text-sm font-semibold text-slate-700 outline-none cursor-pointer bg-transparent">
                            {[5, 10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                </div>
            )}

            <div className={`bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 ${activeTab === 'map' ? '' : 'overflow-hidden min-h-[400px]'}`}>
                {activeTab === 'map' ? (
                    <div className="p-4">
                        {renderTable()}
                    </div>
                ) : (
                    <div className="overflow-x-auto">{renderTable()}</div>
                )}

                {/* Pagination Footer */}
                {!loading && activeTab !== 'map' && total > 0 && (
                    <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                            Showing <span className="text-slate-900">{(page - 1) * perPage + 1}</span> – <span className="text-slate-900">{Math.min(page * perPage, total)}</span> of <span className="text-slate-900">{total}</span> records
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2.5 rounded-xl border border-slate-200 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all shadow-sm">
                                <HiOutlineChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1 mx-2">
                                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                                    let pg: number;
                                    if (totalPages <= 7) { pg = i + 1; }
                                    else if (page <= 4) { pg = i + 1; }
                                    else if (page >= totalPages - 3) { pg = totalPages - 6 + i; }
                                    else { pg = page - 3 + i; }
                                    return (
                                        <button key={pg} onClick={() => setPage(pg)} className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${page === pg ? 'gradient-primary text-white shadow-lg shadow-brand-500/30' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}>
                                            {pg}
                                        </button>
                                    );
                                })}
                            </div>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-2.5 rounded-xl border border-slate-200 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all shadow-sm">
                                <HiOutlineChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog isOpen={!!deletingId} onClose={() => setDeletingId(null)} onConfirm={handleDelete} loading={false} />

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl border border-white/20 transform animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{editItem?.id ? 'Edit' : 'Add'} <span className="text-brand-600">{modalType === 'parties' ? 'Party' : modalType === 'mlas' ? 'MLA' : modalType === 'booths' ? 'Booth' : 'Result'}</span></h2>
                        </div>
                        <form onSubmit={handleSave} className="space-y-6">
                            {modalType === 'parties' && (<>
                                <div className="space-y-1.5"><label className={labelCls}>Party Name</label><input type="text" required value={editItem.name} onChange={e => setEditItem({...editItem, name: e.target.value})} className={inputCls} placeholder="e.g. Bharatiya Janata Party" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Abbreviation</label><input type="text" required value={editItem.abbreviation} onChange={e => setEditItem({...editItem, abbreviation: e.target.value})} className={inputCls} placeholder="e.g. BJP" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Party Color</label><div className="flex items-center gap-3"><input type="color" value={editItem.color || '#3B82F6'} onChange={e => setEditItem({...editItem, color: e.target.value})} className="w-12 h-12 rounded-xl border border-slate-200 cursor-pointer p-1" /><input type="text" value={editItem.color || ''} onChange={e => setEditItem({...editItem, color: e.target.value})} className={inputCls} placeholder="#3B82F6" /></div></div>
                                <div className="space-y-1.5"><label className={labelCls}>Party Flag Image</label><input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) setFlagFile(e.target.files[0]); }} className={inputCls} />{(editItem.flag_image_url && !flagFile) && <img src={editItem.flag_image_url} className="w-20 h-14 object-contain rounded border mt-2" />}</div>
                            </>)}
                            {modalType === 'mlas' && (<>
                                <div className="space-y-1.5"><label className={labelCls}>MLA Name</label><input type="text" required value={editItem.name} onChange={e => setEditItem({...editItem, name: e.target.value})} className={inputCls} placeholder="Full name" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Select Party</label><select required value={editItem.party_id} onChange={e => setEditItem({...editItem, party_id: e.target.value})} className={inputCls + ' cursor-pointer'}><option value="">Select Party</option>{parties.map(p => <option key={p.id} value={p.id}>{p.name} ({p.abbreviation})</option>)}</select></div>
                                <div className="space-y-1.5"><label className={labelCls}>MLA Photo</label><input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) setMlaFile(e.target.files[0]); }} className={inputCls} />{(editItem.image_url && !mlaFile) && <img src={editItem.image_url} className="w-16 h-16 rounded-full object-cover border mt-2" />}</div>
                            </>)}
                            {modalType === 'booths' && (<>
                                <div className="grid grid-cols-4 gap-4"><div className="col-span-1 space-y-1.5"><label className={labelCls}>No.</label><input type="number" required value={editItem.booth_no} onChange={e => setEditItem({...editItem, booth_no: e.target.value})} className={inputCls} /></div><div className="col-span-3 space-y-1.5"><label className={labelCls}>Booth Name</label><input type="text" required value={editItem.name} onChange={e => setEditItem({...editItem, name: e.target.value})} className={inputCls} placeholder="Booth name" /></div></div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Select Constituency</label>
                                    <SearchableSelect
                                        options={constituencies.map(c => ({ id: c.id, label: c.name }))}
                                        value={editItem.constituency_id}
                                        onChange={(val) => setEditItem({ ...editItem, constituency_id: val })}
                                        placeholder="Select Constituency"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label className={labelCls}>Latitude</label><input type="text" value={editItem.latitude || ''} onChange={e => setEditItem({...editItem, latitude: e.target.value})} className={inputCls} placeholder="26.1445" /></div><div className="space-y-1.5"><label className={labelCls}>Longitude</label><input type="text" value={editItem.longitude || ''} onChange={e => setEditItem({...editItem, longitude: e.target.value})} className={inputCls} placeholder="91.7362" /></div></div>
                            </>)}
                            {modalType === 'results' && (<>
                                <div className="space-y-1.5"><label className={labelCls}>Election Year</label><input type="number" required value={editItem.election_year} onChange={e => setEditItem({...editItem, election_year: e.target.value})} className={inputCls} placeholder="e.g. 2026" /></div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Select Booth</label>
                                    <SearchableSelect
                                        options={booths.map((b: any) => ({ id: b.id, label: `${b.name} (#${b.booth_no})` }))}
                                        value={editItem.booth_id}
                                        onChange={(val) => setEditItem({ ...editItem, booth_id: val })}
                                        placeholder="Select Booth"
                                    />
                                </div>
                                <div className="space-y-3 pt-2">
                                    <label className={labelCls}>MLA Votes</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {mlas.map(m => {
                                            const rIdx = editItem.results?.findIndex((r: any) => r.mla_id === m.id) ?? -1;
                                            const rVal = rIdx >= 0 ? editItem.results[rIdx].votes_gained : 0;
                                            return (
                                                <div key={m.id} className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-bold text-slate-800 truncate">{m.name}</div>
                                                        <div className="text-[10px] font-black uppercase text-slate-500">{m.party_abbreviation || 'Unknown'}</div>
                                                    </div>
                                                    <input 
                                                        type="number" 
                                                        min="0" 
                                                        value={rVal || ''} 
                                                        onChange={e => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            const newRes = [...(editItem.results || [])];
                                                            if (rIdx >= 0) newRes[rIdx].votes_gained = val;
                                                            else newRes.push({ mla_id: m.id, votes_gained: val });
                                                            setEditItem({...editItem, results: newRes});
                                                        }} 
                                                        className="w-24 px-3 py-2 rounded-lg border border-slate-200 focus:border-brand-500 outline-none text-right font-mono font-bold" 
                                                        placeholder="0" 
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>)}
                            <div className="flex gap-4 justify-end pt-8 border-t border-slate-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 font-black bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-colors uppercase text-xs tracking-widest">Cancel</button>
                                <button type="submit" className="px-10 py-4 font-black gradient-primary text-white rounded-2xl shadow-lg shadow-brand-500/30 active:scale-95 transition-all uppercase text-xs tracking-widest">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

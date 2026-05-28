import { useState, useEffect, useCallback } from 'react';
import { HiOutlineMap, HiOutlineBuildingLibrary, HiOutlineFlag, HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineMapPin, HiOutlineUserGroup, HiOutlineChevronRight, HiMagnifyingGlass, HiOutlineChevronLeft, HiOutlineFunnel } from 'react-icons/hi2';
import { useDebounce } from '../../hooks/useDebounce';
import { masterApi } from '../../api/master';
import { Booth, Constituency, PoliticalParty, District, PoliticalPartyLeader } from '../../types';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import FileUpload from '../../components/ui/FileUpload';
import SearchableSelect from '../../components/ui/SearchableSelect';
import toast from 'react-hot-toast';

export default function MasterDataPage() {
    const [activeTab, setActiveTab] = useState<'districts' | 'constituencies' | 'booths' | 'parties'>('districts');
    
    // States for data
    const [districts, setDistricts] = useState<District[]>([]);
    const [constituencies, setConstituencies] = useState<Constituency[]>([]);
    const [booths, setBooths] = useState<Booth[]>([]);
    const [parties, setParties] = useState<PoliticalParty[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deletingType, setDeletingType] = useState<string>('');


    // Party Leaders State
    const [selectedParty, setSelectedParty] = useState<PoliticalParty | null>(null);
    const [leaders, setLeaders] = useState<PoliticalPartyLeader[]>([]);
    const [loadingLeaders, setLoadingLeaders] = useState(false);

    // Editing modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [modalType, setModalType] = useState<'district' | 'constituency' | 'booth' | 'party' | 'leader'>('district');

    // Pagination & Search States
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit] = useState(20);
    const [filterDistrictId, setFilterDistrictId] = useState('');
    const [filterConstituencyId, setFilterConstituencyId] = useState('');

    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => { 
        setPage(1); // Reset page on tab change or search
    }, [activeTab, debouncedSearch, filterDistrictId, filterConstituencyId]);

    useEffect(() => { 
        loadData(); 
    }, [activeTab, page, debouncedSearch, filterDistrictId, filterConstituencyId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const params = { page, limit, search: debouncedSearch };
            if (activeTab === 'districts') {
                const res = await masterApi.getDistricts(params);
                setDistricts(res.data);
                setTotal(res.pagination.total);
            } else if (activeTab === 'constituencies') {
                const res = await masterApi.getConstituencies({ ...params, districtId: filterDistrictId });
                setConstituencies(res.data);
                setTotal(res.pagination.total);
                // Load all districts for filter dropdown
                const dRes = await masterApi.getDistricts({ page: 1, limit: 1000 });
                setDistricts(dRes.data);
            } else if (activeTab === 'booths') {
                const res = await masterApi.getBooths({ ...params, constituency_id: filterConstituencyId });
                setBooths(res.data);
                setTotal(res.pagination.total);
                // Load constituencies for filter
                const cRes = await masterApi.getConstituencies({ page: 1, limit: 1000, districtId: filterDistrictId });
                setConstituencies(cRes.data);
                // Load districts for first dropdown
                const dRes = await masterApi.getDistricts({ page: 1, limit: 1000 });
                setDistricts(dRes.data);
            } else {
                const res = await masterApi.getParties(params);
                setParties(res.data);
                setTotal(res.pagination.total);
            }
        } catch {
            toast.error('Failed to load data');
        }
        setLoading(false);
    };

    const loadLeaders = async (partyId: string) => {
        setLoadingLeaders(true);
        try {
            const res = await masterApi.getPartyLeaders(partyId);
            setLeaders(res);
        } catch {
            toast.error('Failed to load leaders');
        } finally {
            setLoadingLeaders(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            if (deletingType === 'district') await masterApi.deleteDistrict(deletingId);
            else if (deletingType === 'constituency') await masterApi.deleteConstituency(deletingId);
            else if (deletingType === 'booth') await masterApi.deleteBooth(deletingId);
            else if (deletingType === 'party') await masterApi.deleteParty(deletingId);
            else if (deletingType === 'leader') {
                await masterApi.deletePartyLeader(deletingId);
                if (selectedParty) loadLeaders(selectedParty.id);
            }
            
            toast.success('Deleted successfully');
            if (deletingType !== 'leader') loadData();
        } catch { toast.error('Failed to delete'); }
        setDeletingId(null);
    };

    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim());
            
            // Assume CSV format: booth_no, name, constituency_id
            const data = lines.slice(1).map(line => {
                const [booth_no, name, constituency_id] = line.split(',').map(s => s.trim());
                return { 
                    booth_no: Number(booth_no), 
                    name, 
                    constituency_id 
                };
            }).filter(item => !isNaN(item.booth_no) && item.name && item.constituency_id);

            if (data.length === 0) {
                toast.error('No valid data found in CSV. Required format: booth_no, name, constituency_id');
                return;
            }

            const loadingToast = toast.loading(`Uploading ${data.length} booths...`);
            try {
                await masterApi.bulkUploadBooths(data);
                toast.success(`Successfully initialized ${data.length} polling stations`, { id: loadingToast });
                loadData();
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Strategic bulk initialization failed', { id: loadingToast });
            }
        };
        reader.readAsText(file);
        // Reset input
        e.target.value = '';
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (modalType === 'district') {
                editItem.id ? await masterApi.updateDistrict(editItem.id, editItem) : await masterApi.createDistrict(editItem);
            } else if (modalType === 'constituency') {
                editItem.id ? await masterApi.updateConstituency(editItem.id, editItem) : await masterApi.createConstituency(editItem);
            } else if (modalType === 'booth') {
                editItem.id ? await masterApi.updateBooth(editItem.id, editItem) : await masterApi.createBooth(editItem);
            } else if (modalType === 'party') {
                editItem.id ? await masterApi.updateParty(editItem.id, editItem) : await masterApi.createParty(editItem);
            } else if (modalType === 'leader') {
                editItem.id ? await masterApi.updatePartyLeader(editItem.id, editItem) : await masterApi.createPartyLeader(editItem);
                if (selectedParty) loadLeaders(selectedParty.id);
            }
            toast.success('Saved successfully');
            setIsModalOpen(false);

            if (modalType !== 'leader') loadData();
        } catch (error) {
            toast.error('Failed to save');
            console.error(error);
        }
    };

    const openModal = (type: typeof modalType, item: any = null) => {
        setModalType(type);
        if (item) {
            setEditItem(item);
        } else {
            if (type === 'district') setEditItem({ name: '', state: 'Assam' });
            else if (type === 'constituency') setEditItem({ name: '', district_id: '', state: 'Assam' });
            else if (type === 'booth') setEditItem({ booth_no: '', name: '', constituency_id: '' });
            else if (type === 'party') setEditItem({ name: '', abbreviation: '', logo_url: '' });
            else if (type === 'leader') setEditItem({ name: '', designation: '', photo_url: '', party_id: selectedParty?.id });
        }
        setIsModalOpen(true);
    };

    const renderTabs = () => (
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex bg-slate-100/80 p-1.5 rounded-2xl w-fit overflow-x-auto no-scrollbar max-w-full border border-slate-200/60 shadow-sm">
                    <button
                        onClick={() => { setActiveTab('districts'); setSelectedParty(null); setSearch(''); setPage(1); setFilterDistrictId(''); setFilterConstituencyId(''); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'districts' ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                    >
                        <HiOutlineMapPin className="w-4 h-4" /> Districts
                    </button>
                    <button
                        onClick={() => { setActiveTab('constituencies'); setSelectedParty(null); setSearch(''); setPage(1); setFilterDistrictId(''); setFilterConstituencyId(''); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'constituencies' ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                    >
                        <HiOutlineBuildingLibrary className="w-4 h-4" /> Constituencies
                    </button>
                    <button
                        onClick={() => { setActiveTab('booths'); setSelectedParty(null); setSearch(''); setPage(1); setFilterDistrictId(''); setFilterConstituencyId(''); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'booths' ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                    >
                        <HiOutlineMap className="w-4 h-4" /> Booths
                    </button>
                    <button
                        onClick={() => { setActiveTab('parties'); setSelectedParty(null); setSearch(''); setPage(1); setFilterDistrictId(''); setFilterConstituencyId(''); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'parties' ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                    >
                        <HiOutlineFlag className="w-4 h-4" /> Political Parties
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {activeTab === 'booths' && (
                        <>
                            <input
                                type="file"
                                id="bulk-booth-upload"
                                className="hidden"
                                accept=".csv"
                                onChange={handleBulkUpload}
                            />
                            <button
                                onClick={() => document.getElementById('bulk-booth-upload')?.click()}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 text-sm font-bold hover:bg-amber-100 transition-all shadow-sm active:scale-95"
                            >
                                Bulk Import
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200/60 shadow-sm">
                {/* Global Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder={`Search ${activeTab}...`} 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-11 pr-4 py-2.5 w-full rounded-xl bg-transparent border-none focus:ring-0 outline-none text-sm font-medium transition-all placeholder:text-slate-400"
                    />
                </div>

                {/* Filters */}
                {(activeTab === 'constituencies' || activeTab === 'booths') && (
                    <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>
                )}
                
                {(activeTab === 'constituencies' || activeTab === 'booths') && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                        <HiOutlineFunnel className="w-4 h-4 text-slate-400" />
                        <select 
                            value={filterDistrictId} 
                            onChange={(e) => { setFilterDistrictId(e.target.value); setFilterConstituencyId(''); }}
                            className="text-sm font-semibold text-slate-700 outline-none cursor-pointer bg-transparent"
                        >
                            <option value="">All Districts</option>
                            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                )}
                {activeTab === 'booths' && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                        <HiOutlineFunnel className="w-4 h-4 text-slate-400" />
                        <select 
                            value={filterConstituencyId} 
                            onChange={(e) => setFilterConstituencyId(e.target.value)}
                            className="text-sm font-semibold text-slate-700 outline-none cursor-pointer bg-transparent"
                        >
                            <option value="">All LACs</option>
                            {constituencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                )}
            </div>
        </div>
    );

    const renderTable = () => {
        if (loading) return <div className="p-6"><LoadingSkeleton rows={5} /></div>;

        if (activeTab === 'districts') return (
            <table className="w-full">
                <thead><tr className="border-b bg-slate-50/50"><th className="text-left px-6 py-4">District Name</th><th className="text-left px-6 py-4">State</th><th className="text-right px-6 py-4">Actions</th></tr></thead>
                <tbody>{districts.map(d => (
                    <tr key={d.id} className="border-b hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold text-slate-800">{d.name}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm font-bold uppercase">{d.state}</td>
                        <td className="px-6 py-4 text-right">
                            <button onClick={() => openModal('district', d)} className="mr-3 p-2 rounded-lg hover:bg-brand-50 text-brand-600 transition-colors"><HiOutlinePencil /></button>
                            <button onClick={() => { setDeletingId(d.id); setDeletingType('district'); }} className="p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"><HiOutlineTrash /></button>
                        </td>
                    </tr>
                ))}</tbody>
            </table>
        );

        if (activeTab === 'constituencies') return (
            <table className="w-full">
                <thead><tr className="border-b bg-slate-50/50"><th className="text-left px-6 py-4">Constituency Name</th><th className="text-left px-6 py-4">District</th><th className="text-right px-6 py-4">Actions</th></tr></thead>
                <tbody>{constituencies.map(c => {
                    const district = districts.find(d => d.id === c.district_id);
                    return (
                        <tr key={c.id} className="border-b hover:bg-slate-50">
                            <td className="px-6 py-4 font-bold text-slate-800">{c.name}</td>
                            <td className="px-6 py-4">
                                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-tight">
                                    {district?.name || 'Unassigned'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => openModal('constituency', c)} className="mr-3 p-2 rounded-lg hover:bg-brand-50 text-brand-600 transition-colors"><HiOutlinePencil /></button>
                                <button onClick={() => { setDeletingId(c.id); setDeletingType('constituency'); }} className="p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"><HiOutlineTrash /></button>
                            </td>
                        </tr>
                    );
                })}</tbody>
            </table>
        );

        if (activeTab === 'booths') return (
            <table className="w-full">
                <thead><tr className="border-b bg-slate-50/50"><th className="text-left px-6 py-4">No.</th><th className="text-left px-6 py-4">Booth Name</th><th className="text-left px-6 py-4">Constituency</th><th className="text-right px-6 py-4">Actions</th></tr></thead>
                <tbody>{booths.map(b => {
                    const consti = constituencies.find(c => c.id === b.constituency_id);
                    return (
                        <tr key={b.id} className="border-b hover:bg-slate-50">
                            <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400">{b.booth_no}</td>
                            <td className="px-6 py-4 font-bold text-slate-800">{b.name}</td>
                            <td className="px-6 py-4 text-sm text-slate-600 font-bold">{consti?.name || 'Unassigned'}</td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => openModal('booth', b)} className="mr-3 p-2 rounded-lg hover:bg-brand-50 text-brand-600 transition-colors"><HiOutlinePencil /></button>
                                <button onClick={() => { setDeletingId(b.id); setDeletingType('booth'); }} className="p-2 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"><HiOutlineTrash /></button>
                            </td>
                        </tr>
                    );
                })}</tbody>
            </table>
        );

        if (activeTab === 'parties') return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                {parties.map(p => (
                    <div key={p.id} className={`group relative p-6 rounded-3xl border transition-all ${selectedParty?.id === p.id ? 'bg-brand-50/50 border-brand-200' : 'bg-white border-slate-100 hover:border-brand-200'}`}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center p-2 overflow-hidden">
                                    {p.logo_url ? <img src={p.logo_url} alt="" className="w-full h-full object-contain" /> : <HiOutlineFlag className="w-8 h-8 text-slate-300" />}
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 uppercase tracking-tight">{p.name}</h3>
                                    <p className="text-xs font-black text-brand-600 uppercase tracking-widest">{p.abbreviation}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openModal('party', p)} className="p-2 rounded-lg hover:bg-white text-brand-600 transition-colors"><HiOutlinePencil /></button>
                                <button onClick={() => { setDeletingId(p.id); setDeletingType('party'); }} className="p-2 rounded-lg hover:bg-white text-rose-600 transition-colors"><HiOutlineTrash /></button>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button 
                                onClick={() => { setSelectedParty(p); loadLeaders(p.id); }}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-100/50 hover:bg-white border border-transparent hover:border-slate-200 transition-all text-xs font-black uppercase tracking-widest text-slate-600 group/btn"
                            >
                                <span className="flex items-center gap-2"><HiOutlineUserGroup className="w-4 h-4 text-slate-400" /> Manage Leaders</span>
                                <HiOutlineChevronRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {selectedParty?.id === p.id && (
                            <div className="mt-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center justify-between border-b border-brand-200 pb-2">
                                    <h4 className="text-[10px] font-black text-brand-700 uppercase tracking-widest">Party Leadership</h4>
                                    <button onClick={() => openModal('leader')} className="text-brand-600 hover:text-brand-700 flex items-center gap-1 text-[10px] font-black uppercase"><HiOutlinePlus className="w-3 h-3" /> Add Leader</button>
                                </div>
                                
                                {loadingLeaders ? (
                                    <div className="py-4"><LoadingSkeleton rows={2} /></div>
                                ) : leaders.length === 0 ? (
                                    <p className="text-[10px] text-slate-400 font-bold uppercase py-4 text-center">No leaders listed yet</p>
                                ) : (
                                    <div className="space-y-3">
                                        {leaders.map(l => (
                                            <div key={l.id} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                                                        {l.photo_url ? <img src={l.photo_url} alt="" className="w-full h-full object-cover" /> : <HiOutlineUserGroup className="w-4 h-4 text-slate-300 m-auto mt-2" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-800">{l.name}</p>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{l.designation}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => openModal('leader', l)} className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors"><HiOutlinePencil className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => { setDeletingId(l.id); setDeletingType('leader'); }} className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"><HiOutlineTrash className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Master Data <span className="text-brand-600">Reformation</span></h1>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Hierarchical Geographic & Political Governance Hub</p>
                </div>
                <button onClick={() => openModal(activeTab.slice(0, -1) as any)} className="flex items-center gap-2 px-6 py-3.5 rounded-2xl gradient-primary text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-500/30 active:scale-95 transition-all">
                    <HiOutlinePlus className="w-4 h-4" /> New {activeTab.slice(0, -1)}
                </button>
            </div>

            {renderTabs()}

            <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 min-h-[400px]">
                <div className="overflow-x-auto">
                    {renderTable()}
                </div>
                
                {/* Professional Pagination Footer */}
                {!loading && total > 0 && (
                    <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                            Showing <span className="text-slate-900">{(page - 1) * limit + 1}</span> - <span className="text-slate-900">{Math.min(page * limit, total)}</span> of <span className="text-slate-900">{total}</span> assets
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2.5 rounded-xl border border-slate-200 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all shadow-sm"
                            >
                                <HiOutlineChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1 mx-2">
                                {[...Array(Math.min(5, Math.ceil(total / limit)))].map((_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <button 
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${page === pageNum ? 'gradient-primary text-white shadow-lg shadow-brand-500/30' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button 
                                onClick={() => setPage(p => p + 1)}
                                disabled={page >= Math.ceil(total / limit)}
                                className="p-2.5 rounded-xl border border-slate-200 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all shadow-sm"
                            >
                                <HiOutlineChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog isOpen={!!deletingId} onClose={() => setDeletingId(null)} onConfirm={handleDelete} loading={false} />

            {/* Global Refined Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl border border-white/20 transform animate-in zoom-in-95 duration-300">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                                {editItem?.id ? 'Refine' : 'Initialize'} <span className="text-brand-600">{modalType}</span>
                            </h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Data Entry Protection System Active</p>
                        </div>
                        
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                {modalType === 'district' && (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">District Identifier</label>
                                            <input type="text" required placeholder="Enter district name" value={editItem.name} onChange={e => setEditItem({...editItem, name: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white outline-none transition-all text-sm font-bold shadow-inner" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Administrative State</label>
                                            <input type="text" required placeholder="State" value={editItem.state} onChange={e => setEditItem({...editItem, state: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white outline-none transition-all text-sm font-bold shadow-inner" />
                                        </div>
                                    </>
                                )}
                                {modalType === 'constituency' && (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Parent District</label>
                                            <select 
                                                required 
                                                value={editItem.district_id || ''} 
                                                onChange={e => setEditItem({...editItem, district_id: e.target.value})}
                                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white outline-none transition-all text-sm font-bold shadow-inner cursor-pointer"
                                            >
                                                <option value="">Select Parent District</option>
                                                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Constituency Designation</label>
                                            <input type="text" required placeholder="Name" value={editItem.name} onChange={e => setEditItem({...editItem, name: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white outline-none transition-all text-sm font-bold shadow-inner" />
                                        </div>
                                    </>
                                )}
                                {modalType === 'booth' && (
                                    <>
                                        <div className="grid grid-cols-4 gap-4">
                                            <div className="col-span-1 space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">No.</label>
                                                <input type="number" required placeholder="No." value={editItem.booth_no} onChange={e => setEditItem({...editItem, booth_no: Number(e.target.value)})} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white outline-none transition-all text-sm font-bold shadow-inner" />
                                            </div>
                                            <div className="col-span-3 space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Booth Designation</label>
                                                <input type="text" required placeholder="Booth name" value={editItem.name} onChange={e => setEditItem({...editItem, name: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white outline-none transition-all text-sm font-bold shadow-inner" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Parent Constituency</label>
                                            <SearchableSelect
                                                options={constituencies.map(c => ({ id: c.id, label: c.name }))}
                                                value={editItem.constituency_id}
                                                onChange={(val) => setEditItem({ ...editItem, constituency_id: val })}
                                                placeholder="Select Parent Constituency"
                                            />
                                        </div>
                                    </>
                                )}
                                {modalType === 'party' && (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Official Name</label>
                                            <input type="text" required placeholder="Name" value={editItem.name} onChange={e => setEditItem({...editItem, name: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white outline-none transition-all text-sm font-bold shadow-inner" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Abbreviation</label>
                                            <input type="text" required placeholder="BJP, INC, etc" value={editItem.abbreviation} onChange={e => setEditItem({...editItem, abbreviation: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white outline-none transition-all text-sm font-bold shadow-inner" />
                                        </div>
                                        <FileUpload
                                            label="Party Logo"
                                            onUploadComplete={(url) => setEditItem({...editItem, logo_url: url})}
                                            currentFileUrl={editItem.logo_url}
                                            folder="master/parties"
                                            accept="image/*"
                                        />
                                    </>
                                )}
                                {modalType === 'leader' && (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Official Name</label>
                                            <input type="text" required placeholder="Name" value={editItem.name} onChange={e => setEditItem({...editItem, name: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white outline-none transition-all text-sm font-bold shadow-inner" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Designation</label>
                                            <input type="text" required placeholder="Party President, Chairman, etc" value={editItem.designation} onChange={e => setEditItem({...editItem, designation: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white outline-none transition-all text-sm font-bold shadow-inner" />
                                        </div>
                                        <FileUpload
                                            label="Leader Photo"
                                            onUploadComplete={(url) => setEditItem({...editItem, photo_url: url})}
                                            currentFileUrl={editItem.photo_url}
                                            folder="master/leaders"
                                            accept="image/*"
                                        />
                                    </>
                                )}
                            </div>
                            
                            <div className="flex gap-4 justify-end pt-8 border-t border-slate-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 font-black bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-colors uppercase text-xs tracking-widest">Abort</button>
                                <button type="submit" className="px-10 py-4 font-black gradient-primary text-white rounded-2xl shadow-lg shadow-brand-500/30 active:scale-95 transition-all uppercase text-xs tracking-widest">Execute Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

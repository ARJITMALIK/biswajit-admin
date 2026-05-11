import { useState, useEffect } from 'react';
import { HiOutlineFlag, HiOutlineMagnifyingGlass, HiOutlineFunnel, HiOutlineCheckCircle, HiOutlineClock } from 'react-icons/hi2';
import { reportsService, Report } from '../../api/reports.service';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import ReportResolveModal from './components/ReportResolveModal';

export default function ReportsPage() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const limit = 10;

  useEffect(() => {
    loadData();
  }, [page, statusFilter, targetTypeFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await reportsService.getReports({
        page,
        limit,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        target_type: targetTypeFilter !== 'all' ? targetTypeFilter : undefined,
      });
      setItems(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to load reports:', error);
      toast.error('Failed to load reports');
      setItems([]);
    }
    setLoading(false);
  };

  const handleResolve = async (action: string) => {
    if (!selectedReport) return;
    try {
      await reportsService.resolveReport(selectedReport.id, action);
      toast.success(`Report resolved with action: ${action}`);
      setSelectedReport(null);
      loadData();
    } catch (error) {
      console.error('Failed to resolve report:', error);
      toast.error('Failed to resolve report');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Content Reports</h1>
          <p className="text-sm text-slate-500 font-medium">{total} total reports requiring review</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter */}
        <div className="relative">
          <HiOutlineFunnel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="pl-9 pr-8 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm appearance-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-bold cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="PENDING">🕒 Pending</option>
            <option value="RESOLVED">✅ Resolved</option>
          </select>
        </div>

        {/* Target Type Filter */}
        <select
          value={targetTypeFilter}
          onChange={(e) => { setTargetTypeFilter(e.target.value); setPage(0); }}
          className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm appearance-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/5 transition-all font-bold cursor-pointer"
        >
          <option value="all">All Types</option>
          <option value="NEWS">News</option>
          <option value="PODCAST">Podcast</option>
          <option value="CURRENT">Current/Reel</option>
          <option value="NEWS_COMMENT">News Comment</option>
          <option value="PODCAST_COMMENT">Podcast Comment</option>
          <option value="CURRENT_COMMENT">Current Comment</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass rounded-3xl overflow-hidden border border-white/40 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reporter</th>
                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Type</th>
                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reason</th>
                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="text-left px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                <th className="text-right px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12"><LoadingSkeleton rows={5} /></td></tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState 
                      icon={<HiOutlineFlag className="w-12 h-12" />} 
                      title="No Reports Found" 
                      description="There are no reports matching your filters." 
                    />
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-brand-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
                          {item.reporter_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="text-sm font-bold text-slate-800">{item.reporter_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-black text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 uppercase tracking-tight">
                        {item.target_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700">{item.reason}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status === 'PENDING' ? 'Pending' : 'Resolved'} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedReport(item)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-50 text-brand-600 hover:bg-brand-100 transition-all active:scale-95"
                      >
                        {item.status === 'PENDING' ? 'Take Action' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between px-6 py-5 bg-slate-50/30 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Showing <span className="text-brand-600">{page * limit + 1}</span> to <span className="text-brand-600">{Math.min((page + 1) * limit, total)}</span> of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm active:scale-95"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * limit >= total}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-brand-600 border border-brand-100 hover:bg-brand-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm active:scale-95"
              >
                Next Page
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedReport && (
        <ReportResolveModal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          report={selectedReport}
          onResolve={handleResolve}
        />
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { HiOutlineXMark, HiOutlineTrash, HiOutlineUserMinus, HiOutlineNoSymbol, HiOutlineEye, HiOutlineCheckCircle } from 'react-icons/hi2';
import { reportsService, Report } from '../../../api/reports.service';
import Modal from '../../../components/ui/Modal';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';

interface ReportResolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report;
  onResolve: (action: string) => Promise<void>;
}

export default function ReportResolveModal({ isOpen, onClose, report, onResolve }: ReportResolveModalProps) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDetails();
    }
  }, [isOpen, report.id]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const res = await reportsService.getReportDetails(report.id);
      setDetails(res);
    } catch (error) {
      console.error('Failed to load report details:', error);
    }
    setLoading(false);
  };

  const handleAction = async (action: string) => {
    setProcessing(true);
    await onResolve(action);
    setProcessing(false);
    onClose();
  };

  const renderContent = () => {
    if (loading) return <LoadingSkeleton rows={4} />;
    if (!details || !details.content) return <p className="text-slate-500 italic">Content not found or already deleted.</p>;

    const { content } = details;
    const isComment = report.target_type.includes('COMMENT');

    return (
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
        {isComment ? (
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Reported Comment</h4>
            <p className="text-slate-800 font-medium leading-relaxed">"{content.content}"</p>
            <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-tight">Posted on {new Date(content.created_at).toLocaleString()}</p>
          </div>
        ) : report.target_type === 'USER' ? (
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reported User</h4>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-lg border border-brand-100">
                {content.user_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-900">{content.user_name}</p>
                <p className="text-xs text-slate-500">{content.email || content.mobile}</p>
              </div>
            </div>
            <div className="pt-2">
              <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${content.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                Status: {content.status}
              </span>
            </div>
          </div>
        ) : (
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Reported Content</h4>
            {content.thumbnail || content.thumbnail_url ? (
              <img src={content.thumbnail || content.thumbnail_url} className="w-full h-48 object-cover rounded-xl mb-4 border border-slate-200" alt="Thumbnail" />
            ) : null}
            <p className="font-bold text-slate-900 text-lg mb-2">{content.title}</p>
            <p className="text-slate-600 text-sm line-clamp-3">{content.description}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Resolve Report" size="lg">
      <div className="p-8 space-y-8">
        {/* Report Info */}
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900">Review Report</h3>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="text-sm font-medium">Reported by</span>
              <span className="text-sm font-bold text-slate-800">{report.reporter_name}</span>
            </div>
          </div>
          <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl border border-rose-100 flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest">{report.reason}</span>
          </div>
        </div>

        {/* Reported Content Preview */}
        {renderContent()}

        {/* Actions */}
        {report.status === 'PENDING' && (
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Take Action</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.target_type.includes('COMMENT') ? (
                <button
                  disabled={processing}
                  onClick={() => handleAction('DELETE_COMMENT')}
                  className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all font-bold text-sm active:scale-95 disabled:opacity-50"
                >
                  <HiOutlineTrash className="w-5 h-5" /> Delete Comment
                </button>
              ) : report.target_type === 'USER' ? (
                <button
                  disabled={processing}
                  onClick={() => handleAction('DEACTIVATE_USER')}
                  className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all font-bold text-sm active:scale-95 disabled:opacity-50"
                >
                  <HiOutlineUserMinus className="w-5 h-5" /> Deactivate User
                </button>
              ) : (
                <button
                  disabled={processing}
                  onClick={() => handleAction('DELETE_POST')}
                  className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all font-bold text-sm active:scale-95 disabled:opacity-50"
                >
                  <HiOutlineTrash className="w-5 h-5" /> Delete Post
                </button>
              )}

              <button
                disabled={processing}
                onClick={() => handleAction('DISMISS')}
                className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100 transition-all font-bold text-sm active:scale-95 disabled:opacity-50"
              >
                <HiOutlineNoSymbol className="w-5 h-5" /> Dismiss Report
              </button>
            </div>
          </div>
        )}

        {report.status === 'RESOLVED' && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 flex items-center justify-center gap-3">
            <HiOutlineCheckCircle className="w-5 h-5" />
            <span className="font-bold text-sm">This report has been resolved.</span>
          </div>
        )}
      </div>
    </Modal>
  );
}

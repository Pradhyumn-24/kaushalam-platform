import React, { useEffect, useState } from 'react';
import { NotificationLog } from '../types';
import { api } from '../services/api';
import { Mail, RefreshCw, X, CheckCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export const OutboxModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeItem, setActiveItem] = useState<NotificationLog | null>(null);

  const fetchOutbox = async () => {
    try {
      setLoading(true);
      const res = await api.getOutbox();
      setLogs(res.outbox);
      if (res.outbox.length > 0 && !activeItem) {
        setActiveItem(res.outbox[0]);
      }
    } catch (err) {
      console.error('Failed to fetch notification outbox:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOutbox();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
      <div className="bg-white border border-[#D3D1CB] rounded-xl max-w-4xl w-full p-6 shadow-xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E9E9E7] mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl select-none">📬</div>
            <div>
              <h3 className="text-base font-bold text-[#37352F] flex items-center gap-2">
                System Outbox & SMTP Notifications
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#F1F1EF] text-[#787774] px-2 py-0.5 rounded border border-[#E9E9E7]">
                  SQLite Queue
                </span>
              </h3>
              <p className="text-xs text-[#787774]">
                Live transactional notification logs for peer session requests, approvals, and rejections.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={fetchOutbox}
              disabled={loading}
              className="p-1.5 rounded-md text-[#787774] hover:text-[#37352F] hover:bg-[#F1F1EF] transition-colors"
              title="Refresh outbox logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[#787774] hover:text-[#37352F] hover:bg-[#F1F1EF] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Diagnostic info banner */}
        <div className="mb-4 p-3 rounded-lg bg-[#FAF9F6] border border-[#E9E9E7] text-xs text-[#787774] flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#37352F] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-[#37352F]">SMTP Integration & Safe Fallback:</span> Outgoing emails are delivered in real time when SMTP credentials (<code className="text-[#37352F] font-mono">MAIL_SERVER</code>, <code className="text-[#37352F] font-mono">MAIL_USERNAME</code>) are configured. All dispatches are safely recorded here in the database outbox.
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
          {/* List panel */}
          <div className="md:col-span-5 border border-[#E9E9E7] rounded-lg overflow-y-auto bg-[#FAF9F6] divide-y divide-[#E9E9E7] text-xs">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-[#9B9A97]">
                <Mail className="w-7 h-7 mx-auto mb-2 opacity-40" />
                <p>No notifications generated yet.</p>
                <p className="text-[11px] mt-1 text-[#9B9A97]">
                  Book or approve a peer session to generate outgoing emails.
                </p>
              </div>
            ) : (
              logs.map((item) => {
                const isSelected = activeItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveItem(item)}
                    className={`w-full text-left p-3 transition-colors ${
                      isSelected
                        ? 'bg-white border-l-3 border-l-[#37352F] shadow-xs'
                        : 'hover:bg-[#F1F1EF]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[#37352F] truncate max-w-[180px]">
                        {item.recipient_name}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          item.status === 'sent'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'queued'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[#787774] truncate mb-1">{item.subject}</p>
                    <div className="flex items-center justify-between text-[10px] text-[#9B9A97]">
                      <span>{item.recipient_email}</span>
                      <span>{item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Details panel */}
          <div className="md:col-span-7 border border-[#E9E9E7] rounded-lg p-4 bg-white overflow-y-auto text-xs flex flex-col">
            {activeItem ? (
              <div className="space-y-3">
                <div className="pb-3 border-b border-[#E9E9E7]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#F1F1EF] text-[#37352F] border border-[#E9E9E7]">
                      Event: {activeItem.event_type}
                    </span>
                    <span className="text-[#9B9A97] text-[11px]">
                      Created: {new Date(activeItem.created_at).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#37352F]">{activeItem.subject}</h4>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-lg bg-[#FAF9F6] border border-[#E9E9E7]">
                  <div>
                    <span className="text-[#9B9A97] block">Recipient</span>
                    <span className="text-[#37352F] font-medium">{activeItem.recipient_name}</span>
                  </div>
                  <div>
                    <span className="text-[#9B9A97] block">Email Address</span>
                    <span className="text-[#37352F] font-medium">{activeItem.recipient_email}</span>
                  </div>
                  <div>
                    <span className="text-[#9B9A97] block">Delivery Status</span>
                    <span className="text-[#37352F] font-medium capitalize">{activeItem.status}</span>
                  </div>
                  <div>
                    <span className="text-[#9B9A97] block">Dispatched Timestamp</span>
                    <span className="text-[#37352F] font-medium">{activeItem.sent_at || 'Queued in database'}</span>
                  </div>
                </div>

                {activeItem.error_message && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                    <span className="font-semibold">Diagnostic note:</span> {activeItem.error_message}
                  </div>
                )}

                <div>
                  <span className="text-[#787774] font-semibold block mb-1.5">Notification Payload Preview:</span>
                  <div className="p-3 rounded-md bg-[#FAF9F6] border border-[#E9E9E7] text-[#37352F] font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                    {activeItem.subject}
                    {'\n\n'}
                    Recipient: {activeItem.recipient_email}
                    {'\n'}
                    Status: {activeItem.status}
                    {'\n\n'}
                    [Live HTML template formatted and queued for recipient]
                  </div>
                </div>
              </div>
            ) : (
              <div className="m-auto text-center text-[#9B9A97]">
                Select a notification entry from the list to view transmission details.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#E9E9E7] flex items-center justify-between text-xs text-[#787774] mt-4">
          <span>Total Recorded Logs: {logs.length}</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md bg-[#2F2E2A] hover:bg-[#45433E] text-white transition-colors font-medium shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

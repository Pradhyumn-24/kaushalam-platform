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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                System Outbox & SMTP Notifications
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  SQLite Queue
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Live transactional notification logs for peer session requests, approvals, and rejections.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchOutbox}
              disabled={loading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh outbox logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Diagnostic info banner */}
        <div className="mb-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-slate-100">SMTP Integration & Safe Fallback:</span> Outgoing emails are delivered in real time when SMTP credentials (<code className="text-amber-300">MAIL_SERVER</code>, <code className="text-amber-300">MAIL_USERNAME</code>, <code className="text-amber-300">MAIL_PASSWORD</code>) are configured in the environment. All dispatches are safely recorded here to ensure zero notification loss.
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
          {/* List panel */}
          <div className="md:col-span-5 border border-slate-800 rounded-xl overflow-y-auto bg-slate-950/40 divide-y divide-slate-800/60 text-xs">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No notifications generated yet.</p>
                <p className="text-[11px] mt-1 text-slate-600">
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
                        ? 'bg-teal-950/40 border-l-4 border-l-teal-400'
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-200 truncate max-w-[180px]">
                        {item.recipient_name}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          item.status === 'sent'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : item.status === 'queued'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-slate-400 truncate mb-1">{item.subject}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{item.recipient_email}</span>
                      <span>{item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Details panel */}
          <div className="md:col-span-7 border border-slate-800 rounded-xl p-4 bg-slate-950/60 overflow-y-auto text-xs flex flex-col">
            {activeItem ? (
              <div className="space-y-3">
                <div className="pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-teal-300">
                      Event: {activeItem.event_type}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Created: {new Date(activeItem.created_at).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">{activeItem.subject}</h4>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Recipient</span>
                    <span className="text-slate-200 font-medium">{activeItem.recipient_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Email Address</span>
                    <span className="text-slate-200 font-medium">{activeItem.recipient_email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Delivery Status</span>
                    <span className="text-slate-200 font-medium capitalize">{activeItem.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Dispatched Timestamp</span>
                    <span className="text-slate-200 font-medium">{activeItem.sent_at || 'Queued in database'}</span>
                  </div>
                </div>

                {activeItem.error_message && (
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-200 text-[11px]">
                    <span className="font-semibold">Diagnostic note:</span> {activeItem.error_message}
                  </div>
                )}

                <div>
                  <span className="text-slate-400 font-semibold block mb-1.5">Notification Payload Preview:</span>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
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
              <div className="m-auto text-center text-slate-500">
                Select a notification entry from the list to view transmission details.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 mt-4">
          <span>Total Recorded Logs: {logs.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

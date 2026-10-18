'use client';

import React, { useState } from 'react';
import { MessageCircle, Mail, Phone, Clock, CheckCircle2, User } from 'lucide-react';
import { IInquiry } from '@/types';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/common/Badge';

export interface InquiryListProps {
  initialInquiries: IInquiry[];
}

export const InquiryList: React.FC<InquiryListProps> = ({ initialInquiries }) => {
  const [inquiries, setInquiries] = useState<IInquiry[]>(initialInquiries);
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = inquiries.filter((inq) =>
    filterStatus === 'all' ? true : inq.status === filterStatus
  );

  const handleStatusChange = async (
    id: string,
    newStatus: 'new' | 'contacted' | 'converted' | 'closed'
  ) => {
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setInquiries(
          inquiries.map((inq) =>
            (inq.id === id || inq._id === id) ? { ...inq, status: newStatus } : inq
          )
        );
      }
    } catch (e) {
      console.error('Error updating status:', e);
    }
  };

  const getWhatsAppReplyUrl = (inquiry: IInquiry) => {
    const rawNumber = inquiry.phone.replace(/[^0-9]/g, '');
    const text = `Hello ${inquiry.name},

Thank you for contacting Quartz Times about ${inquiry.product || 'our watches'}.
I am following up on your message: "${inquiry.message}".

How may I assist you with high-definition media or acquisition details today?`;

    return `https://wa.me/${rawNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'all', label: 'All Inquiries' },
          { id: 'new', label: 'New / Unread' },
          { id: 'contacted', label: 'Contacted' },
          { id: 'converted', label: 'Acquired / Converted' },
          { id: 'closed', label: 'Closed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterStatus === tab.id
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inquiry Cards List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((inq) => {
            const id = inq.id || inq._id || '';
            const statusVariants: Record<string, 'gold' | 'warning' | 'success' | 'neutral'> = {
              new: 'warning',
              contacted: 'gold',
              converted: 'success',
              closed: 'neutral',
            };

            return (
              <div
                key={id}
                className="p-5 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {inq.name}
                      </h4>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Received on {formatDate(inq.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariants[inq.status]} size="sm">
                      {inq.status}
                    </Badge>

                    <select
                      value={inq.status}
                      onChange={(e) => handleStatusChange(id, e.target.value as any)}
                      aria-label="Change inquiry status"
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="new">Mark as New</option>
                      <option value="contacted">Mark Contacted</option>
                      <option value="converted">Mark Converted</option>
                      <option value="closed">Mark Closed</option>
                    </select>
                  </div>
                </div>

                {/* Inquired Product info */}
                {inq.product && (
                  <div className="bg-slate-50 dark:bg-slate-950/70 p-2.5 rounded border border-slate-200 dark:border-slate-800/60 text-xs flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Watch:</span>
                    <span className="font-medium text-amber-600 dark:text-amber-400">{inq.product}</span>
                  </div>
                )}

                {/* Message Body */}
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-light whitespace-pre-line bg-slate-50 dark:bg-slate-950/40 p-3 rounded-lg border border-slate-100 dark:border-slate-900">
                  &ldquo;{inq.message}&rdquo;
                </p>

                {/* Client Contact Info & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{inq.phone}</span>
                    </div>
                    {inq.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>{inq.email}</span>
                      </div>
                    )}
                  </div>

                  <a
                    href={getWhatsAppReplyUrl(inq)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg transition-all"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Reply on WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 text-center text-xs text-slate-400 dark:text-slate-500">
            No inquiries under &ldquo;{filterStatus}&rdquo; status.
          </div>
        )}
      </div>
    </div>
  );
};

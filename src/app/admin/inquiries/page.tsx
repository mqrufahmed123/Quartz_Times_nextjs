import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { getInquiries } from '@/services/inquiryService';
import { InquiryList } from '@/components/admin/InquiryList';

export default async function AdminInquiriesPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const inquiriesData = await getInquiries(50, 1);

  return (
    <div className="space-y-8">
      <div className="border-b border-luxury-800 pb-6">
        <span className="text-[10px] uppercase tracking-ultra text-gold font-semibold block">
          Client Relations
        </span>
        <h1 className="font-serif text-3xl text-luxury-100 font-normal">
          Client Concierge Inquiries
        </h1>
        <p className="text-xs text-luxury-400 mt-1">
          Review incoming client inquiries, track pipeline status, and connect directly on WhatsApp.
        </p>
      </div>

      <InquiryList initialInquiries={inquiriesData.items} />
    </div>
  );
}

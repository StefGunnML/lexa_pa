"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { Card, Button, Badge } from '@/components/ui/core';
import Link from 'next/link';

export default function ThreadDetail() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-16">
      <header className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/threads" className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] hover:text-[#0f172a] transition-colors">
            ← Back to Inbox
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-5xl font-bold tracking-tight text-slate-900">Thread Context</h2>
          <Badge variant="success" className="font-bold">Active Intel</Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">
          <Card className="border-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Rolling Summary (DeepSeek 70B)
              </div>
              <p className="text-xl text-slate-700 leading-relaxed italic-mercury">
                "The conversation is currently centered around final term sheet adjustments. The counterparty is pushing for a 20% discount, which conflicts with our core strategy. Tactical advice is to pivot to ROI."
              </p>
            </div>
          </Card>

          <div className="space-y-8">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Message History</h4>
            {[1, 2].map((m) => (
              <div key={m} className="p-8 rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-bold text-slate-900">Counterparty Name</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">2 hours ago</span>
                </div>
                <p className="text-base text-slate-600 leading-relaxed">
                  "Hi, we've reviewed the numbers. If we can get a 20% discount on the seat license, we're ready to sign the full team by Friday."
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-12">
          <div className="space-y-6">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Strategic Leverage</h4>
            <Card className="bg-amber-50 border-amber-100 shadow-none">
              <ul className="space-y-6">
                <li className="text-sm text-amber-800 font-medium leading-relaxed italic-mercury">
                  • They previously agreed to premium pricing for 2-week delivery.
                </li>
                <li className="text-sm text-amber-800 font-medium leading-relaxed italic-mercury">
                  • Budget cycle ends this week; they are under pressure to deploy.
                </li>
              </ul>
            </Card>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Command Actions</h4>
            <div className="flex flex-col gap-4">
              <Button variant="primary" className="py-6 shadow-xl">Draft Reply (AI)</Button>
              <Button variant="secondary" className="py-6">Log Commitment</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
  );
}

"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { Card, Button, Badge } from '@/components/ui/core';
import Link from 'next/link';

export default function ThreadDetail() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/threads" className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] hover:text-white transition-colors">
            ← Back to Inbox
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-light tracking-tight text-slate-100 italic-mercury">Thread Details: {id}</h2>
          <Badge variant="success">Active Intelligence</Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-slate-800/40">
            <div className="space-y-6">
              <div className="flex items-center gap-3 opacity-60">
                <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rolling Summary (DeepSeek 70B)</span>
              </div>
              <p className="text-lg font-light text-slate-300 leading-relaxed italic-mercury">
                "The conversation is currently centered around final term sheet adjustments. The counterparty is pushing for a 20% discount, which conflicts with our core strategy. Tactical advice is to pivot to ROI."
              </p>
            </div>
          </Card>

          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-widest ml-1">Message History</h4>
            {[1, 2].map((m) => (
              <div key={m} className="p-6 rounded-xl border border-slate-800/40 bg-slate-900/20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-slate-400 italic-mercury">Counterparty Name</span>
                  <span className="text-[9px] text-slate-600 uppercase tracking-widest">2 hours ago</span>
                </div>
                <p className="text-sm font-light text-slate-400 leading-relaxed">
                  "Hi, we've reviewed the numbers. If we can get a 20% discount on the seat license, we're ready to sign the full team by Friday."
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-widest ml-1">Strategic Leverage</h4>
            <Card className="bg-amber-900/5 border-amber-900/20">
              <ul className="space-y-4">
                <li className="text-xs text-amber-200/70 font-light leading-relaxed italic-mercury">
                  • They previously agreed to premium pricing for 2-week delivery.
                </li>
                <li className="text-xs text-amber-200/70 font-light leading-relaxed italic-mercury">
                  • Budget cycle ends this week; they are under pressure to deploy.
                </li>
              </ul>
            </Card>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-widest ml-1">Actions</h4>
            <div className="flex flex-col gap-3">
              <Button variant="primary">Draft Reply (AI)</Button>
              <Button variant="outline">Log Commitment</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

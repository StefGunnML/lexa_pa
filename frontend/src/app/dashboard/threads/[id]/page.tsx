"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { Card, Button, Badge } from '@/components/ui/core';
import Link from 'next/link';

export default function ThreadDetail() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-16 font-sans">
      <header className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/threads" className="font-mono text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] hover:text-blue-600 transition-colors">
            [ BACK_TO_ARCHIVE ]
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-5xl font-extrabold tracking-tight text-slate-900">Thread Detail</h2>
          <Badge variant="success" className="font-bold">INTEL_STREAM: ACTIVE</Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">
          <Card className="border-blue-100 bg-blue-50/10">
            <div className="space-y-6">
              <div className="font-mono text-[9px] font-black text-blue-600 uppercase tracking-widest">
                [RECURSIVE_SUMMARY_DEEPSEEK_70B]
              </div>
              <p className="text-xl text-slate-700 leading-relaxed italic font-serif">
                "Detecting strategic misalignment in term sheet negotiations. Counterparty requesting 20% discount—violates Rule_3 of Founder_Playbook. Tactical recommendation: Pivot to ROI and premium speed delivery."
              </p>
            </div>
          </Card>

          <div className="space-y-8">
            <h4 className="font-mono text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"># MESSAGE_HISTORY</h4>
            {[1, 2].map((m) => (
              <div key={m} className="p-10 border border-slate-100 bg-white shadow-sm rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-bold text-slate-900">COUNTERPARTY_ENTITY</span>
                  <span className="font-mono text-[9px] font-bold text-slate-300 uppercase tracking-widest">T-120_MINUTES</span>
                </div>
                <p className="text-base text-slate-600 leading-relaxed">
                  "Acknowledging receipt of the updated deck. Requesting a 20% seat license reduction for Friday commitment."
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-12">
          <div className="space-y-6">
            <h4 className="font-mono text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"># STRATEGIC_LEVERAGE</h4>
            <div className="p-8 bg-amber-50 border border-amber-100 rounded-2xl">
              <ul className="space-y-6">
                <li className="text-sm text-amber-800 font-bold leading-relaxed italic">
                  • Entity previously conceded to premium pricing for accelerated deployment.
                </li>
                <li className="text-sm text-amber-800 font-bold leading-relaxed italic">
                  • Quarterly budget expiration detected (T-72H); high pressure to deploy capital.
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-mono text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"># COMMAND_ACTIONS</h4>
            <div className="flex flex-col gap-4">
              <Button variant="primary" className="py-6 uppercase">DRAFT_REPLY_AI</Button>
              <Button variant="secondary" className="py-6 uppercase">LOG_COMMITMENT</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

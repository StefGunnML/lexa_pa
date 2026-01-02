"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { Card, Button, Badge } from '@/components/ui/core';
import Link from 'next/link';

export default function ThreadDetail() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-16 font-mono">
      <header className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/threads" className="text-[11px] font-bold text-[#FFB000]/40 uppercase tracking-[0.4em] hover:text-[#FFB000] transition-colors">
            [ BACK_TO_ARCHIVE ]
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-5xl font-bold tracking-tighter text-[#FFB000] uppercase animate-flicker">Thread Context</h2>
          <Badge variant="success" className="font-bold border-emerald-500/40">LIVE_INTEL_STREAM</Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">
          <Card className="border-[#FFB000]/20 shadow-[0_0_20px_rgba(255,176,0,0.05)]">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-[10px] font-bold text-[#FFB000]/40 uppercase tracking-widest">
                [RECURSIVE_SUMMARY_DEEPSEEK_70B]
              </div>
              <p className="text-xl text-[#FFB000]/80 leading-relaxed italic">
                "Detecting strategic misalignment in term sheet negotiations. Counterparty requesting 20% discount—violates Rule_3 of Founder_Playbook. Recommendation: Pivot to ROI and premium speed delivery."
              </p>
            </div>
          </Card>

          <div className="space-y-8">
            <h4 className="text-sm font-bold text-[#FFB000]/40 uppercase tracking-widest ml-1"># MESSAGE_HISTORY</h4>
            {[1, 2].map((m) => (
              <div key={m} className="p-8 border border-[#FFB000]/10 bg-black/40">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-bold text-[#FFB000]">COUNTERPARTY_ENTITY</span>
                  <span className="text-[10px] font-bold text-[#FFB000]/20 uppercase tracking-widest">T-120_MINUTES</span>
                </div>
                <p className="text-base text-[#FFB000]/60 leading-relaxed">
                  "Acknowledging receipt of the updated deck. Requesting a 20% seat license reduction for Friday commitment."
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-12">
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-[#FFB000]/40 uppercase tracking-widest ml-1"># STRATEGIC_LEVERAGE</h4>
            <Card className="bg-amber-500/5 border-amber-500/20 shadow-none">
              <ul className="space-y-6">
                <li className="text-sm text-amber-500/80 font-medium leading-relaxed italic">
                  • Entity previously conceded to premium pricing for accelerated deployment.
                </li>
                <li className="text-sm text-amber-500/80 font-medium leading-relaxed italic">
                  • Quarterly budget expiration detected (T-72H); high pressure to deploy capital.
                </li>
              </ul>
            </Card>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-bold text-[#FFB000]/40 uppercase tracking-widest ml-1"># COMMAND_ACTIONS</h4>
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

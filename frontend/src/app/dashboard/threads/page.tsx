"use client";

import React, { useState, useEffect } from 'react';
import { Card, Badge } from '@/components/ui/core';
import Link from 'next/link';

interface Thread {
  id: string;
  title: string;
  source: 'gmail' | 'slack' | 'whatsapp';
  rolling_summary: any;
  last_updated: string;
}

export default function CommunicationThreads() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockThreads: Thread[] = [
      {
        id: "T1",
        title: "Seed Round Discussion - Stark Industries",
        source: "gmail",
        rolling_summary: {
          strategic_context: "Active negotiation for Series A participation.",
          status: "Waiting for investor feedback",
          key_decisions: ["Valuation cap agreed at $20M"],
          pending_tasks: ["Send updated deck by Friday"],
          sentiment: "Professional, slightly cautious"
        },
        last_updated: new Date().toISOString()
      },
      {
        id: "T2",
        title: "Project Compass Integration",
        source: "slack",
        rolling_summary: {
          strategic_context: "Internal team coordination on API endpoints.",
          status: "In progress",
          key_decisions: ["Use SSE for real-time positioning"],
          pending_tasks: ["Optimize DeepSeek prompts"],
          sentiment: "Productive, high energy"
        },
        last_updated: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "T3",
        title: "Quick Sync - Mark",
        source: "whatsapp",
        rolling_summary: {
          strategic_context: "Casual channel for immediate pings.",
          status: "Action required",
          key_decisions: ["Confirmed coffee meeting"],
          pending_tasks: ["Review WhatsApp term sheet screenshot"],
          sentiment: "Urgent, informal"
        },
        last_updated: new Date(Date.now() - 7200000).toISOString()
      }
    ];
    setThreads(mockThreads);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-16 font-mono">
      <header className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#FFB000]/40 uppercase tracking-[0.4em]">THREAD_ARCHIVE_BROWSER</span>
        </div>
        <h2 className="text-6xl font-bold tracking-tighter text-[#FFB000] uppercase animate-flicker">Inbox</h2>
        <p className="text-[#FFB000]/60 text-xl max-w-2xl font-medium leading-relaxed uppercase">
          Synthesizing historical communication streams... <span className="text-[#FFB000] underline underline-offset-8">recursive_summaries</span> ready for recall.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-32 gap-6">
          <div className="w-10 h-10 border-t-2 border-[#FFB000] animate-spin"></div>
          <p className="text-[11px] font-bold text-[#FFB000] uppercase tracking-[0.2em]">RECALLING_THREADS</p>
        </div>
      ) : (
        <div className="space-y-8">
          {threads.map(thread => (
            <Link key={thread.id} href={`/dashboard/threads/${thread.id}`} className="block group">
              <Card className="border-[#FFB000]/20 hover:border-[#FFB000]/50 transition-all duration-300 p-10">
                <div className="flex flex-col gap-8">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <Badge variant="default" className="font-bold border-[#FFB000]/40">{thread.source.toUpperCase()}</Badge>
                        <h3 className="text-2xl font-bold text-[#FFB000] tracking-tighter uppercase transition-colors">
                          {thread.title}
                        </h3>
                      </div>
                      <p className="text-[11px] text-[#FFB000]/40 uppercase tracking-widest font-bold">
                        LAST_SYNC: {new Date(thread.last_updated).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }).toUpperCase()}
                      </p>
                    </div>
                    <div className="w-10 h-10 border border-[#FFB000]/20 flex items-center justify-center group-hover:bg-[#FFB000] group-hover:text-black transition-all duration-300">
                      <span className="text-lg font-bold">→</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-[#FFB000]/10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-[10px] font-bold text-[#FFB000]/40 uppercase tracking-widest">
                        [STRATEGIC_CONTEXT]
                      </div>
                      <p className="text-base text-[#FFB000]/80 leading-relaxed italic">
                        "{thread.rolling_summary.strategic_context}"
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-[10px] font-bold text-[#FFB000]/40 uppercase tracking-widest">
                        [PENDING_TASKS]
                      </div>
                      <ul className="space-y-3">
                        {thread.rolling_summary.pending_tasks.map((task: string, i: number) => (
                          <li key={i} className="text-sm font-medium text-[#FFB000]/60 flex items-start gap-3">
                            <span className="w-1.5 h-1.5 bg-[#FFB000]/20 mt-1.5 shrink-0"></span>
                            {task.toUpperCase()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
  );
}

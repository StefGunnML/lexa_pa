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
    <div className="space-y-12">
      <header className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Universal Context</span>
        </div>
        <h2 className="text-4xl font-light tracking-tight text-slate-100">Inbox</h2>
        <p className="text-slate-400 text-base max-w-2xl font-light leading-relaxed">
          Aggregated communication threads across all primary nodes. Each thread maintains a living <span className="text-slate-200">recursive summary</span> for instant strategic recall.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 gap-4">
          <div className="w-6 h-6 border-t-2 border-slate-400 rounded-full animate-spin"></div>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest italic">Recalling Threads</p>
        </div>
      ) : (
        <div className="space-y-6">
          {threads.map(thread => (
            <Link key={thread.id} href={`/dashboard/threads/${thread.id}`} className="block">
              <Card className="group border-slate-800/40 cursor-pointer transition-all hover:border-slate-600/50">
                <div className="flex flex-col gap-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <Badge variant="default">{thread.source}</Badge>
                        <h3 className="text-xl font-medium text-slate-200 group-hover:text-white transition-colors tracking-tight italic-mercury">
                          {thread.title}
                        </h3>
                      </div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                        Last update: {new Date(thread.last_updated).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center group-hover:border-slate-500 group-hover:bg-slate-800/50 transition-all">
                      <span className="text-slate-400 group-hover:text-white text-xs">→</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-800/30">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 opacity-60 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                        Strategic Context
                      </div>
                      <p className="text-sm font-light text-slate-300 leading-relaxed italic-mercury">
                        "{thread.rolling_summary.strategic_context}"
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 opacity-60 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                        Pending Logic
                      </div>
                      <ul className="space-y-2">
                        {thread.rolling_summary.pending_tasks.map((task: string, i: number) => (
                          <li key={i} className="text-xs font-light text-slate-500 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                            {task}
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

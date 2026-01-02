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
    <div className="space-y-16 pb-20 font-sans">
      <header className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="system-label">ARCHIVE: INDEXED</span>
          <span className="system-label">NODES: GMAIL, SLACK</span>
        </div>
        <h2 className="text-5xl font-bold tracking-tighter text-foreground">Inbox</h2>
        <p className="text-muted-foreground text-xl max-w-2xl font-medium leading-relaxed">
          Aggregated communication streams. Recursive summaries indexed for <span className="text-foreground font-bold underline decoration-border decoration-2 underline-offset-4">strategic recall</span>.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-32 gap-6">
          <div className="w-8 h-8 border border-border border-t-foreground animate-spin"></div>
          <p className="font-mono text-[9px] font-medium text-muted-foreground uppercase tracking-[0.2em]">RECALLING_INTELLIGENCE</p>
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map(thread => (
            <Link key={thread.id} href={`/dashboard/threads/${thread.id}`} className="block group">
              <Card className="p-8 hover:border-foreground/20">
                <div className="flex flex-col gap-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <Badge variant="default">{thread.source.toUpperCase()}</Badge>
                        <h3 className="text-xl font-bold text-foreground group-hover:text-black transition-colors tracking-tight">
                          {thread.title}
                        </h3>
                      </div>
                      <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
                        LAST_SYNC: {new Date(thread.last_updated).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }).toUpperCase()}
                      </p>
                    </div>
                    <div className="w-8 h-8 border border-border flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300">
                      <span className="text-lg">→</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6 border-t border-border">
                    <div className="space-y-2">
                      <div className="font-mono text-[9px] font-medium text-muted-foreground uppercase tracking-widest">
                        CONTEXT
                      </div>
                      <p className="text-sm text-foreground/70 leading-relaxed font-sans">
                        "{thread.rolling_summary.strategic_context}"
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="font-mono text-[9px] font-medium text-muted-foreground uppercase tracking-widest">
                        TASKS
                      </div>
                      <ul className="space-y-1.5">
                        {thread.rolling_summary.pending_tasks.map((task: string, i: number) => (
                          <li key={i} className="text-[11px] font-medium text-foreground/60 flex items-start gap-2">
                            <span className="w-1 h-1 bg-border mt-1.5 shrink-0"></span>
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

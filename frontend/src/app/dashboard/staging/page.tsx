"use client";

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui/core';

interface PendingAction {
  id: string;
  type: string;
  status: string;
  data: any;
  confidence_score: number;
  source_link: string;
  created_at: string;
}

export default function StagingArea() {
  const [actions, setActions] = useState<PendingAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch from FastAPI
    const mockActions: PendingAction[] = [
      {
        id: "1",
        type: "calendar_invite",
        status: "pending",
        confidence_score: 0.92,
        source_link: "https://mail.google.com/mail/u/0/#all/msg-123",
        data: {
          title: "Follow up with Mark regarding Seed Round",
          deadline: "2026-01-15T10:00:00Z",
          reasoning: "Based on the Gmail thread from this morning."
        },
        created_at: new Date().toISOString()
      },
      {
        id: "2",
        type: "merge_profiles",
        status: "pending",
        confidence_score: 0.82,
        source_link: "#",
        data: {
          name: "Mark Johnson",
          platforms: ["Gmail (mark.j@gmail.com)", "WhatsApp (+1 234 567 890)"],
          confidence: 0.82
        },
        created_at: new Date().toISOString()
      },
      {
        id: "3",
        type: "email_draft",
        status: "pending",
        confidence_score: 0.98,
        source_link: "https://slack.com/archives/C12345/p123456789",
        data: {
          to: "sarah@venture.vc",
          subject: "Project Compass Deck",
          body: "Hi Sarah, as discussed in our call, here is the updated deck...",
          reasoning: "Extracted from meeting notes at 11:30 AM."
        },
        created_at: new Date().toISOString()
      }
    ];
    setActions(mockActions);
    setLoading(false);
  }, []);

  const handleAction = (id: string, decision: 'approved' | 'rejected') => {
    setActions(actions.filter(a => a.id !== id));
    // In production: await fetch(`/api/actions/${id}`, { method: 'POST', body: JSON.stringify({ status: decision }) })
  };

  return (
    <div className="space-y-20 pb-20 font-sans">
      <header className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="system-label">NODE_STATUS: ACTIVE</span>
          <span className="system-label">MODE: STRATEGIC</span>
        </div>
        <h2 className="text-6xl font-extrabold tracking-tight text-slate-900">Staging Area</h2>
        <p className="text-slate-500 text-xl max-w-2xl font-medium leading-relaxed">
          Synthesizing multi-node intelligence... Review and authorize <span className="text-blue-600 font-bold">strategic_actions</span> proposed by your Chief of Staff.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-32 gap-6">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-mono text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recalling_Global_State</p>
        </div>
      ) : (
        <div className="space-y-10">
          {actions.length === 0 ? (
            <div className="text-center p-32 border border-slate-200 bg-white/50 rounded-2xl">
              <p className="text-slate-400 text-sm uppercase tracking-[0.2em] font-bold">System Idle</p>
            </div>
          ) : (
            actions.map(action => (
              <Card key={action.id} className="group">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-12">
                  <div className="flex-1 space-y-10">
                    <div className="flex flex-wrap items-center gap-8">
                      <Badge variant={action.type === 'merge_profiles' ? 'warning' : 'default'}>
                        {action.type.replace('_', ' ')}
                      </Badge>
                      
                      <div className="flex items-center gap-6">
                        {action.confidence_score >= 0.85 ? (
                          <div className="flex items-center gap-2.5 text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                            <div className="w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            Verified Intel
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5 text-amber-600 font-bold text-[10px] uppercase tracking-widest">
                            <div className="w-1 h-1 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                            Requires Review
                          </div>
                        )}

                        {action.source_link !== "#" && (
                          <a 
                            href={action.source_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-all uppercase tracking-widest border-b border-transparent hover:border-blue-600/30 pb-0.5"
                          >
                            Source Link
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      {action.type === 'calendar_invite' && (
                        <div className="space-y-3">
                          <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">{action.data.title}</h3>
                          <p className="text-lg text-slate-500 font-medium">
                            Scheduled: {new Date(action.data.deadline).toLocaleDateString(undefined, { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      )}

                      {action.type === 'merge_profiles' && (
                        <div className="space-y-6">
                          <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">Identity Match: {action.data.name}</h3>
                          <div className="flex flex-wrap gap-3">
                            {action.data.platforms.map((p: string, i: number) => (
                              <div key={i} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-600">
                                {p}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {action.type === 'email_draft' && (
                        <div className="space-y-8">
                          <div className="space-y-2">
                            <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">{action.data.subject}</h3>
                            <p className="text-base text-slate-400 font-medium italic">To: {action.data.to}</p>
                          </div>
                          <div className="p-10 bg-slate-50/50 border border-slate-100 rounded-xl text-lg leading-relaxed text-slate-700 italic font-serif">
                            "{action.data.body}"
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-8 bg-blue-50/30 border-l-2 border-blue-200 space-y-4">
                      <div className="flex items-center gap-3 opacity-60">
                        <span className="font-mono text-[9px] font-black text-blue-600 uppercase tracking-[0.3em]">Strategic Logic</span>
                      </div>
                      <p className="text-base font-medium text-slate-700 leading-relaxed italic">
                        {action.data.reasoning || "Analyzing communication vectors for strategic dominance..."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-4 min-w-[180px]">
                    <Button onClick={() => handleAction(action.id, 'approved')} variant="primary" size="lg" className="flex-1">
                      Execute
                    </Button>
                    <Button onClick={() => {}} variant="outline" size="lg" className="flex-1">
                      Adjust
                    </Button>
                    <Button onClick={() => handleAction(action.id, 'rejected')} variant="destructive" size="lg" className="flex-1">
                      Scrap
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}



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
    <div className="space-y-24 pb-20">
      <header className="space-y-8">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Operational Context</span>
        </div>
        <h2 className="text-6xl font-bold tracking-tight text-slate-900">Staging Area</h2>
        <p className="text-slate-500 text-xl max-w-2xl font-normal leading-relaxed">
          Intelligence synthesized from your primary nodes. Review and authorize <span className="text-slate-900 font-semibold">strategic actions</span> proposed by your AI Chief of Staff.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-32 gap-6">
          <div className="w-10 h-10 border-t-2 border-slate-900 rounded-full animate-spin"></div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Synchronizing State</p>
        </div>
      ) : (
        <div className="space-y-12">
          {actions.length === 0 ? (
            <div className="text-center p-32 border border-slate-200 bg-slate-50/50 rounded-3xl">
              <p className="text-slate-400 text-sm uppercase tracking-[0.4em] font-bold">No Pending Actions</p>
            </div>
          ) : (
            actions.map(action => (
              <Card key={action.id} className="group hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 border-slate-200/60">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-16">
                  <div className="flex-1 space-y-12">
                    <div className="flex flex-wrap items-center gap-10">
                      <Badge variant={action.type === 'merge_profiles' ? 'warning' : 'default'} className="px-4 py-1.5 font-bold">
                        {action.type.replace('_', ' ')}
                      </Badge>
                      
                      <div className="flex items-center gap-8">
                        {action.confidence_score >= 0.85 ? (
                          <div className="flex items-center gap-3 text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            Verified Intel
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-amber-600 font-bold text-[10px] uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                            Review Required
                          </div>
                        )}

                        {action.source_link !== "#" && (
                          <a 
                            href={action.source_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest border-b border-transparent hover:border-slate-200 pb-1"
                          >
                            Source Link
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      {action.type === 'calendar_invite' && (
                        <div className="space-y-4">
                          <h3 className="text-5xl font-bold text-slate-900 tracking-tight leading-tight">{action.data.title}</h3>
                          <p className="text-2xl text-slate-500 font-medium tracking-tight">
                            Scheduled for {new Date(action.data.deadline).toLocaleDateString(undefined, { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      )}

                      {action.type === 'merge_profiles' && (
                        <div className="space-y-8">
                          <h3 className="text-5xl font-bold text-slate-900 tracking-tight leading-tight">Identity Match: {action.data.name}</h3>
                          <div className="flex flex-wrap gap-5">
                            {action.data.platforms.map((p: string, i: number) => (
                              <div key={i} className="px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-base font-bold text-slate-600 tracking-tight">
                                {p}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {action.type === 'email_draft' && (
                        <div className="space-y-10">
                          <div className="space-y-3">
                            <h3 className="text-5xl font-bold text-slate-900 tracking-tight leading-tight">{action.data.subject}</h3>
                            <p className="text-xl text-slate-400 font-medium italic">Recipient: {action.data.to}</p>
                          </div>
                          <div className="p-12 bg-slate-50/50 rounded-3xl border border-slate-200/60 text-xl leading-relaxed text-slate-700 italic shadow-inner">
                            "{action.data.body}"
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-10 bg-slate-50 rounded-3xl border-l-4 border-slate-200 space-y-5">
                      <div className="flex items-center gap-4 opacity-60">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Strategic Logic</span>
                      </div>
                      <p className="text-lg font-medium text-slate-600 leading-relaxed italic">
                        {action.data.reasoning || "Contextual analysis of recent communication streams and session commitments."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-5 min-w-[200px]">
                    <Button onClick={() => handleAction(action.id, 'approved')} variant="primary" className="flex-1 py-8 shadow-xl">
                      COMMIT
                    </Button>
                    <Button onClick={() => {}} variant="secondary" className="flex-1 py-8">
                      ADJUST
                    </Button>
                    <Button onClick={() => handleAction(action.id, 'rejected')} variant="destructive" className="flex-1 py-8 opacity-60 hover:opacity-100">
                      ARCHIVE
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



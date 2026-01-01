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
    <div className="space-y-20">
      <header className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Operational Briefing</span>
        </div>
        <h2 className="text-5xl font-bold tracking-tighter text-white">Staging Area</h2>
        <p className="text-xl text-slate-400 max-w-3xl font-normal leading-relaxed">
          Intelligence synthesized from your primary nodes. Review and authorize strategic actions proposed by your <span className="text-white font-semibold">AI Chief of Staff</span>.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-32 gap-6">
          <div className="w-10 h-10 border-t-2 border-white rounded-full animate-spin"></div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Synchronizing State</p>
        </div>
      ) : (
        <div className="space-y-16">
          {actions.length === 0 ? (
            <div className="text-center p-32 border-2 border-dashed border-slate-800 rounded-3xl">
              <p className="text-slate-600 text-sm uppercase tracking-[0.3em] font-bold">No Pending Actions</p>
            </div>
          ) : (
            actions.map(action => (
              <Card key={action.id} className="group border-slate-800/60 hover:border-slate-700 transition-all p-10">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-12">
                  <div className="flex-1 space-y-10">
                    <div className="flex flex-wrap items-center gap-8">
                      <Badge variant={action.type === 'merge_profiles' ? 'warning' : 'default'} className="px-4 py-1.5 text-[10px] tracking-[0.15em]">
                        {action.type.replace('_', ' ')}
                      </Badge>
                      
                      {/* Reliability Layer: High Visibility */}
                      <div className="flex items-center gap-6">
                        {action.confidence_score >= 0.85 ? (
                          <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                            Verified Intelligence
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-amber-500 font-bold text-[10px] uppercase tracking-wider">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Manual Review Suggested
                          </div>
                        )}

                        {action.source_link !== "#" && (
                          <a 
                            href={action.source_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest border-b border-transparent hover:border-white/20 pb-0.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Verification Source
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {action.type === 'calendar_invite' && (
                        <div className="space-y-4">
                          <h3 className="text-4xl font-bold text-white tracking-tight leading-tight">{action.data.title}</h3>
                          <p className="text-xl text-slate-400 font-medium">
                            Scheduled for {new Date(action.data.deadline).toLocaleDateString(undefined, { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      )}

                      {action.type === 'merge_profiles' && (
                        <div className="space-y-6">
                          <h3 className="text-4xl font-bold text-white tracking-tight leading-tight">Identity Match: {action.data.name}</h3>
                          <div className="flex flex-wrap gap-4">
                            {action.data.platforms.map((p: string, i: number) => (
                              <div key={i} className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm font-medium text-slate-300">
                                {p}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {action.type === 'email_draft' && (
                        <div className="space-y-8">
                          <div className="space-y-2">
                            <h3 className="text-4xl font-bold text-white tracking-tight leading-tight">{action.data.subject}</h3>
                            <p className="text-lg text-slate-400 font-medium italic">Recipient: {action.data.to}</p>
                          </div>
                          <div className="p-10 bg-slate-900/40 rounded-2xl border border-slate-800/50 text-lg leading-relaxed text-slate-200 italic-mercury shadow-inner">
                            "{action.data.body}"
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-8 bg-slate-800/20 rounded-2xl border-l-4 border-slate-700/50 space-y-4">
                      <div className="flex items-center gap-3 opacity-80">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Strategic Logic</span>
                      </div>
                      <p className="text-md font-medium text-slate-300 leading-relaxed italic-mercury">
                        {action.data.reasoning || "Contextual analysis of recent communication streams and session commitments."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-4 min-w-[180px]">
                    <Button onClick={() => handleAction(action.id, 'approved')} variant="primary" className="flex-1 py-6 text-sm font-bold tracking-wide">
                      Confirm
                    </Button>
                    <Button onClick={() => {}} variant="outline" className="flex-1 py-6 text-sm font-bold tracking-wide">
                      Adjust
                    </Button>
                    <Button onClick={() => handleAction(action.id, 'rejected')} variant="destructive" className="flex-1 py-6 text-sm font-bold tracking-wide opacity-60 hover:opacity-100">
                      Archive
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



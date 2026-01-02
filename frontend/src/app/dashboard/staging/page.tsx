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
    <div className="space-y-24 pb-20 font-mono">
      <header className="space-y-8">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#FFB000]/40 uppercase tracking-[0.4em]">SYSTEM_INGESTION_STATUS</span>
        </div>
        <h2 className="text-6xl font-bold tracking-tighter text-[#FFB000] uppercase animate-flicker">Staging Area</h2>
        <p className="text-[#FFB000]/60 text-xl max-w-2xl font-medium leading-relaxed uppercase">
          Synthesizing raw data from primary nodes... Authorize <span className="text-[#FFB000] underline underline-offset-8">strategic_actions</span>.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-32 gap-6">
          <div className="w-10 h-10 border-t-2 border-[#FFB000] animate-spin"></div>
          <p className="text-[11px] font-bold text-[#FFB000] uppercase tracking-[0.2em]">SYNCING_GLOBAL_STATE</p>
        </div>
      ) : (
        <div className="space-y-12">
          {actions.length === 0 ? (
            <div className="text-center p-32 border border-[#FFB000]/10 bg-[#FFB000]/5">
              <p className="text-[#FFB000]/40 text-sm uppercase tracking-[0.4em] font-bold">NO_PENDING_TASKS_FOUND</p>
            </div>
          ) : (
            actions.map(action => (
              <Card key={action.id} className="border-[#FFB000]/20 hover:border-[#FFB000]/50 transition-all duration-300">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-16">
                  <div className="flex-1 space-y-12">
                    <div className="flex flex-wrap items-center gap-10">
                      <Badge variant={action.type === 'merge_profiles' ? 'warning' : 'default'} className="font-bold border-[#FFB000]/40">
                        {action.type.toUpperCase()}
                      </Badge>
                      
                      <div className="flex items-center gap-8">
                        {action.confidence_score >= 0.85 ? (
                          <div className="flex items-center gap-3 text-emerald-500 font-bold text-[10px] uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                            VERIFIED_INTEL
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-amber-500 font-bold text-[10px] uppercase tracking-widest">
                            <div className="w-1.5 h-1.5 bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                            LOW_CONFIDENCE
                          </div>
                        )}

                        {action.source_link !== "#" && (
                          <a 
                            href={action.source_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-[#FFB000]/40 hover:text-[#FFB000] transition-all uppercase tracking-widest border-b border-[#FFB000]/20 hover:border-[#FFB000] pb-1"
                          >
                            [VIEW_SOURCE]
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      {action.type === 'calendar_invite' && (
                        <div className="space-y-4">
                          <h3 className="text-4xl font-bold text-[#FFB000] tracking-tighter uppercase">{action.data.title}</h3>
                          <p className="text-2xl text-[#FFB000]/60 font-medium">
                            SCHEDULED: {new Date(action.data.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase()}
                          </p>
                        </div>
                      )}

                      {action.type === 'merge_profiles' && (
                        <div className="space-y-8">
                          <h3 className="text-4xl font-bold text-[#FFB000] tracking-tighter uppercase">IDENTITY_MATCH: {action.data.name.toUpperCase()}</h3>
                          <div className="flex flex-wrap gap-5">
                            {action.data.platforms.map((p: string, i: number) => (
                              <div key={i} className="px-6 py-4 bg-black border border-[#FFB000]/20 text-sm font-bold text-[#FFB000]/80">
                                {p.toUpperCase()}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {action.type === 'email_draft' && (
                        <div className="space-y-10">
                          <div className="space-y-3">
                            <h3 className="text-4xl font-bold text-[#FFB000] tracking-tighter uppercase">{action.data.subject.toUpperCase()}</h3>
                            <p className="text-xl text-[#FFB000]/40 font-medium font-mono">RECIPIENT: {action.data.to}</p>
                          </div>
                          <div className="p-12 bg-black border border-[#FFB000]/10 text-xl leading-relaxed text-[#FFB000]/80 italic">
                            "{action.data.body}"
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-10 bg-[#FFB000]/5 border-l-2 border-[#FFB000]/40 space-y-5">
                      <div className="flex items-center gap-4 opacity-60">
                        <span className="text-[11px] font-bold text-[#FFB000] uppercase tracking-[0.4em]">STRATEGIC_LOGIC</span>
                      </div>
                      <p className="text-lg font-medium text-[#FFB000]/80 leading-relaxed italic">
                        {action.data.reasoning || "Analyzing communication streams for strategic leverage points..."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-5 min-w-[200px]">
                    <Button onClick={() => handleAction(action.id, 'approved')} variant="primary" className="flex-1 py-8">
                      EXECUTE
                    </Button>
                    <Button onClick={() => {}} variant="secondary" className="flex-1 py-8">
                      MODIFY
                    </Button>
                    <Button onClick={() => handleAction(action.id, 'rejected')} variant="destructive" className="flex-1 py-8 opacity-60">
                      SCRAP
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



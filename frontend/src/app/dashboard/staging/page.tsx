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
          <span className="text-[11px] font-black text-black uppercase tracking-[0.4em] bg-black text-white px-2 py-0.5">STATUS: READY</span>
        </div>
        <h2 className="text-7xl font-black tracking-tighter text-black uppercase">Staging Area</h2>
        <p className="text-black/60 text-2xl max-w-2xl font-bold leading-relaxed uppercase tracking-tighter">
          Synthesizing intelligence... Select <span className="text-black underline underline-offset-8 decoration-4">COMMAND_ACTION</span> to proceed.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-32 gap-6">
          <div className="w-12 h-12 border-4 border-black border-t-transparent animate-spin"></div>
          <p className="text-sm font-black text-black uppercase tracking-[0.3em]">LOADING_SYSTEM_RESOURCES</p>
        </div>
      ) : (
        <div className="space-y-16">
          {actions.length === 0 ? (
            <div className="text-center p-32 border-4 border-dashed border-black">
              <p className="text-black/40 text-xl uppercase tracking-[0.4em] font-black">SYSTEM_IDLE</p>
            </div>
          ) : (
            actions.map(action => (
              <Card key={action.id} className="group">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-16">
                  <div className="flex-1 space-y-12">
                    <div className="flex flex-wrap items-center gap-10">
                      <Badge variant={action.type === 'merge_profiles' ? 'warning' : 'default'} className="text-xs">
                        TYPE: {action.type.toUpperCase()}
                      </Badge>
                      
                      <div className="flex items-center gap-8">
                        {action.confidence_score >= 0.85 ? (
                          <div className="flex items-center gap-3 text-black font-black text-[10px] uppercase tracking-widest border-2 border-black px-3 py-1">
                            INTEL_VERIFIED
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-white bg-black font-black text-[10px] uppercase tracking-widest px-3 py-1 animate-pulse">
                            REVIEW_REQUIRED
                          </div>
                        )}

                        {action.source_link !== "#" && (
                          <a 
                            href={action.source_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] font-black text-black/40 hover:text-black transition-all uppercase tracking-widest underline decoration-2"
                          >
                            [VIEW_SRC]
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="space-y-8">
                      {action.type === 'calendar_invite' && (
                        <div className="space-y-4">
                          <h3 className="text-5xl font-black text-black tracking-tighter uppercase">{action.data.title}</h3>
                          <p className="text-2xl text-black/60 font-bold uppercase">
                            EXEC_DATE: {new Date(action.data.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase()}
                          </p>
                        </div>
                      )}

                      {action.type === 'merge_profiles' && (
                        <div className="space-y-8">
                          <h3 className="text-5xl font-black text-black tracking-tighter uppercase">MATCH: {action.data.name.toUpperCase()}</h3>
                          <div className="flex flex-wrap gap-4">
                            {action.data.platforms.map((p: string, i: number) => (
                              <div key={i} className="px-6 py-4 bg-black text-white text-sm font-black uppercase tracking-tighter">
                                {p}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {action.type === 'email_draft' && (
                        <div className="space-y-10">
                          <div className="space-y-3">
                            <h3 className="text-5xl font-black text-black tracking-tighter uppercase">{action.data.subject.toUpperCase()}</h3>
                            <p className="text-xl text-black/40 font-black">TO: {action.data.to}</p>
                          </div>
                          <div className="p-12 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-2xl leading-relaxed text-black font-serif italic">
                            "{action.data.body}"
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-10 border-4 border-black bg-black text-white space-y-5">
                      <div className="flex items-center gap-4">
                        <span className="text-[11px] font-black uppercase tracking-[0.4em]"># STRATEGIC_LOGIC_70B</span>
                      </div>
                      <p className="text-xl font-bold leading-relaxed tracking-tighter">
                        {action.data.reasoning || "Analyzing communication vectors for strategic dominance..."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-6 min-w-[220px]">
                    <Button onClick={() => handleAction(action.id, 'approved')} variant="primary" className="flex-1 text-lg">
                      EXECUTE
                    </Button>
                    <Button onClick={() => {}} variant="secondary" className="flex-1 text-lg">
                      RE-CODE
                    </Button>
                    <Button onClick={() => handleAction(action.id, 'rejected')} variant="destructive" className="flex-1 text-lg">
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



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

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7243/ingest/b4de5701-9876-47ce-aad5-7d358d247a66', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'staging/page.tsx:StagingArea',
        message: 'Checking StagingArea Implementation',
        data: {
          hasActionBar: true, // This version has the action bar at the bottom
          buttonColor: 'black'
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        hypothesisId: 'H1'
      })
    }).catch(() => {});
  }, []);
  // #endregion

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
    <div className="space-y-16 pb-20 font-sans">
      <header className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="system-label">NODE: ACTIVE</span>
          <span className="system-label">CONTEXT: STRATEGIC</span>
        </div>
        <h2 className="text-5xl font-bold tracking-tighter text-foreground">Staging Area</h2>
        <p className="text-muted-foreground text-xl max-w-2xl font-medium leading-relaxed">
          Intelligence synthesized from multi-node streams. Review and authorize <span className="text-foreground font-bold underline decoration-border decoration-2 underline-offset-4">strategic actions</span>.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-32 gap-6">
          <div className="w-8 h-8 border border-border border-t-foreground animate-spin"></div>
          <p className="font-mono text-[9px] font-medium text-muted-foreground uppercase tracking-[0.2em]">RECALLING_GLOBAL_STATE</p>
        </div>
      ) : (
        <div className="space-y-8">
          {actions.length === 0 ? (
            <div className="text-center p-32 border border-border bg-muted/30">
              <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] font-medium">SYSTEM_IDLE</p>
            </div>
          ) : (
            actions.map(action => (
              <Card key={action.id} className="p-0 overflow-hidden group">
                <div className="p-10 space-y-10">
                  <div className="flex flex-wrap items-center justify-between gap-6">
                    <Badge variant={action.type === 'merge_profiles' ? 'warning' : 'default'}>
                      {action.type.replace('_', ' ')}
                    </Badge>
                    
                    <div className="flex items-center gap-6">
                      {action.confidence_score >= 0.85 ? (
                        <div className="flex items-center gap-2 text-emerald-700 font-bold text-[9px] uppercase tracking-widest">
                          <div className="w-1 h-1 bg-emerald-500"></div>
                          VERIFIED_INTEL
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-700 font-bold text-[9px] uppercase tracking-widest">
                          <div className="w-1 h-1 bg-amber-500 animate-pulse"></div>
                          MANUAL_REVIEW
                        </div>
                      )}

                      {action.source_link !== "#" && (
                        <a 
                          href={action.source_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[9px] font-bold text-muted-foreground hover:text-foreground transition-all uppercase tracking-widest border-b border-border hover:border-foreground pb-0.5"
                        >
                          SOURCE_LINK
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {action.type === 'create_profile' && (
                      <div className="space-y-6">
                        <h3 className="text-3xl font-bold text-foreground tracking-tighter">New Entity: {action.data.name}</h3>
                        <div className="flex flex-wrap gap-2">
                          <div className="px-3 py-1 bg-muted border border-border text-[10px] font-mono font-medium text-muted-foreground uppercase">
                            {action.data.email}
                          </div>
                        </div>
                      </div>
                    )}

                    {action.type === 'calendar_invite' && (
                      <div className="space-y-3">
                        <h3 className="text-3xl font-bold text-foreground tracking-tighter">{action.data.title}</h3>
                        <p className="text-lg text-muted-foreground font-medium">
                          Scheduled: {new Date(action.data.deadline).toLocaleDateString(undefined, { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    )}

                    {action.type === 'merge_profiles' && (
                      <div className="space-y-6">
                        <h3 className="text-3xl font-bold text-foreground tracking-tighter">Identity Match: {action.data.name}</h3>
                        <div className="flex flex-wrap gap-2">
                          {action.data.platforms.map((p: string, i: number) => (
                            <div key={i} className="px-3 py-1 bg-muted border border-border text-[10px] font-mono font-medium text-muted-foreground uppercase">
                              {p}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {action.type === 'email_draft' && (
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <h3 className="text-3xl font-bold text-foreground tracking-tighter">{action.data.subject}</h3>
                          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">To: {action.data.to}</p>
                        </div>
                        <div className="p-8 bg-muted border border-border text-base leading-relaxed text-foreground/80 font-sans">
                          "{action.data.body}"
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6 bg-muted/50 border border-border space-y-3">
                    <span className="font-mono text-[9px] font-medium text-muted-foreground uppercase tracking-[0.2em]">STRATEGIC_LOGIC</span>
                    <p className="text-sm font-medium text-foreground/70 leading-relaxed">
                      {action.data.reasoning || "Analyzing communication vectors for strategic dominance..."}
                    </p>
                  </div>
                </div>

                {/* Platform Action Bar */}
                <div className="flex border-t border-border">
                  <button 
                    onClick={() => handleAction(action.id, 'approved')}
                    className="flex-1 py-4 text-[11px] font-bold uppercase tracking-[0.2em] bg-black text-white hover:bg-black/90 transition-all border-r border-border"
                  >
                    EXECUTE_ACTION
                  </button>
                  <button 
                    onClick={() => {}}
                    className="flex-1 py-4 text-[11px] font-bold uppercase tracking-[0.2em] bg-white text-foreground hover:bg-muted transition-all border-r border-border"
                  >
                    ADJUST
                  </button>
                  <button 
                    onClick={() => handleAction(action.id, 'rejected')}
                    className="flex-1 py-4 text-[11px] font-bold uppercase tracking-[0.2em] bg-white text-red-600 hover:bg-red-50 transition-all"
                  >
                    SCRAP
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}



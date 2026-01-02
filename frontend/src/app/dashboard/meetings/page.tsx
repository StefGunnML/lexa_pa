"use client";

import React, { useState, useEffect } from 'react';
import { Card, Badge } from '@/components/ui/core';

interface Meeting {
  id: string;
  title: string;
  start_time: string;
  action_items: string[];
  positioning_notes: string;
}

export default function MeetingsSession() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch from FastAPI
    const mockMeetings: Meeting[] = [
      {
        id: "M1",
        title: "Series A Strategy Prep",
        start_time: new Date(Date.now() - 86400000).toISOString(),
        action_items: ["Update valuation model", "Finalize slide 14"],
        positioning_notes: "Focus on MRR growth trajectory. Reframe technical debt as 'Scaling Foundation'."
      },
      {
        id: "M2",
        title: "Product Roadmap Q1",
        start_time: new Date(Date.now() - 172800000).toISOString(),
        action_items: ["Scope out RAG integration", "Hire frontend lead"],
        positioning_notes: "Emphasize speed to market. Pivot from 'features' to 'outcomes'."
      }
    ];
    setMeetings(mockMeetings);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-16 pb-20 font-sans">
      <header className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="system-label">LOG: ARCHIVED</span>
          <span className="system-label">TRANSCRIPTION: WHISPER-V3</span>
        </div>
        <h2 className="text-5xl font-bold tracking-tighter text-foreground">Session</h2>
        <p className="text-muted-foreground text-xl max-w-2xl font-medium leading-relaxed">
          Historical positioning intelligence and <span className="text-foreground font-bold underline decoration-border decoration-2 underline-offset-4">strategic pivots</span> extracted for executive review.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-32 gap-6">
          <div className="w-8 h-8 border border-border border-t-foreground animate-spin"></div>
          <p className="font-mono text-[9px] font-medium text-muted-foreground uppercase tracking-[0.2em]">DECODING_SESSION_LOGS</p>
        </div>
      ) : (
        <div className="space-y-6">
          {meetings.map(meeting => (
            <Card key={meeting.id} className="p-8">
              <div className="flex flex-col md:flex-row justify-between gap-12">
                <div className="flex-1 space-y-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <Badge variant="success">LOGGED</Badge>
                      <span className="font-mono text-[9px] font-medium text-muted-foreground uppercase tracking-widest">
                        {new Date(meeting.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold text-foreground tracking-tighter">{meeting.title}</h3>
                  </div>

                  <div className="space-y-2">
                    <div className="font-mono text-[9px] font-medium text-muted-foreground uppercase tracking-widest">
                      STRATEGIC_POSITIONING
                    </div>
                    <div className="p-6 bg-muted border border-border">
                      <p className="text-sm text-foreground/70 leading-relaxed font-sans italic">
                        "{meeting.positioning_notes}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-72 space-y-4">
                  <div className="font-mono text-[9px] font-medium text-muted-foreground uppercase tracking-widest">
                    COMMITMENTS
                  </div>
                  <ul className="space-y-2">
                    {meeting.action_items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-1.5 w-1 h-1 bg-border shrink-0"></div>
                        <span className="text-[11px] font-medium text-foreground/60 leading-snug uppercase tracking-wider">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

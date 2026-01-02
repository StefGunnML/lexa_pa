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
    <div className="space-y-16 font-mono">
      <header className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#FFB000]/40 uppercase tracking-[0.4em]">POST_SESSION_ANALYSIS_BUFFER</span>
        </div>
        <h2 className="text-6xl font-bold tracking-tighter text-[#FFB000] uppercase animate-flicker">Session</h2>
        <p className="text-[#FFB000]/60 text-xl max-w-2xl font-medium leading-relaxed uppercase">
          De-serializing meeting intelligence... <span className="text-[#FFB000] underline underline-offset-8">strategic_pivots</span> extracted and indexed.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-32 gap-6">
          <div className="w-10 h-10 border-t-2 border-[#FFB000] animate-spin"></div>
          <p className="text-[11px] font-bold text-[#FFB000] uppercase tracking-[0.2em]">DECODING_SESSION_LOGS</p>
        </div>
      ) : (
        <div className="space-y-8">
          {meetings.map(meeting => (
            <Card key={meeting.id} className="border-[#FFB000]/20 hover:border-[#FFB000]/50 transition-all duration-300 p-10">
              <div className="flex flex-col md:flex-row justify-between gap-16">
                <div className="flex-1 space-y-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <Badge variant="success" className="font-bold border-emerald-500/40">SESSION_LOG_READY</Badge>
                      <span className="text-[11px] font-bold text-[#FFB000]/40 uppercase tracking-widest">
                        {new Date(meeting.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold text-[#FFB000] tracking-tighter uppercase">{meeting.title}</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[10px] font-bold text-[#FFB000]/40 uppercase tracking-widest">
                      [STRATEGIC_POSITIONING]
                    </div>
                    <div className="p-8 bg-black border border-[#FFB000]/10 italic">
                      <p className="text-base text-[#FFB000]/80 leading-relaxed uppercase tracking-tight">
                        "{meeting.positioning_notes}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-72 space-y-6">
                  <div className="flex items-center gap-3 text-[10px] font-bold text-[#FFB000]/40 uppercase tracking-widest">
                    [COMMITMENTS_LOG]
                  </div>
                  <ul className="space-y-4">
                    {meeting.action_items.map((item, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="mt-1.5 w-1.5 h-1.5 bg-[#FFB000]/40 shrink-0"></div>
                        <span className="text-sm font-medium text-[#FFB000]/60 leading-snug uppercase tracking-tighter">{item}</span>
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

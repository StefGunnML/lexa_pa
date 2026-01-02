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
    <div className="space-y-16 font-sans">
      <header className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="system-label">SESSION_LOG_BROWSER</span>
          <span className="system-label">TRANSCRIPTION: WHISPER-V3</span>
        </div>
        <h2 className="text-6xl font-extrabold tracking-tight text-slate-900">Session</h2>
        <p className="text-slate-500 text-xl max-w-2xl font-medium leading-relaxed">
          Historical positioning intelligence... <span className="text-blue-600 font-bold">strategic_pivots</span> extracted and indexed for executive review.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-32 gap-6">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-mono text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Decoding_Session_Logs</p>
        </div>
      ) : (
        <div className="space-y-8">
          {meetings.map(meeting => (
            <Card key={meeting.id} className="p-10">
              <div className="flex flex-col md:flex-row justify-between gap-16">
                <div className="flex-1 space-y-10">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <Badge variant="success" className="font-bold">SESSION_READY</Badge>
                      <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(meeting.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{meeting.title}</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="font-mono text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      [STRATEGIC_POSITIONING]
                    </div>
                    <div className="p-8 bg-slate-50 border border-slate-100 rounded-xl">
                      <p className="text-base text-slate-700 leading-relaxed font-medium italic">
                        "{meeting.positioning_notes}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-72 space-y-6">
                  <div className="font-mono text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    [COMMITMENTS_LOG]
                  </div>
                  <ul className="space-y-4">
                    {meeting.action_items.map((item, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="mt-1.5 w-1.5 h-1.5 bg-blue-500/20 shrink-0 rounded-full"></div>
                        <span className="text-sm font-bold text-slate-500 leading-snug uppercase tracking-tight">{item}</span>
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

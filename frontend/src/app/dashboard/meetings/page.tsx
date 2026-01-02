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
    <div className="space-y-16">
      <header className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Post-Session Intel</span>
        </div>
        <h2 className="text-6xl font-bold tracking-tight text-slate-900">Session</h2>
        <p className="text-slate-500 text-xl max-w-2xl font-normal leading-relaxed">
          Historical positioning intelligence and extracted commitments. Review the <span className="text-slate-900 font-semibold">strategic shifts</span> from your past meetings.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-32 gap-6">
          <div className="w-10 h-10 border-t-2 border-slate-900 rounded-full animate-spin"></div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Analyzing Sessions</p>
        </div>
      ) : (
        <div className="space-y-8">
          {meetings.map(meeting => (
            <Card key={meeting.id} className="hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] border-slate-200/60 transition-all duration-500 p-10">
              <div className="flex flex-col md:flex-row justify-between gap-16">
                <div className="flex-1 space-y-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <Badge variant="success" className="font-bold">Session Log</Badge>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(meeting.start_time).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{meeting.title}</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Strategic Positioning
                    </div>
                    <div className="p-8 bg-slate-50 border border-slate-100 rounded-2xl">
                      <p className="text-base text-slate-600 leading-relaxed italic-mercury">
                        "{meeting.positioning_notes}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-72 space-y-6">
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Commitments
                  </div>
                  <ul className="space-y-4">
                    {meeting.action_items.map((item, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-200 shrink-0"></div>
                        <span className="text-sm font-medium text-slate-500 leading-snug">{item}</span>
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
  );
}


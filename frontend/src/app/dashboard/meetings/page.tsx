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
    <div className="space-y-12">
      <header className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Live Intelligence</span>
        </div>
        <h2 className="text-4xl font-light tracking-tight text-slate-100">Session</h2>
        <p className="text-slate-400 text-base max-w-2xl font-light leading-relaxed">
          Post-session intelligence and real-time positioning history. Review <span className="text-slate-200">action items</span> and strategic nudges from your meetings.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 gap-4">
          <div className="w-6 h-6 border-t-2 border-slate-400 rounded-full animate-spin"></div>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest italic">Analyzing Sessions</p>
        </div>
      ) : (
        <div className="space-y-8">
          {meetings.map(meeting => (
            <Card key={meeting.id} className="border-slate-800/40">
              <div className="flex flex-col md:flex-row justify-between gap-10">
                <div className="flex-1 space-y-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <Badge variant="success">Session Log</Badge>
                      <span className="text-[9px] font-medium text-slate-600 uppercase tracking-[0.15em]">
                        {new Date(meeting.start_time).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-2xl font-medium text-slate-200 tracking-tight">{meeting.title}</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 opacity-60">
                      <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Strategic Positioning</span>
                    </div>
                    <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800/30">
                      <p className="text-sm font-light text-slate-300 leading-relaxed italic-mercury">
                        "{meeting.positioning_notes}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-64 space-y-6">
                  <div className="flex items-center gap-3 opacity-60">
                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Commitments</span>
                  </div>
                  <ul className="space-y-3">
                    {meeting.action_items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full border border-slate-600 flex-shrink-0"></div>
                        <span className="text-xs font-light text-slate-400 leading-tight tracking-wide">{item}</span>
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


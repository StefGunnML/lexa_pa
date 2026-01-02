"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function Sidebar() {
  const pathname = usePathname();

  console.log('SIDEBAR_RENDER', { pathname, navItemsCount: 4 });

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7243/ingest/b4de5701-9876-47ce-aad5-7d358d247a66', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'Sidebar.tsx:useEffect',
        message: 'Sidebar mounted',
        data: { pathname, navItems: [
          { name: 'Staging', href: '/dashboard/staging' },
          { name: 'Inbox', href: '/dashboard/threads' },
          { name: 'Session', href: '/dashboard/meetings' },
          { name: 'Setup', href: '/dashboard/settings' },
        ]},
        timestamp: Date.now(),
        sessionId: 'debug-session',
        hypothesisId: '1'
      })
    }).catch(() => {});
  }, [pathname]);
  // #endregion

  const navItems = [
    { name: 'Staging', href: '/dashboard/staging' },
    { name: 'Inbox', href: '/dashboard/threads' },
    { name: 'Session', href: '/dashboard/meetings' },
    { name: 'Setup', href: '/dashboard/settings' },
  ];

  return (
    <aside className="w-72 border-r border-slate-200 bg-white p-10 flex flex-col font-sans">
      <div className="flex items-center gap-4 mb-20">
        <div className="w-10 h-10 border border-slate-200 flex items-center justify-center bg-slate-900 rounded-lg">
          <span className="text-white font-black text-lg tracking-tighter">C</span>
        </div>
        <h1 className="text-[10px] font-black tracking-[0.3em] text-slate-900 uppercase">
          Project Compass
        </h1>
      </div>
      
      <nav className="space-y-12 flex-1">
        <div className="space-y-4">
          <p className="text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase ml-1">Workspace</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard/staging' && pathname?.startsWith(item.href));
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center gap-4 py-2.5 px-3 text-[0.9rem] transition-all rounded-lg ${isActive ? 'bg-blue-50 text-[#1a73e8] font-bold' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-[#1a73e8]' : 'bg-slate-300'}`}></div>
                <span className="tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      
      <div className="pt-10 border-t border-slate-100">
        <div className="flex items-center gap-4 px-1 opacity-60 hover:opacity-100 transition-opacity">
          <div className="w-2 h-2 bg-[#1a73e8] animate-pulse rounded-full"></div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]">Intelligence Node Active</p>
          </div>
        </div>
      </div>
    </aside>
  );
}


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
    <aside className="w-72 border-r border-slate-200 bg-white p-10 flex flex-col">
      <div className="flex items-center gap-4 mb-20">
        <div className="w-10 h-10 rounded-lg bg-[#0f172a] flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-sm tracking-tighter italic">C</span>
        </div>
        <h1 className="text-sm font-bold tracking-[0.3em] text-[#0f172a] uppercase">
          COMPASS
        </h1>
      </div>
      
      <nav className="space-y-10 flex-1">
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase ml-1">Workspace</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard/staging' && pathname?.startsWith(item.href));
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center gap-4 py-3 px-1 text-[0.95rem] transition-all group ${isActive ? 'text-[#0f172a] font-bold' : 'text-slate-500 hover:text-[#0f172a]'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${isActive ? 'bg-[#0f172a] scale-125' : 'bg-transparent border border-slate-300 group-hover:border-slate-400'}`}></div>
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
      
      <div className="pt-10 border-t border-slate-100">
        <div className="flex items-center gap-4 px-1 opacity-60 hover:opacity-100 transition-opacity">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <div>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] italic">Active Node</p>
          </div>
        </div>
      </div>
    </aside>
  );
}


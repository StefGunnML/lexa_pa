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
    <aside className="w-64 border-r border-slate-800 bg-[#0f172a] p-8 flex flex-col">
      <div className="flex items-center gap-3 mb-16">
        <div className="w-8 h-8 rounded bg-white flex items-center justify-center">
          <span className="text-black font-semibold text-xs tracking-tighter italic">C</span>
        </div>
        <h1 className="text-sm font-semibold tracking-[0.2em] text-white/90 uppercase">
          COMPASS
        </h1>
      </div>
      
      <nav className="space-y-8 flex-1">
        <div className="space-y-3">
          <p className="text-[10px] font-semibold text-slate-500 tracking-[0.15em] uppercase ml-1">Workspace</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard/staging' && pathname?.startsWith(item.href));
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center gap-3 py-2 px-1 text-sm transition-all group ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <div className={`w-1 h-1 rounded-full transition-all ${isActive ? 'bg-white' : 'bg-transparent border border-slate-700 group-hover:border-slate-400'}`}></div>
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
      
      <div className="pt-8 border-t border-slate-800/50">
        <div className="flex items-center gap-3 px-1">
          <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse"></div>
          <div>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest italic">Encrypted Node</p>
          </div>
        </div>
      </div>
    </aside>
  );
}


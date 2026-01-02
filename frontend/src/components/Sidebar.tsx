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
    <aside className="w-72 border-r border-[#FFB000]/20 bg-black p-10 flex flex-col font-mono">
      <div className="flex items-center gap-4 mb-20">
        <div className="w-10 h-10 border border-[#FFB000] flex items-center justify-center shadow-[0_0_10px_rgba(255,176,0,0.3)]">
          <span className="text-[#FFB000] font-bold text-sm tracking-tighter">C:</span>
        </div>
        <h1 className="text-sm font-bold tracking-[0.3em] text-[#FFB000] uppercase animate-pulse">
          COMPASS_OS
        </h1>
      </div>
      
      <nav className="space-y-10 flex-1">
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-[#FFB000]/30 tracking-[0.2em] uppercase ml-1"># DIRECTORY</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard/staging' && pathname?.startsWith(item.href));
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center gap-4 py-3 px-1 text-[0.85rem] transition-all group ${isActive ? 'text-[#FFB000] font-bold' : 'text-[#FFB000]/40 hover:text-[#FFB000]/80'}`}
              >
                <div className={`w-2 h-2 transition-all duration-500 ${isActive ? 'bg-[#FFB000] shadow-[0_0_8px_rgba(255,176,0,0.8)]' : 'bg-transparent border border-[#FFB000]/20 group-hover:border-[#FFB000]/40'}`}></div>
                {isActive ? `> ${item.name.toUpperCase()}` : item.name.toUpperCase()}
              </Link>
            );
          })}
        </div>
      </nav>
      
      <div className="pt-10 border-t border-[#FFB000]/10">
        <div className="flex items-center gap-4 px-1 opacity-60 hover:opacity-100 transition-opacity">
          <div className="w-2 h-2 bg-[#FFB000] animate-flicker"></div>
          <div>
            <p className="text-[10px] font-bold text-[#FFB000] uppercase tracking-[0.2em]">NODE_ONLINE</p>
          </div>
        </div>
      </div>
    </aside>
  );
}


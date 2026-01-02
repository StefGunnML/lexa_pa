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
    <aside className="w-72 border-r-2 border-black bg-white p-10 flex flex-col font-mono shadow-[4px_0px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-4 mb-20">
        <div className="w-10 h-10 border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-black">
          <span className="text-white font-black text-lg tracking-tighter">C:</span>
        </div>
        <h1 className="text-sm font-black tracking-[0.2em] text-black uppercase">
          COMPASS_OS
        </h1>
      </div>
      
      <nav className="space-y-12 flex-1">
        <div className="space-y-6">
          <p className="text-[10px] font-black text-black tracking-[0.3em] uppercase ml-1 underline underline-offset-4"># INDEX</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard/staging' && pathname?.startsWith(item.href));
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center gap-4 py-3 px-2 text-[0.85rem] transition-all group ${isActive ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]' : 'text-black hover:bg-black/5'}`}
              >
                <div className={`w-2 h-2 transition-all duration-300 ${isActive ? 'bg-white' : 'bg-black'}`}></div>
                <span className="font-black tracking-widest">{item.name.toUpperCase()}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      
      <div className="pt-10 border-t-2 border-black">
        <div className="flex items-center gap-4 px-1 group">
          <div className="w-3 h-3 border-2 border-black bg-black group-hover:bg-white transition-colors animate-cursor"></div>
          <div>
            <p className="text-[10px] font-black text-black uppercase tracking-[0.2em]">NODE_ACTIVE</p>
          </div>
        </div>
      </div>
    </aside>
  );
}


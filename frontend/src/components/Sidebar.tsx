"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Staging', href: '/dashboard/staging' },
    { name: 'Inbox', href: '/dashboard/threads' },
    { name: 'Session', href: '/dashboard/meetings' },
    { name: 'Setup', href: '/dashboard/settings' },
  ];

  return (
    <aside className="w-72 border-r border-border bg-white p-12 flex flex-col font-sans">
      <div className="flex items-center gap-4 mb-20">
        <div className="w-8 h-8 bg-black flex items-center justify-center">
          <span className="text-white font-bold text-base tracking-tighter">C</span>
        </div>
        <h1 className="text-[10px] font-bold tracking-[0.3em] text-foreground uppercase">
          PROJECT COMPASS
        </h1>
      </div>
      
      <nav className="space-y-12 flex-1">
        <div className="space-y-2">
          <p className="text-[9px] font-medium text-muted-foreground tracking-[0.2em] uppercase mb-4 ml-1">WORKSPACE</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard/staging' && pathname?.startsWith(item.href));
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`flex items-center gap-3 py-2 px-1 text-[13px] transition-all ${isActive ? 'text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <div className={`w-1 h-1 transition-all duration-300 ${isActive ? 'bg-black' : 'bg-transparent'}`}></div>
                <span className="tracking-tight uppercase tracking-widest">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      
      <div className="pt-10 border-t border-border">
        <div className="flex items-center gap-3 px-1 opacity-70">
          <div className="w-1.5 h-1.5 bg-foreground"></div>
          <div>
            <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-[0.1em]">NODE_STATUS: ONLINE</p>
          </div>
        </div>
      </div>
    </aside>
  );
}


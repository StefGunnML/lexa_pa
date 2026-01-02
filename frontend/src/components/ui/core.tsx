import React from 'react';

export function Card({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`luxury-card rounded-xl p-8 transition-all hover:bg-[#1e293b]/60 ${className}`}>
      {children}
    </div>
  );
}

export function Button({ 
  children, 
  variant = "primary", 
  size = "default",
  onClick,
  disabled = false,
  className = ""
}: { 
  children: React.ReactNode, 
  variant?: "primary" | "secondary" | "destructive" | "outline",
  size?: "default" | "sm" | "lg",
  onClick?: () => void,
  disabled?: boolean,
  className?: string
}) {
  const styles = {
    primary: "bg-white text-black hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.15)] border-t border-white/20",
    secondary: "bg-white/5 text-white hover:bg-white/10 border border-white/10 shadow-inner",
    destructive: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]",
    outline: "border border-white/10 text-white/60 hover:border-white/40 hover:text-white bg-transparent"
  };

  const sizes = {
    default: "px-6 py-3 text-xs",
    sm: "px-4 py-1.5 text-[10px]",
    lg: "px-10 py-4 text-sm uppercase tracking-[0.2em]"
  };
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl font-black tracking-widest transition-all duration-300 active:scale-[0.97] hover:translate-y-[-1px] disabled:opacity-30 disabled:cursor-not-allowed ${styles[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Badge({ children, variant = "default", className = "" }: { children: React.ReactNode, variant?: "default" | "warning" | "success", className?: string }) {
  const styles = {
    default: "bg-slate-800 text-slate-400 border border-slate-700",
    warning: "bg-amber-900/20 text-amber-400 border border-amber-900/30",
    success: "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30"
  };
  
  return (
    <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-[0.1em] uppercase ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}



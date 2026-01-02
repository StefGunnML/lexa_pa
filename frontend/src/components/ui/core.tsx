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
    primary: "bg-slate-100 text-slate-900 hover:bg-white shadow-lg",
    secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700",
    destructive: "bg-red-950/20 text-red-400 hover:bg-red-900/30 border border-red-900/30",
    outline: "border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white"
  };

  const sizes = {
    default: "px-5 py-2 text-xs",
    sm: "px-3 py-1 text-[10px]",
    lg: "px-8 py-3 text-sm"
  };
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl font-bold tracking-wide transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${sizes[size]} ${className}`}
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



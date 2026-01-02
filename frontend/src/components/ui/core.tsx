import React from 'react';

export function Card({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`luxury-card p-10 font-mono ${className}`}>
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
    primary: "bg-[#FFB000] text-black hover:bg-[#FFB000]/90 shadow-[0_0_15px_rgba(255,176,0,0.4)]",
    secondary: "bg-black text-[#FFB000] border border-[#FFB000]/40 hover:bg-[#FFB000]/10",
    destructive: "bg-black text-red-500 border border-red-500/40 hover:bg-red-500/10",
    outline: "border border-[#FFB000]/20 text-[#FFB000]/60 hover:border-[#FFB000]/60 hover:text-[#FFB000] bg-transparent"
  };

  const sizes = {
    default: "px-6 py-3 text-xs uppercase tracking-widest",
    sm: "px-4 py-1.5 text-[10px] uppercase tracking-widest",
    lg: "px-10 py-4 text-sm uppercase tracking-[0.2em]"
  };
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`font-mono font-bold transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed ${styles[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Badge({ children, variant = "default", className = "" }: { children: React.ReactNode, variant?: "default" | "warning" | "success", className?: string }) {
  const styles = {
    default: "border border-[#FFB000]/30 text-[#FFB000]/60",
    warning: "border border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
    success: "border border-emerald-500 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
  };
  
  return (
    <span className={`px-3 py-1 font-mono text-[10px] font-bold tracking-widest uppercase ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}



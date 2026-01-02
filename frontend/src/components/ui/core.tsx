import React from 'react';

export function Card({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`luxury-card p-10 hover:border-black/20 ${className}`}>
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
    primary: "bg-black text-white hover:bg-black/90",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    destructive: "bg-white text-red-600 border border-red-200 hover:bg-red-50",
    outline: "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
  };

  const sizes = {
    default: "px-5 py-2.5 text-[11px] uppercase tracking-[0.15em] font-semibold",
    sm: "px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] font-semibold",
    lg: "px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-bold"
  };
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`font-sans transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed ${styles[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Badge({ children, variant = "default", className = "" }: { children: React.ReactNode, variant?: "default" | "warning" | "success", className?: string }) {
  const styles = {
    default: "bg-muted text-muted-foreground border border-border",
    warning: "bg-amber-50 text-amber-700 border border-amber-100",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-100"
  };
  
  return (
    <span className={`px-2 py-0.5 font-mono text-[9px] font-medium tracking-[0.1em] uppercase ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}



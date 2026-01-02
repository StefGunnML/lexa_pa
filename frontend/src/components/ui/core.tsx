import React from 'react';

export function Card({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`luxury-card rounded-2xl p-10 ${className}`}>
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
    primary: "bg-[#0f172a] text-white hover:bg-black shadow-[0_4px_14px_rgba(0,0,0,0.1)]",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200",
    destructive: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
    outline: "border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 bg-white"
  };

  const sizes = {
    default: "px-6 py-3 text-xs",
    sm: "px-4 py-1.5 text-[10px]",
    lg: "px-10 py-4 text-sm uppercase tracking-widest"
  };
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Badge({ children, variant = "default", className = "" }: { children: React.ReactNode, variant?: "default" | "warning" | "success", className?: string }) {
  const styles = {
    default: "bg-slate-100 text-slate-600 border border-slate-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200"
  };
  
  return (
    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}



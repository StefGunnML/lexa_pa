import React from 'react';

export function Card({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`luxury-card p-10 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] ${className}`}>
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
    primary: "bg-[#1a73e8] text-white hover:bg-[#1557b0] shadow-sm hover:shadow-md",
    secondary: "bg-slate-900 text-white hover:bg-black",
    destructive: "bg-white text-red-600 border border-red-200 hover:bg-red-50",
    outline: "border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
  };

  const sizes = {
    default: "px-6 py-3 text-xs uppercase tracking-widest font-bold rounded-lg",
    sm: "px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-md",
    lg: "px-10 py-4 text-sm uppercase tracking-widest font-black rounded-xl"
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
    default: "bg-slate-100 text-slate-500",
    warning: "bg-amber-100 text-amber-700",
    success: "bg-emerald-100 text-emerald-700"
  };
  
  return (
    <span className={`px-2.5 py-1 font-mono text-[9px] font-black tracking-[0.15em] uppercase rounded ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}



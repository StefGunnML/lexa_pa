import React from 'react';

export function Card({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`luxury-card p-10 font-mono transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${className}`}>
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
    primary: "bg-black text-white hover:bg-black/90 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] border-2 border-black",
    secondary: "bg-white text-black border-2 border-black hover:bg-black hover:text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
    destructive: "bg-white text-red-600 border-2 border-red-600 hover:bg-red-600 hover:text-white shadow-[3px_3px_0px_0px_rgba(220,38,38,1)]",
    outline: "border-2 border-black text-black hover:bg-black hover:text-white bg-transparent"
  };

  const sizes = {
    default: "px-6 py-3 text-xs uppercase tracking-widest font-black",
    sm: "px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold",
    lg: "px-10 py-5 text-sm uppercase tracking-[0.3em] font-black"
  };
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`font-mono transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-30 disabled:cursor-not-allowed ${styles[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Badge({ children, variant = "default", className = "" }: { children: React.ReactNode, variant?: "default" | "warning" | "success", className?: string }) {
  const styles = {
    default: "border-2 border-black text-black bg-white",
    warning: "border-2 border-black bg-black text-white",
    success: "border-2 border-black bg-white text-black underline underline-offset-4"
  };
  
  return (
    <span className={`px-4 py-1 font-mono text-[10px] font-black tracking-widest uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}



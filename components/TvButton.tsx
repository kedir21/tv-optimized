import React from 'react';

interface TvButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass';
  icon?: React.ReactNode;
  children: React.ReactNode;
  autoFocus?: boolean;
}

const TvButton: React.FC<TvButtonProps> = ({ 
  variant = 'primary', 
  icon, 
  children, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "focusable tv-focus flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 active:scale-95";
  
  const variants = {
    primary: "bg-white text-[var(--bg-primary)] hover:bg-white/90",
    secondary: "bg-white/8 text-white hover:bg-white/12 border border-white/[0.06]",
    glass: "glass text-white hover:bg-white/10"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {children}
    </button>
  );
};

export default TvButton;

import React from 'react';

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary',
    secondary: 'bg-white border border-brand-border text-brand-text hover:bg-slate-50 focus:ring-primary',
    accent: 'bg-accent text-white hover:bg-accent-hover focus:ring-accent',
    danger: 'bg-status-error text-white hover:bg-red-700 focus:ring-status-error',
    outline: 'border border-brand-border text-brand-muted hover:text-brand-text hover:bg-slate-50 focus:ring-primary',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-sm',
    md: 'px-4 py-2 text-sm rounded',
    lg: 'px-5 py-2.5 text-base rounded-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={`mr-2 h-4 w-4 ${size === 'sm' ? 'h-3.5 w-3.5' : ''}`} />}
      {children}
    </button>
  );
};

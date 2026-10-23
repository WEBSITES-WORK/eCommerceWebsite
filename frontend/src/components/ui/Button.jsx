import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99] tracking-tight';

  const variants = {
    // Primary High-End Accent
    primary:
      'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-600 shadow-sm hover:shadow-md',
    accent:
      'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-600 shadow-sm hover:shadow-md',
    // Luxury Near-Black
    dark:
      'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900 shadow-sm hover:shadow-md',
    // Neutral/Outlined
    secondary:
      'bg-stone-100 text-stone-900 hover:bg-stone-200 focus:ring-stone-300 border border-stone-200',
    outline:
      'border border-stone-200 bg-white text-stone-900 hover:bg-stone-50 hover:border-stone-300 focus:ring-emerald-500 shadow-xs',
    // Ghost Minimal
    ghost:
      'text-stone-600 hover:text-stone-900 hover:bg-stone-100 focus:ring-stone-300',
    // Reserved Destructive
    danger:
      'bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 focus:ring-rose-500 border border-rose-200',
    // Admin Dark Card Button
    adminDark:
      'bg-admin-card text-admin-text hover:bg-admin-elevated border border-admin-border focus:ring-emerald-500',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8 font-medium',
    md: 'text-sm px-4 py-2.5 gap-2 h-10 font-medium',
    lg: 'text-sm px-6 py-3.5 gap-2.5 h-12 font-semibold',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${widthStyle} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 flex-shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;

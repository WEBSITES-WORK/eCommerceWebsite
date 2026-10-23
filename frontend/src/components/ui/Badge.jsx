import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const base =
    'inline-flex items-center font-medium tracking-wide rounded-md select-none';

  const variants = {
    // Storefront Light Variants
    default: 'bg-stone-100 text-stone-700 border border-stone-200',
    sale: 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold',
    new: 'bg-stone-900 text-white font-semibold',
    bestseller: 'bg-stone-100 text-stone-900 border border-stone-300 font-semibold',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-sky-50 text-sky-700 border border-sky-200',
    outline: 'bg-transparent text-stone-600 border border-stone-300',

    // Admin Dark Dashboard Semantic Badges
    adminPending: 'bg-amber-950/40 text-amber-300 border border-amber-800/50',
    adminProcessing: 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50',
    adminShipped: 'bg-sky-950/40 text-sky-300 border border-sky-800/50',
    adminDelivered: 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50',
    adminCancelled: 'bg-rose-950/40 text-rose-300 border border-rose-800/50',
    adminDark: 'bg-[#1B2029] text-[#A5ACB8] border border-[#252B35]',
  };

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-xs px-3 py-1 font-semibold',
  };

  return (
    <span className={`${base} ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;

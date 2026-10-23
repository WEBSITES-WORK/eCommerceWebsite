import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionText,
  actionLink,
  actionHref,
  onAction,
  className = '',
}) => {
  const label = actionLabel || actionText;
  const link = actionLink || actionHref;

  return (
    <div
      className={`p-8 sm:p-14 text-center bg-white rounded-3xl border border-slate-100 shadow-2xs max-w-md mx-auto my-8 ${className}`}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed max-w-xs mx-auto">
          {description}
        </p>
      )}

      {(label && (link || onAction)) && (
        <div className="mt-6">
          {link ? (
            <Link to={link}>
              <Button variant="accent" size="md">
                {label}
              </Button>
            </Link>
          ) : (
            <Button variant="accent" size="md" onClick={onAction}>
              {label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;

import React from 'react';

interface StatusBadgeProps {
  status: 'PENDING' | 'SUBMITTED' | 'VALIDATED' | 'REJECTED' | 'LOCKED';
  size?: 'sm' | 'md';
}

const statusConfig = {
  PENDING: {
    label: 'En attente',
    className: 'bg-yellow-100 text-yellow-800',
  },
  SUBMITTED: {
    label: 'Soumis',
    className: 'bg-blue-100 text-blue-800',
  },
  VALIDATED: {
    label: 'Validé',
    className: 'bg-green-100 text-green-800',
  },
  REJECTED: {
    label: 'Rejeté',
    className: 'bg-red-100 text-red-800',
  },
  LOCKED: {
    label: 'Verrouillé',
    className: 'bg-gray-100 text-gray-800',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = statusConfig[status];
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.className} ${sizeClass}`}
    >
      {config.label}
    </span>
  );
};
import React from 'react';

interface ProficiencyBadgeProps {
  level: number;
  className?: string;
}

export const ProficiencyBadge: React.FC<ProficiencyBadgeProps> = ({ level, className = '' }) => {
  const configs = [
    { label: 'Beginner', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Intermediate', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Advanced', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { label: 'Expert', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  ];

  const config = configs[Math.min(Math.max(level - 1, 0), 3)];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${className}`}>
      Level {level}: {config.label}
    </span>
  );
};

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className = '' }) => {
  const categoryColors: Record<string, string> = {
    'Languages': 'bg-amber-50 text-amber-700 border-amber-200',
    'Frameworks': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'Databases': 'bg-teal-50 text-teal-700 border-teal-200',
    'Data & AI': 'bg-violet-50 text-violet-700 border-violet-200',
    'Testing': 'bg-rose-50 text-rose-700 border-rose-200',
    'DevOps & Tools': 'bg-sky-50 text-sky-700 border-sky-200',
    'Core CS': 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const colorClass = categoryColors[category] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorClass} ${className}`}>
      {category}
    </span>
  );
};


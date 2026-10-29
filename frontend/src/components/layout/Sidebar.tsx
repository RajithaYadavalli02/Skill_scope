import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  Briefcase,
  Sparkles,
  Map,
  BookOpen,
  TrendingUp,
  Info,
  Layers,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/profile', label: 'Skill Profile', icon: UserCheck },
    { to: '/roles', label: 'Job Catalogue (9)', icon: Briefcase },
    { to: '/analysis', label: 'Skill-Gap Analyzer', icon: Sparkles },
    { to: '/roadmap', label: 'Personalized Roadmap', icon: Map },
    { to: '/resources', label: 'Resource Library', icon: BookOpen },
    { to: '/tracker', label: 'Progress Tracker', icon: TrendingUp },
    { to: '/about', label: 'Viva & Methodology', icon: Info },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-slate-900 text-slate-300 flex flex-col justify-between">
      <div>
        <div className="flex h-16 items-center px-6 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Layers className="h-6 w-6 text-indigo-400" />
            <span className="text-base font-bold text-white tracking-wide">SkillScope</span>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-lg px-3 py-2.5 text-xs font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="rounded-xl bg-slate-800/80 p-3 border border-slate-700/60 text-xs">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold mb-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Dual-Engine Online</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Rule-Based Deterministic Engine & NLP TF-IDF Cosine Similarity.
          </p>
        </div>
      </div>
    </aside>
  );
};


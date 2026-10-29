import React, { useState, useEffect } from 'react';
import { Target, Users, BookOpen, ChevronDown } from 'lucide-react';
import { api } from '../../services/api';
import { UserProfile, PersonaPreset } from '../../types';

interface NavbarProps {
  user: UserProfile | null;
  onUserUpdate: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onUserUpdate }) => {
  const [presets, setPresets] = useState<PersonaPreset[]>([]);
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  const [loadingPreset, setLoadingPreset] = useState(false);

  useEffect(() => {
    api.getPresets().then(setPresets).catch(console.error);
  }, []);

  const handleApplyPreset = async (presetId: string) => {
    try {
      setLoadingPreset(true);
      await api.applyPreset(presetId);
      setShowPresetDropdown(false);
      onUserUpdate();
    } catch (err) {
      console.error('Failed to apply preset', err);
    } finally {
      setLoadingPreset(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur">
      <div className="flex items-center space-x-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-md shadow-indigo-200">
          SS
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold tracking-tight text-slate-900">SkillScope</span>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-700">
              AI Capstone
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">
            Dual-Engine Job Skill Gap Analyzer & Personalized Roadmap System
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Active Target Role Badge */}
        {user?.target_role_title && (
          <div className="hidden md:flex items-center space-x-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-700 border border-slate-200">
            <Target className="h-3.5 w-3.5 text-indigo-600" />
            <span className="font-medium text-slate-500">Target Role:</span>
            <span className="font-semibold text-slate-800">{user.target_role_title}</span>
          </div>
        )}

        {/* 1-Click Viva Demo Presets Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPresetDropdown(!showPresetDropdown)}
            className="flex items-center space-x-2 rounded-lg border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition shadow-sm"
          >
            <Users className="h-3.5 w-3.5 text-indigo-600" />
            <span>{loadingPreset ? 'Loading...' : '1-Click Viva Presets'}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          {showPresetDropdown && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
              <div className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Select Demonstration Persona
              </div>
              <div className="mt-1 space-y-1">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset.id)}
                    className="w-full text-left rounded-lg p-2 hover:bg-indigo-50/80 transition"
                  >
                    <div className="text-xs font-semibold text-slate-800">{preset.name}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{preset.tagline}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User initials pill */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'SE'}
          </div>
          <div className="hidden lg:block text-left text-xs">
            <div className="font-semibold text-slate-800">{user?.name || 'Student Engineer'}</div>
            <div className="text-[11px] text-slate-500">{user?.education_level || 'B.Tech CS'}</div>
          </div>
        </div>
      </div>
    </header>
  );
};


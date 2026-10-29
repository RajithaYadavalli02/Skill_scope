import React, { useState, useEffect } from 'react';
import {
  User,
  Plus,
  Trash2,
  Users,
  Search,
  Award,
  Sparkles,
  ChevronUp,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import { api } from '../services/api';
import { UserProfile, SkillMaster, PersonaPreset, JobRoleSummary, UserSkill } from '../types';
import { ProficiencyBadge, CategoryBadge } from '../components/common/Badge';

interface ProfilePageProps {
  user: UserProfile | null;
  onUserUpdate: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUserUpdate }) => {
  const [allSkills, setAllSkills] = useState<SkillMaster[]>([]);
  const [presets, setPresets] = useState<PersonaPreset[]>([]);
  const [roles, setRoles] = useState<JobRoleSummary[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Skill Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<number | ''>('');
  const [proficiency, setProficiency] = useState<number>(2);
  const [yearsExp, setYearsExp] = useState<number>(1.0);
  const [submitting, setSubmitting] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [degreeInput, setDegreeInput] = useState(user?.education_level || '');
  const [targetRoleId, setTargetRoleId] = useState<number | ''>(user?.target_role_id || '');

  useEffect(() => {
    if (user) {
      setNameInput(user.name);
      setDegreeInput(user.education_level);
      setTargetRoleId(user.target_role_id || '');
    }
  }, [user]);

  useEffect(() => {
    Promise.all([
      api.getAllSkills(),
      api.getPresets(),
      api.getRoles(),
    ]).then(([s, p, r]) => {
      setAllSkills(s);
      setPresets(p);
      setRoles(r);
    }).catch(console.error);
  }, []);

  const categories = ['All', 'Languages', 'Frameworks', 'Databases', 'Data & AI', 'Testing', 'DevOps & Tools', 'Core CS'];

  const userSkillsMap = new Set(user?.skills.map((s: UserSkill) => s.skill_id) || []);
  const availableSkillsToAdd = allSkills.filter((s: SkillMaster) => !userSkillsMap.has(s.id));

  const filteredUserSkills = (user?.skills || []).filter((s: UserSkill) => {
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch = s.skill_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillId) return;

    try {
      setSubmitting(true);
      await api.addUserSkill(Number(selectedSkillId), proficiency, yearsExp);
      setShowAddModal(false);
      setSelectedSkillId('');
      setProficiency(2);
      setYearsExp(1.0);
      onUserUpdate();
    } catch (err) {
      console.error('Error adding skill', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLevelChange = async (userSkillId: number, currentLevel: number, delta: number, currentExp: number) => {
    const newLevel = Math.min(Math.max(currentLevel + delta, 1), 4);
    if (newLevel === currentLevel) return;

    try {
      await api.updateUserSkill(userSkillId, newLevel, currentExp);
      onUserUpdate();
    } catch (err) {
      console.error('Error updating skill level', err);
    }
  };

  const handleDeleteSkill = async (userSkillId: number) => {
    try {
      await api.deleteUserSkill(userSkillId);
      onUserUpdate();
    } catch (err) {
      console.error('Error deleting skill', err);
    }
  };

  const handleApplyPreset = async (presetId: string) => {
    try {
      await api.applyPreset(presetId);
      onUserUpdate();
    } catch (err) {
      console.error('Error applying preset', err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateProfile({
        name: nameInput,
        education_level: degreeInput,
        target_role_id: targetRoleId ? Number(targetRoleId) : undefined,
      });
      setIsEditingProfile(false);
      onUserUpdate();
    } catch (err) {
      console.error('Error saving profile', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1-Click Viva Demonstration Presets Card */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 via-slate-50 to-indigo-50/90 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-bold text-slate-900">
              One-Click Viva Demonstration Presets
            </span>
          </div>
          <span className="text-xs text-indigo-700 font-medium bg-indigo-100/60 px-2.5 py-1 rounded-full border border-indigo-200">
            For Examiners & Project Review
          </span>
        </div>
        <p className="text-xs text-slate-600 mb-4">
          Click any persona below to instantly load a pre-configured profile. Notice how the gap analysis, readiness gauge, and roadmap dynamically re-calculate in real time!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => handleApplyPreset(p.id)}
              className="flex flex-col items-start p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 shadow-xs transition text-left"
            >
              <div className="text-xs font-bold text-slate-900">{p.name}</div>
              <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{p.tagline}</div>
              <div className="mt-2 text-[10px] font-semibold text-indigo-600 flex items-center space-x-1">
                <Sparkles className="h-3 w-3" />
                <span>Load Persona</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Student Profile Info Card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
              <p className="text-xs text-slate-500">{user?.education_level}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            {isEditingProfile ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Degree / College Year</label>
              <input
                type="text"
                value={degreeInput}
                onChange={(e) => setDegreeInput(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role Track</label>
              <select
                value={targetRoleId}
                onChange={(e) => setTargetRoleId(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Target Role Track:</span>
              <span className="text-slate-800 font-bold">{user?.target_role_title || 'Not Set'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Experience Level:</span>
              <span className="text-slate-800 font-bold">{user?.years_of_experience} Years</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Total Competencies:</span>
              <span className="text-slate-800 font-bold">{user?.skills.length || 0} Skills</span>
            </div>
          </div>
        )}
      </div>

      {/* Skills Management Section */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Your Acquired Skills Profile</h3>
            <p className="text-xs text-slate-500">
              Proficiency scale: 1 = Beginner, 2 = Intermediate, 3 = Advanced, 4 = Expert
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm transition self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Skill to Profile</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search your skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Skills Cards Grid */}
        {filteredUserSkills.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
            <Award className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <p className="text-xs font-medium text-slate-600">No skills matching this filter.</p>
            <p className="text-[11px] text-slate-400 mt-1">Click "Add Skill to Profile" or select a Viva Preset above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {filteredUserSkills.map((s: UserSkill) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">{s.skill_name}</span>
                    <CategoryBadge category={s.category} />
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                    <ProficiencyBadge level={s.proficiency_level} />
                    <span>• {s.years_experience} yr</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <div className="flex flex-col border border-slate-200 rounded-md bg-white">
                    <button
                      onClick={() => handleLevelChange(s.id, s.proficiency_level, 1, s.years_experience)}
                      disabled={s.proficiency_level >= 4}
                      title="Increase proficiency level"
                      className="px-1.5 py-0.5 text-slate-600 hover:text-indigo-600 disabled:opacity-30 text-[10px]"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleLevelChange(s.id, s.proficiency_level, -1, s.years_experience)}
                      disabled={s.proficiency_level <= 1}
                      title="Decrease proficiency level"
                      className="px-1.5 py-0.5 text-slate-600 hover:text-indigo-600 disabled:opacity-30 text-[10px] border-t border-slate-100"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteSkill(s.id)}
                    title="Remove skill"
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Add Skill to Profile</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Skill</label>
                <select
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value ? Number(e.target.value) : '')}
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">-- Choose from Catalog ({availableSkillsToAdd.length} available) --</option>
                  {availableSkillsToAdd.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Proficiency Level: {proficiency} / 4
                </label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {[
                    { lvl: 1, label: 'Beginner' },
                    { lvl: 2, label: 'Intermediate' },
                    { lvl: 3, label: 'Advanced' },
                    { lvl: 4, label: 'Expert' },
                  ].map((p) => (
                    <button
                      type="button"
                      key={p.lvl}
                      onClick={() => setProficiency(p.lvl)}
                      className={`p-2 rounded-lg border text-center transition ${
                        proficiency === p.lvl
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-[10px]">Lvl {p.lvl}</div>
                      <div className="text-[11px]">{p.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Years of Hands-on Experience: {yearsExp} yr
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={yearsExp}
                  onChange={(e) => setYearsExp(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedSkillId || submitting}
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

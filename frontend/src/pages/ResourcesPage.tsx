import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  ExternalLink,
  Search,
  Filter,
  CheckCircle,
  Video,
  FileText,
  Code,
  GraduationCap,
} from 'lucide-react';
import { api } from '../services/api';
import { LearningResource, SkillMaster, JobRoleSummary } from '../types';
import { CategoryBadge } from '../components/common/Badge';

export const ResourcesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [skills, setSkills] = useState<SkillMaster[]>([]);
  const [roles, setRoles] = useState<JobRoleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const initialSkillId = searchParams.get('skill_id');
  const [selectedSkillId, setSelectedSkillId] = useState<string>(initialSkillId || '');
  const [selectedRoleSlug, setSelectedRoleSlug] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    Promise.all([
      api.getAllSkills(),
      api.getRoles(),
    ]).then(([s, r]) => {
      setSkills(s);
      setRoles(r);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const data = await api.getResources({
          skill_id: selectedSkillId ? Number(selectedSkillId) : undefined,
          role_slug: selectedRoleSlug || undefined,
          resource_type: selectedType !== 'All' ? selectedType : undefined,
          search: searchQuery || undefined,
        });
        setResources(data);
      } catch (err) {
        console.error('Error fetching resources', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [selectedSkillId, selectedRoleSlug, selectedType, searchQuery]);

  const typeIcons: Record<string, any> = {
    Documentation: FileText,
    Course: GraduationCap,
    Video: Video,
    Project: Code,
    Book: BookOpen,
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-2">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Verified Learning Resource Library</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Curated Developer & Data Resources</h1>
            <p className="mt-1 text-xs text-slate-500">
              High-quality documentation, interactive tutorials, video playlists, and open-source projects mapped to specific skills.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span className="font-bold text-slate-800">{resources.length}</span> resources available
          </div>
        </div>

        {/* Filters Grid */}
        <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search resource or provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Filter by skill */}
          <select
            value={selectedSkillId}
            onChange={(e) => setSelectedSkillId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Skills ({skills.length})</option>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.category})
              </option>
            ))}
          </select>

          {/* Filter by target role */}
          <select
            value={selectedRoleSlug}
            onChange={(e) => setSelectedRoleSlug(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Job Roles</option>
            {roles.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.title}
              </option>
            ))}
          </select>

          {/* Filter by resource type */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
          >
            <option value="All">All Resource Formats</option>
            <option value="Documentation">Documentation</option>
            <option value="Course">Interactive Course</option>
            <option value="Video">Video Playlist</option>
            <option value="Project">Project Tutorial</option>
            <option value="Book">Open Textbook</option>
          </select>
        </div>
      </div>

      {/* Resources Cards Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
        </div>
      ) : resources.length === 0 ? (
        <div className="rounded-2xl bg-white border border-dashed border-slate-200 p-12 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-slate-400 mb-2" />
          <p className="text-xs font-semibold text-slate-700">No resources matched your criteria.</p>
          <p className="text-[11px] text-slate-400 mt-1">Try resetting the filters or clearing the search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((res) => {
            const IconComponent = typeIcons[res.resource_type] || BookOpen;

            return (
              <div
                key={res.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {res.skill_name}
                    </span>
                    <div className="flex items-center space-x-1">
                      {res.is_free && (
                        <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          Free
                        </span>
                      )}
                      <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600">
                        {res.difficulty}
                      </span>
                    </div>
                  </div>

                  <h3 className="mt-3 text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                    {res.title}
                  </h3>

                  <div className="mt-2 flex items-center space-x-1.5 text-[11px] text-slate-500">
                    <IconComponent className="h-3 w-3 text-slate-400" />
                    <span>{res.provider}</span>
                    <span>•</span>
                    <span className="capitalize">{res.resource_type}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <CategoryBadge category={res.skill_category} />

                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                  >
                    <span>Open Resource</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

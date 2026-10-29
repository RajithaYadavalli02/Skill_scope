import React, { useState } from 'react';
import {
  Info,
  CheckCircle2,
  Code2,
  BrainCircuit,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { api } from '../services/api';

interface AboutPageProps {
  onUserUpdate: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onUserUpdate }) => {
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleResetDemo = async () => {
    if (!window.confirm('Reset student profile back to the default College Junior persona?')) return;
    try {
      setResetting(true);
      await api.applyPreset('college_junior');
      setResetMessage('Profile reset to College Junior demo successfully!');
      onUserUpdate();
    } catch (err) {
      console.error('Error resetting demo', err);
    } finally {
      setResetting(false);
      setTimeout(() => setResetMessage(''), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center space-x-2 text-indigo-700 text-xs font-semibold mb-2">
          <Info className="h-4 w-4" />
          <span>Final-Year Engineering Project Documentation</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          SkillScope: System Methodology & Academic Defense Guide
        </h1>
        <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-3xl">
          This document explains the mathematical foundations, Natural Language Processing design choices,
          architectural patterns, and viva defense arguments for academic evaluators.
        </p>
      </div>

      {/* Quick Demo Reset Card for Viva */}
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Viva Examination Live Reset</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Reset the active demonstration state back to the standard undergraduate starting persona at any time.
          </p>
          {resetMessage && (
            <span className="inline-block mt-2 text-xs font-semibold text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded">
              {resetMessage}
            </span>
          )}
        </div>
        <button
          onClick={handleResetDemo}
          disabled={resetting}
          className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm transition disabled:opacity-50 self-start sm:self-auto"
        >
          <RotateCcw className={`h-3.5 w-3.5 ${resetting ? 'animate-spin' : ''}`} />
          <span>{resetting ? 'Resetting...' : 'Reset to Default Persona'}</span>
        </button>
      </div>

      {/* Core Defense Section 1: Dual-Engine Distinction */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
          <Calculator className="h-5 w-5 text-indigo-600" />
          <span>1. Clear Distinction: Rule-Based Logic vs. Machine Learning / NLP</span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border border-slate-200 rounded-lg">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="py-2.5 px-3 border-b">Dimension</th>
                <th className="py-2.5 px-3 border-b text-blue-700">Deterministic Rule Engine</th>
                <th className="py-2.5 px-3 border-b text-indigo-700">NLP Vector Space Model</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Underlying Algorithm</td>
                <td className="py-2.5 px-3">Weighted Level Match Formula & Discrete Set Difference</td>
                <td className="py-2.5 px-3">Sublinear TF-IDF Vectorizer + Cosine Distance Matrix</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Primary Objective</td>
                <td className="py-2.5 px-3">Auditable, 100% predictable verification of mandatory skills</td>
                <td className="py-2.5 px-3">Capture semantic relatedness, keyword proximity & tech transferability</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Transferable Skills</td>
                <td className="py-2.5 px-3">Exact mapping only (level check)</td>
                <td className="py-2.5 px-3">Credits partial overlap (e.g. Flask ↔ FastAPI, Postgres ↔ MySQL)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-800">Weight in Composite</td>
                <td className="py-2.5 px-3 font-bold text-slate-900">60% (Solid factual proficiency)</td>
                <td className="py-2.5 px-3 font-bold text-indigo-900">40% (Semantic conceptual coverage)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Core Defense Section 2: Mathematical Formulations */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
          <Code2 className="h-5 w-5 text-indigo-600" />
          <span>2. Mathematical Formulations & Algorithms</span>
        </div>

        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-1">A. Rule-Based Match Percentage:</h4>
            <div className="font-mono bg-white p-2.5 rounded border border-slate-200 text-slate-800 text-[11px] my-2">
              CoreMatch% = [ Σ (weight_i * min(UserLevel_i, ReqLevel_i) / ReqLevel_i) ] / [ Σ weight_i ] * 100<br/>
              OverallMatch% = (0.75 * CoreMatch%) + (0.25 * ElectiveMatch%)
            </div>
            <p className="text-slate-500 text-[11px]">
              Guarantees that possessing skills above the required level cannot artificially inflate deficits in other critical areas.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-1">B. Natural Language Processing Cosine Distance:</h4>
            <div className="font-mono bg-white p-2.5 rounded border border-slate-200 text-slate-800 text-[11px] my-2">
              tf-idf(t, d) = (1 + log(tf(t, d))) * log(1 + |D| / df(t))<br/>
              CosineSimilarity(u, r) = (u • r) / ( ||u|| * ||r|| ) = Σ (u_i * r_i) / [ √(Σ u_i²) * √(Σ r_i²) ]
            </div>
            <p className="text-slate-500 text-[11px]">
              Computed using Scikit-learn's vectorizer with sublinear term-frequency scaling and unigram + bigram feature tokens.
            </p>
          </div>
        </div>
      </div>

      {/* Core Defense Section 3: Academic Integrity & Limitations */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <span>3. Academic Integrity & Methodological Limitations</span>
        </div>

        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
            <h4 className="font-bold text-emerald-900 mb-1">Why We Avoided Fabricated Supervised Classifiers:</h4>
            <p className="text-emerald-800">
              Many student projects generate a random synthetic dataset of 1,000 fictional rows, fit a Random Forest,
              and claim "97.4% test accuracy". Academic examiners immediately flag this as unscientific because the labels
              are fabricated. SkillScope uses <strong>unsupervised Information Retrieval (TF-IDF + Cosine Distance)</strong>,
              which requires no fabricated ground-truth hiring outcomes, providing true academic credibility.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100">
            <h4 className="font-bold text-amber-900 mb-1">Documented System Limitations:</h4>
            <ul className="list-disc list-inside space-y-1 text-amber-800">
              <li>Lexical TF-IDF representations do not fully capture implicit soft skills (e.g. communication, teamwork).</li>
              <li>Estimated learning hours are indicative benchmarks assuming an average study velocity of 15 hours per week.</li>
              <li>Self-reported proficiency levels require practical coding interviews or code assessments for strict verification.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tech Stack Summary */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Project Technology Architecture</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Frontend UI</span>
            <span className="font-semibold text-slate-800">React 18 + TypeScript</span>
            <span className="block text-[10px] text-slate-500">Vite + Tailwind CSS</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Backend API</span>
            <span className="font-semibold text-slate-800">Python 3.12 FastAPI</span>
            <span className="block text-[10px] text-slate-500">Uvicorn ASGI</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">NLP & Vector Space</span>
            <span className="font-semibold text-slate-800">Scikit-learn + NumPy</span>
            <span className="block text-[10px] text-slate-500">TF-IDF & Cosine Similarity</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Persistence</span>
            <span className="font-semibold text-slate-800">SQLite + SQLAlchemy</span>
            <span className="block text-[10px] text-slate-500">Relational Schema</span>
          </div>
        </div>
      </div>
    </div>
  );
};

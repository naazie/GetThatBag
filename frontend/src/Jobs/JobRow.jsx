import { useState } from 'react';

export default function JobRow({ job, isApplied, onApply }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const ai = job.ai_analysis || {};

  return (
    <div className={`group border transition-all duration-300 rounded-xl mb-1 ${
      isExpanded ? 'bg-slate-900 border-blue-500/40 shadow-2xl mb-6 ring-1 ring-blue-500/20' : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'
    }`}>
      {/* HEADER ROW */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center p-4 cursor-pointer gap-6"
      >
        <div className={`w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center font-bold ${
          ai.score >= 80 ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5' : 'border-slate-700 text-slate-500'
        }`}>
          <span className="text-[10px] leading-none mb-0.5">MATCH</span>
          <span className="text-sm">{ai.score}%</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-100 truncate">{job.job_title}</h3>
            {ai.avg_offer?.includes('2') && (
              <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full border border-emerald-500/20 font-black tracking-tighter uppercase">
                25LPA+ Potential
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{job.employer_name} • <span className="text-slate-600">{job.job_city || 'Remote'}</span></p>
        </div>

        <div className="hidden md:block text-right min-w-[120px]">
          <p className="text-[10px] uppercase text-slate-600 font-black">Est. Package</p>
          <p className="text-sm font-mono text-slate-200 font-bold">{ai.avg_offer || "Premium"}</p>
        </div>

        <div className={`text-slate-600 text-xs transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </div>
      </div>

      {/* EXPANDED CONTENT AREA */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-4 border-t border-slate-800/50 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            
            {/* LEFT SIDE: WCE INSIGHTS (MAJORITY WIDTH) */}
            <div className="md:col-span-3 space-y-5">
              <div>
                <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-4 h-[1px] bg-blue-500"></span>
                  WCE Alumni & Diversity Insight
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed font-light">
                  {ai.company_insight}
                </p>
              </div>
              
              <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 border-l-4 border-l-blue-500">
                <h4 className="text-[10px] font-black text-blue-400 uppercase mb-1">Career Path Justification</h4>
                <p className="text-xs text-slate-400 italic">
                  {ai.justification}
                </p>
              </div>
            </div>

            {/* RIGHT SIDE: RESUME POINTS (MINORITY WIDTH) */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3">
                Resume Upgrades
              </h4>
              <ul className="space-y-3">
                {ai.resume_points?.map((point, i) => (
                  <li key={i} className="text-[11px] text-slate-400 flex gap-2 leading-tight group/item">
                    <span className="text-amber-500 transition-transform group-hover/item:translate-x-1">▹</span> 
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ACTION BAR: BUTTONS IN A ROW BELOW */}
          <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-800/30 pt-6">
            <a 
              href={job.job_apply_link} 
              target="_blank" 
              className="flex-1 bg-white text-black hover:bg-slate-200 py-3 rounded-lg text-center text-xs font-black transition-all active:scale-[0.98] shadow-lg shadow-white/5"
            >
              DIRECT APPLY VIA PORTAL
            </a>
            <button 
              onClick={(e) => { e.stopPropagation(); onApply(); }}
              className={`flex-1 py-3 rounded-lg text-xs font-black border transition-all active:scale-[0.98] ${
                isApplied 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {isApplied ? '✓ TRACKING IN DASHBOARD' : 'TRACK APPLICATION STATUS'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
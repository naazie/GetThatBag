import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Navbar from './components/navbar.jsx';
import JobRow from './Jobs/JobRow.jsx';
import AppliedDashboard from './Jobs/appliedDashboard.jsx';
import ScraperControl from './components/scraperControl.jsx';

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [view, setView] = useState('feed'); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // FILTERS
  const [onlyTargetLoc, setOnlyTargetLoc] = useState(true); 
  const [onlySummer, setOnlySummer] = useState(false);
  const [onlyStartup, setOnlyStartup] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/jobs');
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) { 
      console.error("MongoDB Sync Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  // Action: Toggle Track (Move to Applied Dashboard)
  const toggleTrack = async (job) => {
    const newStatus = !job.is_tracked;
    try {
      await axios.post('http://localhost:5000/api/jobs/track', {
        job_id: job._id, 
        is_tracked: newStatus
      });
      // Update local state immediately for snappy UI
      setJobs(prev => prev.map(j => j._id === job._id ? { ...j, is_tracked: newStatus } : j));
    } catch (err) {
      alert("Failed to update tracking status.");
    }
  };

  // Action: Delete Job (Permanent removal from DB)
  const deleteJob = async (jobId) => {
    if (!window.confirm("Remove this role from your database?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/jobs/delete?job_id=${jobId}`);
      setJobs(prev => prev.filter(j => j._id !== jobId));
    } catch (err) {
      alert("Delete failed. Check if backend is running.");
    }
  };

  const appliedJobs = useMemo(() => jobs.filter(j => j.is_tracked), [jobs]);

  const groupedData = useMemo(() => {
    const groups = {};
    
    const filtered = jobs.filter(j => {
      const isNotTracked = !j.is_tracked;
      const title = j.job_title?.toLowerCase() || "";
      const loc = j.job_location?.toLowerCase() || "";
      const employer = j.employer_name?.toLowerCase() || "";
      
      const matchesSearch = title.includes(searchTerm.toLowerCase()) || employer.includes(searchTerm.toLowerCase());
      const isSummer = j.is_summer_role || title.includes('intern') || title.includes('summer');
      // Added more specific startup hub keywords for Pune/Bangalore
      const isTargetLoc = loc.includes('pune') || loc.includes('bangalore') || loc.includes('bengaluru') || loc.includes('remote');
      const isStartup = j.is_startup || false;

      let pass = isNotTracked && matchesSearch;
      if (onlyTargetLoc) pass = pass && isTargetLoc;
      if (onlySummer) pass = pass && isSummer;
      if (onlyStartup) pass = pass && isStartup;
      
      return pass;
    });

    // 🔥 SORT: Higher AI Score first for 25LPA+ targets
    filtered.sort((a, b) => (b.ai_analysis?.score || 0) - (a.ai_analysis?.score || 0));

    filtered.forEach(job => {
      const date = job.scraped_at ? new Date(job.scraped_at * 1000).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
      }) : "Latest Discoveries";
      
      const category = job.search_query?.split(' ')[0] || "Software Engineer";

      if (!groups[date]) groups[date] = {};
      if (!groups[date][category]) groups[date][category] = [];
      groups[date][category].push(job);
    });

    return Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  }, [jobs, searchTerm, onlyTargetLoc, onlySummer, onlyStartup]);

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30">
      <Navbar setView={setView} currentView={view} count={appliedJobs.length} onSearch={setSearchTerm} />
      
      <main className="max-w-5xl mx-auto p-6 pt-10">
        {view === 'feed' && (
          <div className="flex gap-4 mb-8">
            <button 
              onClick={() => setOnlyTargetLoc(!onlyTargetLoc)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 ${
                onlyTargetLoc ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-slate-800 text-slate-500 hover:border-slate-600'
              }`}
            >
              📍 Pune / Bangalore Hubs
            </button>
            <button 
              onClick={() => setOnlySummer(!onlySummer)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 ${
                onlySummer ? 'bg-orange-600/20 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'border-slate-800 text-slate-500 hover:border-slate-600'
              }`}
            >
              ☀️ Summer 2026 Internships
            </button>
            <button 
              onClick={() => setOnlyStartup(!onlyStartup)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 ${
                onlyStartup ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.2)]' : 'border-slate-800 text-slate-500 hover:border-slate-600'
              }`}
            >
              🚀 Startup Internships
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-500 tracking-widest uppercase animate-pulse">Establishing Secure MongoDB Tunnel</p>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {view === 'feed' && (
              groupedData.length > 0 ? (
                groupedData.map(([date, categories]) => (
                  <div key={date} className="space-y-6">
                    <div className="sticky top-20 z-30 py-4 bg-[#020617]/95 backdrop-blur-md flex items-center gap-4">
                      <h2 className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase whitespace-nowrap">
                        Discovered {date}
                      </h2>
                      <div className="h-[1px] w-full bg-slate-800/50"></div>
                    </div>

                    {Object.entries(categories).map(([catName, catJobs]) => (
                      <div key={catName} className="space-y-3">
                        <h3 className="text-[10px] font-bold text-blue-400/60 uppercase ml-4 tracking-widest flex items-center gap-2">
                          <span className="w-1 h-1 bg-blue-500 rounded-full shadow-[0_0_5px_#3b82f6]"></span>
                          {catName} Roles
                        </h3>
                        <div className="flex flex-col gap-1 ml-4 border-l border-slate-800/50 pl-4">
                          {catJobs.map(job => (
                            <JobRow 
                              key={job._id} 
                              job={job} 
                              isApplied={job.is_tracked} 
                              onApply={() => toggleTrack(job)} 
                              onDelete={() => deleteJob(job._id)} 
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl">
                  <p className="text-slate-500 font-mono text-xs">NO LISTINGS FOUND • RUN SCAPER OR CLEAR FILTERS</p>
                </div>
              )
            )}

            {view === 'applied' && <AppliedDashboard appliedJobs={appliedJobs} onRemove={toggleTrack} />}
            {view === 'system' && <ScraperControl onRefresh={fetchJobs} />}
          </div>
        )}
      </main>
    </div>
  );
}
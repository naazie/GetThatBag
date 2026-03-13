// src/Jobs/appliedDashboard.jsx
export default function AppliedDashboard({ appliedJobs, setAppliedJobs }) {
  const updateStatus = (id, newStatus) => {
    setAppliedJobs(appliedJobs.map(j => 
      j.job_id === id ? { ...j, app_status: newStatus } : j
    ));
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800">
      <h2 className="text-2xl font-bold mb-6">Summer 2026 Tracking</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-500 border-b border-slate-800 uppercase text-[10px] tracking-widest">
              <th className="pb-4">Company & Role</th>
              <th className="pb-4 text-center">Fit Score</th>
              <th className="pb-4">Status</th>
              <th className="pb-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {appliedJobs.map(job => (
              <tr key={job.job_id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                <td className="py-4">
                  <div className="font-bold">{job.employer_name}</div>
                  <div className="text-xs text-slate-500">{job.job_title}</div>
                </td>
                <td className="py-4 text-center">
                  <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded font-mono">
                    {job.ai_analysis.score}%
                  </span>
                </td>
                <td className="py-4">
                  <select 
                    value={job.app_status}
                    onChange={(e) => updateStatus(job.job_id, e.target.value)}
                    className="bg-slate-800 text-xs rounded-lg px-2 py-1 outline-none border border-slate-700"
                  >
                    <option>Pending</option>
                    <option>Interviewing</option>
                    <option>Rejected</option>
                    <option>Offer</option>
                  </select>
                </td>
                <td className="py-4">
                   <a href={job.job_apply_link} target="_blank" className="text-blue-400 hover:underline text-xs">Link</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
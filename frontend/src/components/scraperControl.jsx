// components/scraperControl.jsx
import { useState } from 'react';
import axios from 'axios';

export default function ScraperControl() {
  const [status, setStatus] = useState('idle');
  const [logs, setLogs] = useState('');

  const triggerScrape = async () => {
    setStatus('running');
    setLogs('Initializing Scraper for Summer 2026 roles...\n');
    try {
      const res = await axios.post('http://localhost:5000/api/run-scraper');
      setLogs(prev => prev + res.data.output + '\n--- Finished ---');
      setStatus('done');
    } catch (err) {
      setLogs(prev => prev + 'Error: ' + err.message);
      setStatus('error');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 max-w-2xl mx-auto mt-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-white mb-2">System Terminal</h2>
        <p className="text-slate-500 text-sm">Targeting high-ticket 25 LPA+ roles via automation</p>
      </div>

      <button 
        onClick={triggerScrape}
        disabled={status === 'running'}
        className={`w-full py-4 rounded-2xl font-black text-sm tracking-widest transition-all ${
          status === 'running' 
          ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
          : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20'
        }`}
      >
        {status === 'running' ? 'SCRAPER ACTIVE...' : 'RUN SCRAPER SCRIPT'}
      </button>

      <div className="mt-8 bg-black p-4 rounded-xl border border-slate-800 font-mono text-[10px] text-emerald-500 h-40 overflow-y-auto">
        <p className="opacity-50 tracking-tighter">{'>'} System logs appear here...</p>
        <pre className="mt-2 whitespace-pre-wrap">{logs}</pre>
      </div>
    </div>
  );
}
// src/components/navbar.jsx
export default function Navbar({ setView, currentView, count, onSearch }) {
  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Logo Section */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 cursor-pointer" onClick={() => setView('feed')}>
            GetThatBag 💰
          </h1>
          <span className="hidden md:block text-[10px] font-bold text-slate-600 bg-slate-900 px-2 py-1 rounded border border-slate-800 tracking-widest">
            WCE EDITION
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-10 hidden lg:block">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Filter by company, role, or stack..." 
              onChange={(e) => onSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          {/* Feed Button */}
          <button 
            onClick={() => setView('feed')}
            className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${
              currentView === 'feed' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white hover:bg-slate-900'
            }`}
          >
            Feed
          </button>

          {/* Applied/Tracked Button */}
          <button 
            onClick={() => setView('applied')}
            className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              currentView === 'applied' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white hover:bg-slate-900'
            }`}
          >
            Tracked
            <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${currentView === 'applied' ? 'bg-white/20' : 'bg-slate-800 text-slate-400'}`}>
              {count}
            </span>
          </button>

          {/* System Terminal Button */}
          <button 
            onClick={() => setView('system')}
            className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              currentView === 'system' ? 'bg-slate-100 text-black shadow-lg shadow-white/10' : 'text-slate-500 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span className="text-xs">⚡</span>
            System
          </button>
        </div>

      </div>
    </nav>
  );
}
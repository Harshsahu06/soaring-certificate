import React from 'react';
import { Award, FileText, Layers, Settings, Database, CheckCircle2, Server, Sparkles, Sun, Moon } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, templatesCount, backendOnline, dbConnected, theme, setTheme }) {
  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-50 glass-panel border-b ${isDark ? 'border-slate-800/80' : 'border-slate-200/90'} shadow-md transition-colors`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/25 ring-1 ring-amber-400/30">
              <Award className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <h1 className={`text-xl font-bold tracking-wide flex items-center gap-2 font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                CertiGen <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Studio
                </span>
              </h1>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fast & Precision Certificate Generator</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className={`flex space-x-1.5 p-1.5 rounded-2xl border ${isDark ? 'bg-slate-950/80 border-slate-800/80' : 'bg-slate-100/90 border-slate-200'} shadow-inner`}>
            <button
              onClick={() => setActiveTab('single')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-medium text-xs transition-all duration-200 ${
                activeTab === 'single'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20 scale-[1.02]'
                  : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Single Form</span>
            </button>

            <button
              onClick={() => setActiveTab('bulk')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-medium text-xs transition-all duration-200 ${
                activeTab === 'bulk'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20 scale-[1.02]'
                  : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Bulk Excel/CSV</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-medium text-xs transition-all duration-200 ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20 scale-[1.02]'
                  : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>MongoDB History</span>
            </button>

            <button
              onClick={() => setActiveTab('template')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-medium text-xs transition-all duration-200 ${
                activeTab === 'template'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20 scale-[1.02]'
                  : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Coordinates</span>
            </button>
          </nav>

          {/* Status Badges & Theme Toggle */}
          <div className="flex items-center space-x-2.5 text-xs">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800'
                  : 'bg-white border-slate-300 text-amber-600 hover:bg-slate-100 shadow-sm'
              }`}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Backend Status */}
            <div className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
              backendOnline
                ? isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
            }`}>
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              <span>{backendOnline ? 'Backend Online' : 'Backend Disconnected'}</span>
            </div>

            {/* DB Status */}
            <div className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
              dbConnected
                ? isDark ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : isDark ? 'bg-slate-900 text-slate-400 border border-slate-800' : 'bg-slate-100 text-slate-600 border border-slate-300'
            }`}>
              <Database className="w-3.5 h-3.5 text-indigo-500" />
              <span>{dbConnected ? 'MongoDB Atlas Synced' : 'Local Mode'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

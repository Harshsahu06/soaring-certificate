import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, BookOpen, Key, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({
    candidates: 0,
    batches: 0,
    uinsAvailable: 0,
    certificates: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [candRes, batchRes, uinRes, certRes] = await Promise.all([
          axios.get('http://127.0.0.1:5000/api/admin/candidates'),
          axios.get('http://127.0.0.1:5000/api/admin/batches'),
          axios.get('http://127.0.0.1:5000/api/admin/uins'),
          axios.get('http://127.0.0.1:5000/api/certificates')
        ]);
        
        setStats({
          candidates: candRes.data.length,
          batches: batchRes.data.length,
          uinsAvailable: uinRes.data.filter(u => !u.isAssigned).length,
          certificates: certRes.data.count || certRes.data.certificates.length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Candidates', value: stats.candidates, icon: Users, color: 'bg-blue-500', link: '/admin/candidates' },
    { title: 'Active Batches', value: stats.batches, icon: BookOpen, color: 'bg-indigo-500', link: '/admin/batches' },
    { title: 'Available UINs', value: stats.uinsAvailable, icon: Key, color: 'bg-emerald-500', link: '/admin/uins' },
    { title: 'Generated Certs', value: stats.certificates, icon: FileText, color: 'bg-amber-500', link: '/admin/certificates' }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link key={index} to={stat.link} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.title}</p>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-lg ${stat.color} text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-8 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
        <div className="flex gap-4 flex-wrap">
          <Link to="/admin/candidates" className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Register Candidate
          </Link>
          <Link to="/admin/batches" className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Create Batch
          </Link>
          <Link to="/admin/certificates" className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm">
            Issue Certificate
          </Link>
        </div>
      </div>
    </div>
  );
}

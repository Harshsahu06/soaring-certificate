import React, { useState, useEffect } from 'react';
import { Package, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/inventory/dashboard');
        const data = await res.json();
        if (data.success) {
          setKpis(data.kpis);
          setLowStock(data.lowStockItems);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Dashboard</h1>
        <div className="flex gap-2">
           <Link to="/admin/inventory/items" className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-md text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-700">Items Master</Link>
           <Link to="/admin/inventory/stock-in" className="px-4 py-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md text-sm font-medium hover:bg-emerald-200">Stock IN</Link>
           <Link to="/admin/inventory/issue" className="px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md text-sm font-medium hover:bg-blue-200">Issue / Stock OUT</Link>
           <Link to="/admin/inventory/returns" className="px-4 py-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-md text-sm font-medium hover:bg-amber-200">Returns</Link>
           <Link to="/admin/inventory/history" className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-md text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-700">Ledger</Link>
        </div>
      </div>

      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard title="Total Items" value={kpis.totalItems} subtitle="In database" color="blue" />
          <KpiCard title="Consumables" value={kpis.consumables} subtitle="Tracked by quantity" color="amber" />
          <KpiCard title="Non-Consumables" value={kpis.nonConsumables} subtitle="Tracked by asset" color="purple" />
          <KpiCard title="Assigned Assets" value={kpis.assignedAssets} subtitle="Currently with personnel" color="emerald" />
          
          <KpiCard title="Low Stock Alerts" value={kpis.lowStockCount} subtitle="Needs reorder" color="red" alert={kpis.lowStockCount > 0} />
          <KpiCard title="Out of Stock" value={kpis.outOfStockCount} subtitle="Zero quantity" color="red" alert={kpis.outOfStockCount > 0} />
          <KpiCard title="Under Maintenance" value={kpis.maintenanceAssets} subtitle="Damaged or repairing" color="orange" />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mt-8">
         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
             <h2 className="text-lg font-semibold mb-4 text-red-600 dark:text-red-400">Low Stock Consumables</h2>
             {lowStock.length > 0 ? (
                 <ul className="space-y-3">
                     {lowStock.map(item => (
                         <li key={item._id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                             <div>
                                 <p className="font-medium">{item.name}</p>
                                 <p className="text-xs text-slate-500">{item.itemCode}</p>
                             </div>
                             <div className="text-right">
                                 <p className="font-bold text-red-600 dark:text-red-400">{item.currentQuantity} {item.unit}</p>
                                 <p className="text-xs text-slate-500">Min: {item.minimumQuantity}</p>
                             </div>
                         </li>
                     ))}
                 </ul>
             ) : (
                 <p className="text-slate-500">All consumables are well stocked.</p>
             )}
         </div>

         <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
            <ul className="space-y-2">
                <li><Link to="/admin/inventory/categories" className="text-amber-600 hover:underline">Manage Categories</Link></li>
                <li><Link to="/admin/inventory/people" className="text-amber-600 hover:underline">Manage Personnel</Link></li>
            </ul>
         </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, subtitle, color, alert }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    red: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800',
    orange: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  };

  return (
    <div className={`p-5 rounded-xl border ${colors[color]} ${alert ? 'animate-pulse' : ''}`}>
      <h3 className="text-sm font-medium opacity-80">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
      <p className="text-xs mt-1 opacity-70">{subtitle}</p>
    </div>
  );
}

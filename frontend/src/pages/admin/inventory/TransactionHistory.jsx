import React, { useState, useEffect } from 'react';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch('/api/inventory/transactions');
        const data = await res.json();
        if (data.success) {
          setTransactions(data.transactions);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Ledger / History</h1>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-500">Date</th>
              <th className="px-6 py-4 font-medium text-slate-500">Item</th>
              <th className="px-6 py-4 font-medium text-slate-500">Type</th>
              <th className="px-6 py-4 font-medium text-slate-500 text-right">In / Out</th>
              <th className="px-6 py-4 font-medium text-slate-500 text-right">Balance</th>
              <th className="px-6 py-4 font-medium text-slate-500">Reference / Person</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading && <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading ledger...</td></tr>}
            {!loading && transactions.map((t) => (
              <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-6 py-4">{formatDate(t.date)}</td>
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                  {t.item?.name || 'Deleted Item'}
                  <p className="text-xs text-slate-500 font-normal">{t.item?.itemCode}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    t.type === 'STOCK_IN' ? 'bg-emerald-100 text-emerald-800' :
                    t.type === 'ISSUE' ? 'bg-blue-100 text-blue-800' :
                    t.type === 'RETURN' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {t.type}
                  </span>
                </td>
                <td className={`px-6 py-4 text-right font-bold ${t.quantity > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {t.quantity > 0 ? '+' : ''}{t.quantity}
                </td>
                <td className="px-6 py-4 text-right font-medium">
                  {t.newQuantity} {t.item?.unit}
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  {t.person && <span>{t.person.name} (Person)</span>}
                  {t.supplier && <span>{t.supplier} (Supplier)</span>}
                  {t.referenceNumber && <p className="text-xs">Ref: {t.referenceNumber}</p>}
                  {t.remarks && <p className="text-xs italic mt-1">"{t.remarks}"</p>}
                </td>
              </tr>
            ))}
            {!loading && transactions.length === 0 && (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">No transactions recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

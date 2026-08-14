import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Layouts & Pages
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import Batches from './pages/admin/Batches';
import Candidates from './pages/admin/Candidates';
import UINManager from './pages/admin/UINManager';
import CertificateGen from './pages/admin/CertificateGen';
import TemplateSettings from './pages/admin/TemplateSettings';

// Inventory Pages
import InventoryDashboard from './pages/admin/inventory/Dashboard';
import ItemsMaster from './pages/admin/inventory/ItemsMaster';
import StockIn from './pages/admin/inventory/StockIn';
import IssueStock from './pages/admin/inventory/IssueStock';
import Returns from './pages/admin/inventory/Returns';
import TransactionHistory from './pages/admin/inventory/TransactionHistory';
import People from './pages/admin/inventory/People';
import Categories from './pages/admin/inventory/Categories';

// Legacy Tools
import SingleGen from './components/SingleGen';
import BulkGen from './components/BulkGen';
import TemplateMapper from './components/TemplateMapper';
import HistoryTab from './components/HistoryTab';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('cert_theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('cert_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 font-sans`}>
          <Routes>
            <Route path="/" element={<Navigate to="/admin/dashboard" />} />
            <Route path="/login" element={<Login />} />

            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="batches" element={<Batches />} />
              <Route path="candidates" element={<Candidates />} />
              <Route path="uins" element={<UINManager />} />
              <Route path="certificates" element={<CertificateGen />} />
              <Route path="template-settings" element={<TemplateSettings />} />

              {/* Inventory Routes */}
              <Route path="inventory/dashboard" element={<InventoryDashboard />} />
              <Route path="inventory/items" element={<ItemsMaster />} />
              <Route path="inventory/stock-in" element={<StockIn />} />
              <Route path="inventory/issue" element={<IssueStock />} />
              <Route path="inventory/returns" element={<Returns />} />
              <Route path="inventory/history" element={<TransactionHistory />} />
              <Route path="inventory/people" element={<People />} />
              <Route path="inventory/categories" element={<Categories />} />

              {/* Legacy Tools can be accessed via URL for now if needed, or added to sidebar later */}
              <Route path="tools/single" element={<SingleGen templates={[]} theme={theme} />} />
              <Route path="tools/bulk" element={<BulkGen templates={[]} theme={theme} />} />
              <Route path="tools/template" element={<TemplateMapper templates={[]} theme={theme} />} />
              <Route path="tools/history" element={<HistoryTab backendOnline={true} theme={theme} />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>

  );
}

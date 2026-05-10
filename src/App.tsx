/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MenuPage } from './pages/MenuPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminMenu } from './pages/AdminMenu';
import { Navbar } from './components/Navbar';
import { Toaster } from 'lucide-react'; // Placeholder for actual toast

export default function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<MenuPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/menu" element={<AdminMenu />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PlotsPage } from './pages/PlotsPage';
import { RowsPage } from './pages/RowsPage';
import { DashboardPage } from './pages/DashboardPage';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/plots" element={<PlotsPage />} />
            <Route path="/rows" element={<RowsPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
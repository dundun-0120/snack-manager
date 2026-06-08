import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import SnackLibrary from './pages/SnackLibrary';
import ClaimQueue from './pages/ClaimQueue';
import Recommend from './pages/Recommend';
import Statistics from './pages/Statistics';
import Members from './pages/Members';
import Settings from './pages/Settings';
import Shortcuts from './pages/Shortcuts';
import Login from './pages/Login';
import FamilySelect from './pages/FamilySelect';
import dataService from './services/dataService';
import useSettingsStore from './stores/settingsStore';
import { useAuthStore } from './stores/authStore';
import './styles/global.css';
import './styles/themes/cute-effects.css';

function AppLayout() {
  React.useEffect(() => {
    dataService.init();
  }, []);

  React.useEffect(() => {
    const initTheme = async () => {
      await useSettingsStore.getState().fetchSettings();
      const { theme } = useSettingsStore.getState();
      document.body.className = 'theme-' + theme;
      useSettingsStore.getState().applyCuteEffects();
    };
    initTheme();
  }, []);

  React.useEffect(() => {
    const shareData = dataService.share.parseShareUrl();
    if (shareData) {
      const confirmed = window.confirm('检测到共享数据，是否导入？这将替换当前所有数据。');
      if (confirmed) {
        const success = dataService.share.importData(shareData);
        if (success) { window.location.hash = '#/'; window.location.reload(); }
        else { alert('导入失败，数据格式无效。'); }
      } else { window.location.hash = '#/'; }
    }
  }, []);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-area">
        <Header />
        <main className="content-area">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/snacks" element={<SnackLibrary />} />
            <Route path="/claims" element={<ClaimQueue />} />
            <Route path="/recommend" element={<Recommend />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/members" element={<Members />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/shortcuts" element={<Shortcuts />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
}

function App() {
  const { isAuthenticated, isLoading, init } = useAuthStore();

  React.useEffect(() => {
    init();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f7fa' }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🍿</div>
          <div>加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/family" />} />
        <Route path="/family" element={isAuthenticated ? <FamilySelect /> : <Navigate to="/login" />} />
        <Route path="/*" element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" />} />
      </Routes>
    </HashRouter>
  );
}

export default App;

import { useState, useMemo } from 'react';
import { Dashboard } from './components/Dashboard';
import { Configuration } from './components/Configuration';
import { useVayuTheme } from './hooks/useVayuTheme';

function extractUserRole(tokenStr: string): string {
  const storedRole = localStorage.getItem('role');
  if (storedRole) return storedRole;

  if (!tokenStr) return 'Viewer';
  try {
    const parts = tokenStr.split('.');
    if (parts.length >= 2) {
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      return (
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        payload.role ||
        payload.BaseRole ||
        'Viewer'
      );
    }
  } catch {
    // fallback to Viewer
  }
  return 'Viewer';
}

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'config'>('dashboard');
  const { theme, toggleTheme } = useVayuTheme();

  const token = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('token') || localStorage.getItem('token') || '';
  }, []);

  const isAdmin = useMemo(() => {
    const role = extractUserRole(token);
    return role.toLowerCase().includes('admin');
  }, [token]);

  const handleOpenConfig = () => {
    if (isAdmin) {
      setCurrentView('config');
    }
  };

  return (
    <div className="w-full h-screen">
      {currentView === 'dashboard' || !isAdmin ? (
        <Dashboard 
          onOpenConfig={handleOpenConfig} 
          token={token} 
          theme={theme}
          onToggleTheme={toggleTheme}
          isAdmin={isAdmin}
        />
      ) : (
        <Configuration 
          onClose={() => setCurrentView('dashboard')} 
          token={token}
          theme={theme}
          onToggleTheme={toggleTheme}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}

export default App;


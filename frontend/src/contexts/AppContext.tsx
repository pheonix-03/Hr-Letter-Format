// ============================================================
// Application Context – Auth, Company, Settings
// ============================================================
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { db, getCurrentTimestamp } from '../store/db';
import { seedDatabase } from '../store/seed';
import type { User, Company, AppSettings } from '../types';
import type { AppSettingsRow } from '../store/db';

// ---- Context value shape ----
export interface AppContextValue {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  currentCompanyId: string | null;
  currentCompany: Company | null;
  isLoading: boolean;

  // Settings
  settings: AppSettings;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchCompany: (companyId: string) => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
}

const defaultSettings: AppSettings = {
  theme: 'light',
  language: 'en',
  dateFormat: 'DD/MM/YYYY',
  sidebarCollapsed: false,
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

// ---- Provider ----
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // ---- Bootstrap: seed DB + restore session ----
  useEffect(() => {
    const init = async () => {
      try {
        // Ensure demo data exists
        await seedDatabase();

        // Load settings
        const stored = await db.appSettings.get('default');
        if (stored) {
          const { id: _id, ...rest } = stored;
          setSettings(rest);
        }

        // Restore persisted session from sessionStorage
        const savedUserId = sessionStorage.getItem('hr_userId');
        const savedCompanyId = sessionStorage.getItem('hr_companyId');

        if (savedUserId) {
          const restoredUser = await db.users.get(savedUserId);
          if (restoredUser && restoredUser.isActive) {
            setUser(restoredUser);

            const companyIdToLoad =
              savedCompanyId && restoredUser.companyIds.includes(savedCompanyId)
                ? savedCompanyId
                : (restoredUser.companyIds.includes('comp_empowered_services')
                    ? 'comp_empowered_services'
                    : restoredUser.companyIds[0]) ?? null;

            if (companyIdToLoad) {
              const company = await db.companies.get(companyIdToLoad);
              setCurrentCompanyId(companyIdToLoad);
              setCurrentCompany(company ?? null);
            }
          } else {
            // Stale session – clear
            sessionStorage.removeItem('hr_userId');
            sessionStorage.removeItem('hr_companyId');
          }
        }
      } catch (err) {
        console.error('[AppContext] Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // ---- Login ----
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const matched = await db.users.where('email').equals(email.trim().toLowerCase()).first();

      if (!matched) return false;
      if (!matched.isActive) return false;
      // Plain-text comparison for the client-side demo
      if (matched.passwordHash !== password) return false;

      setUser(matched);

      const companyId =
        matched.companyIds.find((id) => id === 'comp_empowered_services') ||
        matched.companyIds[0] ||
        null;
      setCurrentCompanyId(companyId);

      if (companyId) {
        const company = await db.companies.get(companyId);
        setCurrentCompany(company ?? null);
      }

      // Persist session
      sessionStorage.setItem('hr_userId', matched.id);
      if (companyId) sessionStorage.setItem('hr_companyId', companyId);

      // Audit log
      await db.auditLogs.add({
        id: crypto.randomUUID(),
        companyId: companyId ?? '',
        userId: matched.id,
        userName: matched.name,
        action: 'login',
        entityType: 'user',
        entityId: matched.id,
        details: {},
        ipAddress: 'localhost',
        timestamp: getCurrentTimestamp(),
      });

      return true;
    } catch (err) {
      console.error('[AppContext] Login error:', err);
      return false;
    }
  }, []);

  // ---- Logout ----
  const logout = useCallback(() => {
    if (user) {
      db.auditLogs.add({
        id: crypto.randomUUID(),
        companyId: currentCompanyId ?? '',
        userId: user.id,
        userName: user.name,
        action: 'logout',
        entityType: 'user',
        entityId: user.id,
        details: {},
        ipAddress: 'localhost',
        timestamp: getCurrentTimestamp(),
      });
    }

    setUser(null);
    setCurrentCompanyId(null);
    setCurrentCompany(null);
    sessionStorage.removeItem('hr_userId');
    sessionStorage.removeItem('hr_companyId');
  }, [user, currentCompanyId]);

  // ---- Switch company ----
  const switchCompany = useCallback(
    async (companyId: string) => {
      if (!user || !user.companyIds.includes(companyId)) return;

      const company = await db.companies.get(companyId);
      setCurrentCompanyId(companyId);
      setCurrentCompany(company ?? null);
      sessionStorage.setItem('hr_companyId', companyId);
    },
    [user],
  );

  // ---- Update settings ----
  const updateSettings = useCallback(
    async (patch: Partial<AppSettings>) => {
      const merged: AppSettings = { ...settings, ...patch };
      setSettings(merged);

      const row: AppSettingsRow = { id: 'default', ...merged };
      await db.appSettings.put(row);
    },
    [settings],
  );

  // ---- Context value ----
  const value: AppContextValue = {
    user,
    isAuthenticated: !!user,
    currentCompanyId,
    currentCompany,
    isLoading,
    settings,
    login,
    logout,
    switchCompany,
    updateSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// ---- Consumer hook ----
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp() must be used within <AppProvider>');
  }
  return ctx;
}

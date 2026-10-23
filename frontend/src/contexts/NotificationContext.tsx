// ============================================================
// Notification Context – thin wrapper around antd message / notification
// ============================================================
import React, { createContext, useContext, useCallback, type ReactNode } from 'react';
import { message, notification } from 'antd';

// ---- Types ----
export interface NotificationContextValue {
  /** Toast-style success message (brief, auto-dismiss). */
  success: (msg: string) => void;
  /** Toast-style error message. */
  error: (msg: string) => void;
  /** Toast-style warning message. */
  warning: (msg: string) => void;
  /** Toast-style info message. */
  info: (msg: string) => void;

  /** Notification card with optional description (stays longer). */
  notify: (title: string, description?: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// ---- Provider ----
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // antd v5 static methods work fine for our purposes.
  // If you need contextHolder-based API, convert these to useMessage / useNotification hooks.

  const success = useCallback((msg: string) => {
    message.success(msg);
  }, []);

  const error = useCallback((msg: string) => {
    message.error(msg);
  }, []);

  const warning = useCallback((msg: string) => {
    message.warning(msg);
  }, []);

  const info = useCallback((msg: string) => {
    message.info(msg);
  }, []);

  const notify = useCallback(
    (
      title: string,
      description?: string,
      type: 'success' | 'error' | 'warning' | 'info' = 'info',
    ) => {
      notification[type]({
        message: title,
        description,
        placement: 'topRight',
        duration: 4.5,
      });
    },
    [],
  );

  const value: NotificationContextValue = {
    success,
    error,
    warning,
    info,
    notify,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// ---- Consumer hook ----
export function useNotification(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotification() must be used within <NotificationProvider>');
  }
  return ctx;
}

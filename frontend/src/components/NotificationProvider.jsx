import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import ToastNotification from './ToastNotification';

const NotificationContext = createContext(() => {});

export function NotificationProvider({ children }) {
  const [notice, setNotice] = useState(null);
  const notify = useCallback((message, type = 'success') => {
    setNotice({ message, type, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      {notice && <ToastNotification notice={notice} onDismiss={() => setNotice(null)} />}
    </NotificationContext.Provider>
  );
}

export const useNotify = () => useContext(NotificationContext);

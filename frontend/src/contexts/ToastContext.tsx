import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

interface ToastContextType {
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

interface ToastProviderProps {
  children: ReactNode;
  toastMethods: ToastContextType;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children, toastMethods }) => {
  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
    </ToastContext.Provider>
  );
};

export const useLayoutToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useLayoutToast must be used within a ToastProvider (MainLayout)');
  }
  return context;
};

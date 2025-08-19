'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useNotification, NotificationContainer } from '@/components/ui/notification';

interface NotificationContextType {
  showSuccess: (title: string, message: string, duration?: number) => string;
  showError: (title: string, message: string, duration?: number) => string;
  showWarning: (title: string, message: string, duration?: number) => string;
  showInfo: (title: string, message: string, duration?: number) => string;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const notification = useNotification();

  return (
    <NotificationContext.Provider value={notification}>
      {children}
      <NotificationContainer 
        notifications={notification.notifications} 
        removeNotification={notification.removeNotification} 
      />
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}

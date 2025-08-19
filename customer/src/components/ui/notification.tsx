'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  X, 
  Loader2 
} from 'lucide-react';
import { createPortal } from 'react-dom';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationProps {
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  show?: boolean;
}

const notificationIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: AlertCircle,
};

const notificationStyles = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-500',
    title: 'text-green-800 dark:text-green-200',
    message: 'text-green-700 dark:text-green-300',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-500',
    title: 'text-red-800 dark:text-red-200',
    message: 'text-red-700 dark:text-red-300',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: 'text-yellow-500',
    title: 'text-yellow-800 dark:text-yellow-200',
    message: 'text-yellow-700 dark:text-yellow-300',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-500',
    title: 'text-blue-800 dark:text-blue-200',
    message: 'text-blue-700 dark:text-blue-300',
  },
};

export function Notification({ 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose, 
  show = true 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);

  const Icon = notificationIcons[type];
  const styles = notificationStyles[type];

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);
      
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [show, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  const notificationElement = (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div
        className={`
          ${styles.bg} ${styles.border} border rounded-xl shadow-lg backdrop-blur-sm
          transform transition-all duration-300 ease-out hover:shadow-xl
          ${isAnimating ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        `}
      >
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Icon className={`h-6 w-6 ${styles.icon}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-semibold ${styles.title}`}>
                {title}
              </h3>
              <p className={`text-sm mt-1 ${styles.message}`}>
                {message}
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={handleClose}
                className="inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        {duration > 0 && (
          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-b-xl overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ease-linear ${
                type === 'success' ? 'bg-green-500' :
                type === 'error' ? 'bg-red-500' :
                type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{
                width: isAnimating ? '100%' : '0%',
                transition: `width ${duration}ms linear`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );

  // Use portal to render at the top level
  if (typeof window !== 'undefined') {
    return createPortal(notificationElement, document.body);
  }

  return notificationElement;
}

// Notification manager hook
export function useNotification() {
  const [notifications, setNotifications] = useState<Array<NotificationProps & { id: string }>>([]);

  const addNotification = (notification: Omit<NotificationProps, 'show'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id, show: true };
    
    setNotifications(prev => [...prev, newNotification]);
    
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showSuccess = (title: string, message: string, duration = 5000) => {
    return addNotification({ type: 'success', title, message, duration });
  };

  const showError = (title: string, message: string, duration = 7000) => {
    return addNotification({ type: 'error', title, message, duration });
  };

  const showWarning = (title: string, message: string, duration = 5000) => {
    return addNotification({ type: 'warning', title, message, duration });
  };

  const showInfo = (title: string, message: string, duration = 5000) => {
    return addNotification({ type: 'info', title, message, duration });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}

// Notification container component
export function NotificationContainer({ notifications, removeNotification }: {
  notifications: Array<NotificationProps & { id: string }>;
  removeNotification: (id: string) => void;
}) {
  return (
    <>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </>
  );
}

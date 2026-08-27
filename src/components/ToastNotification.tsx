import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'error';
  text: string;
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-400" />}
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
          </div>
          <div className="toast-text">{toast.text}</div>
          <button className="toast-close" onClick={() => onDismiss(toast.id)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

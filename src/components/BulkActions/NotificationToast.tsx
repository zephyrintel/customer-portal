import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface NotificationToastProps {
  message: string | null;
  type: 'success' | 'error';
  onClose: () => void;
  durationMs?: number; // optional duration, default 5000ms
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  type,
  onClose,
  durationMs = 5000
}) => {
  const [progress, setProgress] = useState(100);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, durationMs);

      mountedRef.current = true;
      const raf = requestAnimationFrame(() => setProgress(0));

      return () => {
        clearTimeout(timer);
        cancelAnimationFrame(raf);
        mountedRef.current = false;
        setProgress(100);
      };
    }
  }, [message, onClose, durationMs]);

  if (!message) return null;

  const colorClasses = useMemo(
    () => (
      type === 'success'
        ? {
            container: 'bg-green-50 border border-green-200',
            icon: 'text-green-600',
            text: 'text-green-800',
            close: 'text-green-500 hover:bg-green-100 focus:ring-green-600',
            bar: 'bg-green-600'
          }
        : {
            container: 'bg-red-50 border border-red-200',
            icon: 'text-red-600',
            text: 'text-red-800',
            close: 'text-red-500 hover:bg-red-100 focus:ring-red-600',
            bar: 'bg-red-600'
          }
    ),
    [type]
  );

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`rounded-lg shadow-lg p-4 ${colorClasses.container}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {type === 'success' ? (
              <CheckCircle className={`w-5 h-5 ${colorClasses.icon}`} />
            ) : (
              <XCircle className={`w-5 h-5 ${colorClasses.icon}`} />
            )}
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${colorClasses.text}`}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorClasses.close}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="mt-3 h-1 w-full bg-black/5 rounded">
          <div
            className={`h-1 rounded ${colorClasses.bar}`}
            style={{ width: `${progress}%`, transition: `width ${durationMs}ms linear` }}
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;

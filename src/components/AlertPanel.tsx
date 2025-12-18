import { useState, useEffect } from 'react';

interface AlertPanelProps {
  type?: 'warning' | 'danger' | 'info';
  title?: string;
  message?: string;
  blinking?: boolean;
}

export default function AlertPanel({
  type = 'warning',
  title = 'ALERT',
  message = 'SYSTEM STATUS NOMINAL',
  blinking = false,
}: AlertPanelProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!blinking) {
      setVisible(true);
      return;
    }

    const interval = setInterval(() => {
      setVisible(v => !v);
    }, 500);

    return () => clearInterval(interval);
  }, [blinking]);

  const colorClass = {
    warning: 'alert-warning',
    danger: 'alert-danger',
    info: 'alert-info',
  }[type];

  return (
    <div
      className={`alert-panel ${colorClass}`}
      style={{ opacity: visible ? 1 : 0.3 }}
    >
      <div className="alert-border">
        <div className="alert-header">
          <span className="alert-title">{title}</span>
        </div>
        <div className="alert-body">
          <span className="alert-message">{message}</span>
        </div>
      </div>
    </div>
  );
}

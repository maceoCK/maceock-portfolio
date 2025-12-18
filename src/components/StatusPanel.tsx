import { useEffect, useRef, useState } from 'react';

interface StatusItem {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  status?: 'normal' | 'warning' | 'critical';
}

interface StatusPanelProps {
  title?: string;
  items?: StatusItem[];
}

const defaultItems: StatusItem[] = [
  { label: 'SYNC RATE', value: 87.3, max: 100, unit: '%', status: 'normal' },
  { label: 'HARMONICS', value: 42.1, max: 100, unit: '%', status: 'normal' },
  { label: 'PLUG DEPTH', value: 65.8, max: 100, unit: '%', status: 'warning' },
  { label: 'NERVE LINK', value: 94.2, max: 100, unit: '%', status: 'normal' },
];

export default function StatusPanel({
  title = 'PILOT STATUS',
  items = defaultItems,
}: StatusPanelProps) {
  const [animatedItems, setAnimatedItems] = useState(items);
  const intervalRef = useRef<number>(0);

  useEffect(() => {
    // Slower update rate for performance
    intervalRef.current = window.setInterval(() => {
      setAnimatedItems(prev =>
        prev.map(item => ({
          ...item,
          value: Math.max(0, Math.min(item.max || 100, item.value + (Math.random() - 0.5) * 1.5)),
        }))
      );
    }, 200); // Reduced from 100ms to 200ms

    return () => clearInterval(intervalRef.current);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'critical':
        return 'var(--eva-red)';
      case 'warning':
        return 'var(--eva-orange)';
      default:
        return 'var(--eva-green)';
    }
  };

  return (
    <div className="status-panel">
      <div className="status-header">
        <span className="status-title">{title}</span>
      </div>
      <div className="status-body">
        {animatedItems.map((item, index) => (
          <div key={index} className="status-item">
            <div className="status-item-header">
              <span className="status-item-label">{item.label}</span>
            </div>
            <div className="status-bar-container">
              <div
                className="status-bar"
                style={{
                  width: `${(item.value / (item.max || 100)) * 100}%`,
                  backgroundColor: getStatusColor(item.status),
                  boxShadow: `0 0 8px ${getStatusColor(item.status)}`,
                }}
              />
            </div>
            <div className="status-value" style={{ color: getStatusColor(item.status) }}>
              {item.value.toFixed(1)}{item.unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

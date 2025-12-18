import { useState, useEffect } from 'react';

interface DigitalTimerProps {
  initialMinutes?: number;
  initialSeconds?: number;
  counting?: 'up' | 'down';
  color?: string;
  label?: string;
}

export default function DigitalTimer({
  initialMinutes = 4,
  initialSeconds = 59,
  counting = 'down',
  color = '#ff0040',
  label = 'ACTIVE TIME REMAINING',
}: DigitalTimerProps) {
  const [time, setTime] = useState(initialMinutes * 60 + initialSeconds);
  const [centiseconds, setCentiseconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCentiseconds(prev => {
        if (prev >= 99) {
          setTime(t => {
            if (counting === 'down') {
              return t > 0 ? t - 1 : 0;
            }
            return t + 1;
          });
          return 0;
        }
        return prev + 1;
      });
    }, 10);

    return () => clearInterval(interval);
  }, [counting]);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  const formatDigit = (n: number, digits: number = 2) => {
    return n.toString().padStart(digits, '0');
  };

  return (
    <div className="digital-timer">
      <div className="timer-label">
        <span className="timer-label-en">{label}</span>
      </div>
      <div className="timer-display" style={{ color, textShadow: `0 0 20px ${color}, 0 0 40px ${color}` }}>
        <span className="timer-digit">{formatDigit(minutes)}</span>
        <span className="timer-separator">:</span>
        <span className="timer-digit">{formatDigit(seconds)}</span>
        <span className="timer-separator">:</span>
        <span className="timer-digit timer-centiseconds">{formatDigit(centiseconds)}</span>
      </div>
      <div className="timer-controls">
        <div className="timer-control" data-active="false">STOP</div>
        <div className="timer-control" data-active="false">SLOW</div>
        <div className="timer-control" data-active="true">NORMAL</div>
        <div className="timer-control timer-control-racing" data-active="false">RACING</div>
      </div>
    </div>
  );
}

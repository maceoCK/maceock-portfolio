import { useEffect, useRef, useState } from 'react';

interface DataStreamProps {
  width?: number;
  height?: number;
  color?: string;
  label?: string;
}

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';

const TARGET_FPS = 15;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
let lastStreamFrameTime = 0;

export default function DataStream({
  width = 200,
  height = 300,
  color = '#00ff41',
  label = 'DATA STREAM',
}: DataStreamProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropsRef = useRef<Int16Array | null>(null);
  const animationRef = useRef<number>(0);
  const [hexValues, setHexValues] = useState<string[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio, 1);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const columns = Math.floor(width / 14);
    dropsRef.current = new Int16Array(columns).fill(1);

    ctx.font = '12px monospace';

    const draw = (currentTime: number) => {
      if (currentTime - lastStreamFrameTime < FRAME_INTERVAL) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }
      lastStreamFrameTime = currentTime;

      const drops = dropsRef.current;
      if (!drops) return;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = color;

      for (let i = 0; i < columns; i++) {
        const char = characters[Math.floor(Math.random() * characters.length)];
        const x = i * 14;

        ctx.fillText(char, x, drops[i] * 14);

        if (drops[i] * 14 > height && Math.random() > 0.95) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animationRef.current);
  }, [width, height, color]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHexValues(prev => {
        const newValues = prev.length > 4 ? prev.slice(1) : prev;
        newValues.push(
          Array(8)
            .fill(0)
            .map(() => Math.floor(Math.random() * 16).toString(16).toUpperCase())
            .join('')
        );
        return newValues;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="data-stream-container">
      <div className="data-stream-header">
        <span className="data-stream-label">{label}</span>
      </div>
      <div className="data-stream-display" style={{ width, height }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="hex-readout" style={{ color }}>
        {hexValues.slice(-3).map((hex, i) => (
          <div key={i} className="hex-line">0x{hex}</div>
        ))}
      </div>
    </div>
  );
}

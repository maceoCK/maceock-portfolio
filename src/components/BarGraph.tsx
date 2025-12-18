import { useEffect, useRef, useMemo } from 'react';

interface BarGraphProps {
  width?: number;
  height?: number;
  barCount?: number;
  color?: string;
  label?: string;
}

const TARGET_FPS = 24;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
let lastBarFrameTime = 0;

export default function BarGraph({
  width = 300,
  height = 150,
  barCount = 16,
  color = '#00ff41',
  label = 'FREQUENCY SPECTRUM',
}: BarGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const valuesRef = useRef<Float32Array>(new Float32Array(barCount).map(() => Math.random()));
  const targetValuesRef = useRef<Float32Array>(new Float32Array(barCount).map(() => Math.random()));
  const animationRef = useRef<number>(0);
  const frameCountRef = useRef(0);

  const gradient = useMemo(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const grad = ctx.createLinearGradient(0, height, 0, 0);
    grad.addColorStop(0, color);
    grad.addColorStop(1, color + '33');
    return grad;
  }, [color, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Lower resolution for performance
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const barWidth = (width - (barCount - 1) * 2) / barCount;
    const maxBarHeight = height - 10;

    const render = (currentTime: number) => {
      // Throttle frame rate
      if (currentTime - lastBarFrameTime < FRAME_INTERVAL) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }
      lastBarFrameTime = currentTime;
      frameCountRef.current++;

      // Update target values every 8 frames
      if (frameCountRef.current % 8 === 0) {
        for (let i = 0; i < barCount; i++) {
          targetValuesRef.current[i] = Math.random();
        }
      }

      // Smooth interpolation
      for (let i = 0; i < barCount; i++) {
        valuesRef.current[i] += (targetValuesRef.current[i] - valuesRef.current[i]) * 0.15;
      }

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      // Draw bars
      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 2);
        const barHeight = valuesRef.current[i] * maxBarHeight;
        const y = height - barHeight;

        // Simple gradient fill
        const grad = ctx.createLinearGradient(x, height, x, y);
        grad.addColorStop(0, color);
        grad.addColorStop(1, color + '33');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationRef.current);
  }, [width, height, barCount, color, gradient]);

  return (
    <div className="bar-graph-container">
      <div className="bar-graph-header">
        <span className="bar-graph-label">{label}</span>
      </div>
      <div className="bar-graph-display" style={{ width, height }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}

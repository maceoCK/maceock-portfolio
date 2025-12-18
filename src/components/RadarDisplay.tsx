import { useEffect, useRef } from 'react';

interface RadarDisplayProps {
  size?: number;
  color?: string;
  label?: string;
}

const TARGET_FPS = 24;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
let lastRadarFrameTime = 0;

export default function RadarDisplay({
  size = 200,
  color = '#00ff41',
  label = 'THREAT DETECTION',
}: RadarDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const targetsRef = useRef<{ angle: number; distance: number; age: number }[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio, 1.5);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;

    const draw = (currentTime: number) => {
      if (currentTime - lastRadarFrameTime < FRAME_INTERVAL) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }
      lastRadarFrameTime = currentTime;

      // Clear with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, size, size);

      // Draw rings
      ctx.strokeStyle = color + '33';
      ctx.lineWidth = 1;
      for (const r of [0.25, 0.5, 0.75, 1]) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw crosshairs
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.stroke();

      // Draw sweep line
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angleRef.current) * radius,
        centerY + Math.sin(angleRef.current) * radius
      );
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Add random targets occasionally
      if (Math.random() > 0.97) {
        targetsRef.current.push({
          angle: Math.random() * Math.PI * 2,
          distance: 0.3 + Math.random() * 0.6,
          age: 0,
        });
      }

      // Draw and age targets (limit count)
      if (targetsRef.current.length > 5) {
        targetsRef.current = targetsRef.current.slice(-5);
      }

      targetsRef.current = targetsRef.current.filter(target => {
        target.age++;
        const alpha = Math.max(0, 1 - target.age / 80);
        if (alpha <= 0) return false;

        const x = centerX + Math.cos(target.angle) * radius * target.distance;
        const y = centerY + Math.sin(target.angle) * radius * target.distance;

        ctx.fillStyle = `rgba(255, 0, 64, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

      angleRef.current += 0.04;
      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animationRef.current);
  }, [size, color]);

  return (
    <div className="radar-container">
      <div className="radar-header">
        <span className="radar-label">{label}</span>
      </div>
      <div className="radar-display" style={{ width: size, height: size }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="radar-footer">
        <span>RANGE: 500km</span>
        <span>MODE: ACTIVE</span>
      </div>
    </div>
  );
}

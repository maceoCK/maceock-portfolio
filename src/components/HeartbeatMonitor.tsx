import { useRef, useEffect } from 'react';

interface HeartbeatMonitorProps {
  width?: number;
  height?: number;
  color?: string;
  label?: string;
}

export default function HeartbeatMonitor({
  width = 180,
  height = 60,
  color = '#ff6600',
  label = 'SYNC PULSE',
}: HeartbeatMonitorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const sweepPosRef = useRef(0);
  const dataRef = useRef<number[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Initialize data array
    dataRef.current = new Array(width).fill(0.5);

    // ECG waveform function - returns 0-1 value
    const getECGValue = (t: number): number => {
      const cycleLength = 50; // shorter cycle = beats closer together
      const p = (t % cycleLength) / cycleLength;

      let value = 0.35; // baseline lower

      if (p < 0.08) {
        // P wave
        value = 0.35 + Math.sin(p / 0.08 * Math.PI) * 0.08;
      } else if (p < 0.12) {
        // Flat before QRS
        value = 0.35;
      } else if (p < 0.16) {
        // Q dip (deeper)
        value = 0.35 - Math.sin((p - 0.12) / 0.04 * Math.PI) * 0.12;
      } else if (p < 0.24) {
        // R spike (main peak)
        value = 0.35 + Math.sin((p - 0.16) / 0.08 * Math.PI) * 0.55;
      } else if (p < 0.32) {
        // S dip (much deeper)
        value = 0.35 - Math.sin((p - 0.24) / 0.08 * Math.PI) * 0.25;
      } else if (p < 0.42) {
        // ST segment
        value = 0.35;
      } else if (p < 0.60) {
        // T wave
        value = 0.35 + Math.sin((p - 0.42) / 0.18 * Math.PI) * 0.12;
      } else {
        // Flat baseline
        value = 0.35;
      }

      return value;
    };

    const render = () => {
      // Clear canvas with dark background
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid
      ctx.strokeStyle = `${color}15`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let y = 0; y < height; y += 10) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      for (let x = 0; x < width; x += 10) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      ctx.stroke();

      // Update sweep position and add new data point
      const sweepSpeed = 0.6; // pixels per frame (slower sweep)
      sweepPosRef.current += sweepSpeed;
      if (sweepPosRef.current >= width) {
        sweepPosRef.current = 0;
      }

      // Add new ECG value at sweep position
      timeRef.current += 1;
      const sweepX = Math.floor(sweepPosRef.current);
      dataRef.current[sweepX] = getECGValue(timeRef.current);

      // Clear a few pixels ahead (the black eraser bar)
      const eraseWidth = 12;
      for (let i = 1; i <= eraseWidth; i++) {
        const eraseX = (sweepX + i) % width;
        dataRef.current[eraseX] = -1; // -1 means "erased"
      }

      // Draw the waveform
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.beginPath();

      let drawing = false;
      for (let x = 0; x < width; x++) {
        const value = dataRef.current[x];

        if (value < 0) {
          // This is the erased section - stop drawing
          drawing = false;
          continue;
        }

        const y = height - value * height;

        if (!drawing) {
          ctx.moveTo(x, y);
          drawing = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw the sweep line (faint vertical line at current position)
      ctx.strokeStyle = `${color}40`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sweepX, 0);
      ctx.lineTo(sweepX, height);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationRef.current);
  }, [width, height, color]);

  return (
    <div className="oscilloscope-container">
      <div className="oscilloscope-header">
        <span className="oscilloscope-label">{label}</span>
      </div>
      <div className="oscilloscope-display" style={{ width, height, background: '#0a0a0a' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div className="oscilloscope-footer">
        <span>BPM: 52</span>
        <span>STATUS: NOMINAL</span>
      </div>
    </div>
  );
}

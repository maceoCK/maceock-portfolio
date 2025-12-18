import { useRef, useEffect, useCallback, useMemo } from 'react';

interface OscilloscopeProps {
  width?: number;
  height?: number;
  color?: string;
  frequency?: number;
  amplitude?: number;
  waveType?: 'sine' | 'square' | 'sawtooth' | 'noise' | 'heartbeat';
  lineWidth?: number;
  showGrid?: boolean;
  label?: string;
}

const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision lowp float;
  uniform vec4 u_color;
  void main() {
    gl_FragColor = u_color;
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
    : [0, 1, 0.25];
}

// Shared time for all oscilloscopes
let globalTime = 0;
let lastFrameTime = 0;
const TARGET_FPS = 30;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

export default function Oscilloscope({
  width = 400,
  height = 200,
  color = '#00ff41',
  frequency = 2,
  amplitude = 0.6,
  waveType = 'sine',
  lineWidth = 2,
  showGrid = true,
  label = 'WAVE MONITOR',
}: OscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const bufferRef = useRef<WebGLBuffer | null>(null);
  const animationRef = useRef<number>(0);
  const positionLocationRef = useRef<number>(-1);
  const colorLocationRef = useRef<WebGLUniformLocation | null>(null);
  const positionsRef = useRef<Float32Array>(new Float32Array(128 * 2));

  // Reduce point count for smaller canvases
  const numPoints = useMemo(() => Math.min(128, Math.max(32, Math.floor(width / 4))), [width]);

  const colorRgb = useMemo(() => hexToRgb(color), [color]);

  const generateWaveform = useCallback((time: number): Float32Array => {
    const positions = positionsRef.current;

    for (let i = 0; i < numPoints; i++) {
      const x = (i / (numPoints - 1)) * 2 - 1;
      const t = time + (i / numPoints) * Math.PI * 2 * frequency;
      let y = 0;

      switch (waveType) {
        case 'sine':
          y = Math.sin(t) * amplitude;
          break;
        case 'square':
          y = (Math.sin(t) > 0 ? 1 : -1) * amplitude;
          break;
        case 'sawtooth':
          y = ((t % (Math.PI * 2)) / Math.PI - 1) * amplitude;
          break;
        case 'noise':
          y = (Math.random() * 2 - 1) * amplitude * 0.5 + Math.sin(t * 0.5) * amplitude * 0.5;
          break;
        case 'heartbeat':
          const phase = (t % (Math.PI * 2)) / (Math.PI * 2);
          if (phase < 0.1) y = Math.sin(phase * Math.PI * 10) * amplitude * 0.3;
          else if (phase < 0.2) y = -Math.sin((phase - 0.1) * Math.PI * 10) * amplitude * 0.5;
          else if (phase < 0.3) y = Math.sin((phase - 0.2) * Math.PI * 10) * amplitude;
          else if (phase < 0.4) y = -Math.sin((phase - 0.3) * Math.PI * 10) * amplitude * 0.3;
          else y = 0;
          break;
      }

      positions[i * 2] = x;
      positions[i * 2 + 1] = y;
    }

    return positions;
  }, [frequency, amplitude, waveType, numPoints]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use lower resolution for performance
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const gl = canvas.getContext('webgl', {
      antialias: false,
      alpha: true,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    });

    if (!gl) return;
    glRef.current = gl;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;
    programRef.current = program;

    const buffer = gl.createBuffer();
    bufferRef.current = buffer;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.useProgram(program);

    positionLocationRef.current = gl.getAttribLocation(program, 'a_position');
    colorLocationRef.current = gl.getUniformLocation(program, 'u_color');

    gl.enableVertexAttribArray(positionLocationRef.current);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(positionLocationRef.current, 2, gl.FLOAT, false, 0, 0);

    // Set color once
    gl.uniform4f(colorLocationRef.current, colorRgb[0], colorRgb[1], colorRgb[2], 1.0);

    const render = (currentTime: number) => {
      // Throttle frame rate
      if (currentTime - lastFrameTime < FRAME_INTERVAL) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }
      lastFrameTime = currentTime;
      globalTime += 0.05;

      if (!gl || !buffer) return;

      gl.clear(gl.COLOR_BUFFER_BIT);

      const positions = generateWaveform(globalTime);
      gl.bufferData(gl.ARRAY_BUFFER, positions.subarray(0, numPoints * 2), gl.DYNAMIC_DRAW);

      gl.lineWidth(lineWidth);
      gl.drawArrays(gl.LINE_STRIP, 0, numPoints);

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (gl) {
        if (programRef.current) gl.deleteProgram(programRef.current);
        if (bufferRef.current) gl.deleteBuffer(bufferRef.current);
      }
    };
  }, [width, height, colorRgb, generateWaveform, lineWidth, numPoints]);

  return (
    <div className="oscilloscope-container">
      <div className="oscilloscope-header">
        <span className="oscilloscope-label">{label}</span>
      </div>
      <div className="oscilloscope-display" style={{ width, height }}>
        {showGrid && <div className="oscilloscope-grid" />}
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%' }}
        />
        <div className="oscilloscope-glow" style={{ boxShadow: `inset 0 0 20px ${color}22` }} />
      </div>
      <div className="oscilloscope-footer">
        <span>FREQ: {frequency.toFixed(1)}Hz</span>
        <span>AMP: {(amplitude * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}

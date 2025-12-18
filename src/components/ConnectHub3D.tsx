import { useEffect, useRef, useState } from 'react';

interface ConnectNode {
  id: string;
  label: string;
  icon: string;
  url: string;
  color: string;
  x: number;
  y: number;
  z: number;
}

const connectNodes: ConnectNode[] = [
  { id: 'github', label: 'GITHUB', icon: 'GH', url: 'https://github.com/MaceoCK', color: '#00ff41', x: 0, y: 0, z: 0 },
  { id: 'linkedin', label: 'LINKEDIN', icon: 'IN', url: 'https://linkedin.com/in/maceo-cardinale-kwik', color: '#00ffff', x: 0, y: 0, z: 0 },
  { id: 'email', label: 'EMAIL', icon: '@', url: 'mailto:maceo.ck@gmail.com', color: '#ff6600', x: 0, y: 0, z: 0 },
];

const vertexShaderSource = `
  precision mediump float;
  attribute vec3 aPosition;
  attribute vec3 aNormal;
  attribute vec3 aColor;

  uniform mat4 uProjection;
  uniform mat4 uView;
  uniform mat4 uModel;
  uniform float uTime;
  uniform float uHover;

  varying vec3 vColor;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDepth;

  void main() {
    vec3 pos = aPosition;

    // Pulse effect on hover
    float pulse = 1.0 + uHover * 0.15 * sin(uTime * 8.0);
    pos *= pulse;

    vec4 worldPos = uModel * vec4(pos, 1.0);
    vec4 viewPos = uView * worldPos;
    gl_Position = uProjection * viewPos;

    vColor = aColor;
    vNormal = mat3(uModel) * aNormal;
    vPosition = worldPos.xyz;
    vDepth = -viewPos.z;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  varying vec3 vColor;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDepth;

  uniform float uTime;
  uniform float uHover;

  vec3 celShade(vec3 color, vec3 normal, vec3 lightDir) {
    float diff = dot(normalize(normal), normalize(lightDir));
    float levels = 4.0;
    diff = floor(diff * levels) / levels;
    diff = max(0.4, diff);
    return color * diff;
  }

  void main() {
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    vec3 color = vColor;

    if (length(vNormal) > 0.1) {
      color = celShade(color, vNormal, lightDir);
    }

    // Glow effect
    float glow = 0.3 + uHover * 0.4 + 0.1 * sin(uTime * 3.0);
    color += vColor * glow;

    // Scanline effect
    float scanline = sin(gl_FragCoord.y * 2.0) * 0.5 + 0.5;
    color *= mix(1.0, scanline, 0.08);

    gl_FragColor = vec4(color, 1.0);
  }
`;

const lineVertexShader = `
  precision mediump float;
  attribute vec3 aPosition;
  attribute vec3 aColor;

  uniform mat4 uProjection;
  uniform mat4 uView;
  uniform mat4 uModel;
  uniform float uTime;

  varying vec3 vColor;
  varying float vDepth;

  void main() {
    vec4 worldPos = uModel * vec4(aPosition, 1.0);
    vec4 viewPos = uView * worldPos;
    gl_Position = uProjection * viewPos;
    vColor = aColor;
    vDepth = -viewPos.z;
  }
`;

const lineFragmentShader = `
  precision mediump float;
  varying vec3 vColor;
  varying float vDepth;
  uniform float uTime;

  void main() {
    float pulse = sin(uTime * 4.0 - vDepth * 0.5) * 0.3 + 0.7;
    vec3 color = vColor * pulse;
    gl_FragColor = vec4(color, 0.6);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vs: string, fs: string): WebGLProgram | null {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vs);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fs);
  if (!vertexShader || !fragmentShader) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

function mat4Perspective(fov: number, aspect: number, near: number, far: number): Float32Array {
  const f = 1.0 / Math.tan(fov / 2);
  const nf = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0
  ]);
}

function mat4LookAt(eye: number[], center: number[], up: number[]): Float32Array {
  const zAxis = normalize([eye[0] - center[0], eye[1] - center[1], eye[2] - center[2]]);
  const xAxis = normalize(cross(up, zAxis));
  const yAxis = cross(zAxis, xAxis);
  return new Float32Array([
    xAxis[0], yAxis[0], zAxis[0], 0,
    xAxis[1], yAxis[1], zAxis[1], 0,
    xAxis[2], yAxis[2], zAxis[2], 0,
    -dot(xAxis, eye), -dot(yAxis, eye), -dot(zAxis, eye), 1
  ]);
}

function mat4Identity(): Float32Array {
  return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
}

function normalize(v: number[]): number[] {
  const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
  return len > 0 ? [v[0]/len, v[1]/len, v[2]/len] : [0, 0, 0];
}

function cross(a: number[], b: number[]): number[] {
  return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
}

function dot(a: number[], b: number[]): number {
  return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255
  ] : [1, 1, 1];
}

function mat4Multiply(a: Float32Array, b: Float32Array): Float32Array {
  const result = new Float32Array(16);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result[i * 4 + j] = a[j] * b[i * 4] + a[4 + j] * b[i * 4 + 1] +
                          a[8 + j] * b[i * 4 + 2] + a[12 + j] * b[i * 4 + 3];
    }
  }
  return result;
}

function projectToScreen(
  pos: [number, number, number],
  mvp: Float32Array,
  width: number,
  height: number
): { x: number; y: number; z: number; scale: number } {
  const x = pos[0], y = pos[1], z = pos[2];
  const w = mvp[3]*x + mvp[7]*y + mvp[11]*z + mvp[15];
  const clipX = (mvp[0]*x + mvp[4]*y + mvp[8]*z + mvp[12]) / w;
  const clipY = (mvp[1]*x + mvp[5]*y + mvp[9]*z + mvp[13]) / w;
  const clipZ = (mvp[2]*x + mvp[6]*y + mvp[10]*z + mvp[14]) / w;
  const screenX = (clipX * 0.5 + 0.5) * width;
  const screenY = (1 - (clipY * 0.5 + 0.5)) * height;
  const scale = 1 / w;
  return { x: screenX, y: screenY, z: clipZ, scale: Math.max(0.5, Math.min(1.5, scale * 8)) };
}

interface Label2D {
  id: string;
  label: string;
  icon: string;
  url: string;
  x: number;
  y: number;
  z: number;
  color: string;
  scale: number;
}

interface ConnectHub3DProps {
  width?: number;
  height?: number;
}

export default function ConnectHub3D({ width = 400, height = 300 }: ConnectHub3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const rotationRef = useRef(0);
  const hoveredRef = useRef<string | null>(null);
  const [labels, setLabels] = useState<Label2D[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: false, alpha: true, powerPreference: 'high-performance' });
    if (!gl) return;

    const dpr = Math.min(window.devicePixelRatio, 1.5);
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const nodeProgram = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    const lineProgram = createProgram(gl, lineVertexShader, lineFragmentShader);
    if (!nodeProgram || !lineProgram) return;

    // Position nodes in a triangle around center
    const radius = 1.8;
    connectNodes.forEach((node, i) => {
      const angle = (i / connectNodes.length) * Math.PI * 2 - Math.PI / 2;
      node.x = Math.cos(angle) * radius;
      node.y = Math.sin(angle) * radius * 0.6;
      node.z = 0;
    });

    // Create octahedron geometry for nodes
    function createOctahedronGeometry() {
      const positions: number[] = [];
      const normals: number[] = [];
      const indices: number[] = [];

      const vertices = [
        [0, 1, 0], [1, 0, 0], [0, 0, 1],
        [-1, 0, 0], [0, 0, -1], [0, -1, 0]
      ];

      const faces = [
        [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1],
        [5, 2, 1], [5, 3, 2], [5, 4, 3], [5, 1, 4]
      ];

      faces.forEach((face, faceIdx) => {
        const v0 = vertices[face[0]];
        const v1 = vertices[face[1]];
        const v2 = vertices[face[2]];

        const normal = normalize(cross(
          [v1[0]-v0[0], v1[1]-v0[1], v1[2]-v0[2]],
          [v2[0]-v0[0], v2[1]-v0[1], v2[2]-v0[2]]
        ));

        const baseIdx = faceIdx * 3;
        positions.push(...v0, ...v1, ...v2);
        normals.push(...normal, ...normal, ...normal);
        indices.push(baseIdx, baseIdx + 1, baseIdx + 2);
      });

      return { positions, normals, indices };
    }

    const octGeo = createOctahedronGeometry();

    // Connection lines to center
    const connectionPositions: number[] = [];
    const connectionColors: number[] = [];

    connectNodes.forEach(node => {
      const [r, g, b] = hexToRgb(node.color);
      connectionPositions.push(0, 0, 0, node.x, node.y, node.z);
      connectionColors.push(r * 0.3, g * 0.3, b * 0.3, r, g, b);
    });

    // Create buffers
    const createBuffer = (data: number[]) => {
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      return buf;
    };
    const createIndexBuffer = (data: number[]) => {
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
      return buf;
    };

    const linePosBuf = createBuffer(connectionPositions);
    const lineColBuf = createBuffer(connectionColors);
    const octPosBuf = createBuffer(octGeo.positions);
    const octNormBuf = createBuffer(octGeo.normals);
    const octIdxBuf = createIndexBuffer(octGeo.indices);

    const nodeUniforms = {
      uProjection: gl.getUniformLocation(nodeProgram, 'uProjection'),
      uView: gl.getUniformLocation(nodeProgram, 'uView'),
      uModel: gl.getUniformLocation(nodeProgram, 'uModel'),
      uTime: gl.getUniformLocation(nodeProgram, 'uTime'),
      uHover: gl.getUniformLocation(nodeProgram, 'uHover'),
    };
    const nodeAttribs = {
      aPosition: gl.getAttribLocation(nodeProgram, 'aPosition'),
      aNormal: gl.getAttribLocation(nodeProgram, 'aNormal'),
      aColor: gl.getAttribLocation(nodeProgram, 'aColor'),
    };
    const lineUniforms = {
      uProjection: gl.getUniformLocation(lineProgram, 'uProjection'),
      uView: gl.getUniformLocation(lineProgram, 'uView'),
      uModel: gl.getUniformLocation(lineProgram, 'uModel'),
      uTime: gl.getUniformLocation(lineProgram, 'uTime'),
    };
    const lineAttribs = {
      aPosition: gl.getAttribLocation(lineProgram, 'aPosition'),
      aColor: gl.getAttribLocation(lineProgram, 'aColor'),
    };

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const startTime = performance.now();
    let frameCount = 0;

    function render() {
      if (!gl || !canvas) return;

      const time = (performance.now() - startTime) / 1000;
      frameCount++;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      rotationRef.current += 0.003;
      const rotation = rotationRef.current;

      const aspect = width / height;
      const projection = mat4Perspective(Math.PI / 5, aspect, 0.1, 100);
      const eyeX = Math.sin(rotation) * 6;
      const eyeZ = Math.cos(rotation) * 6;
      const view = mat4LookAt([eyeX, 2, eyeZ], [0, 0, 0], [0, 1, 0]);
      const mvp = mat4Multiply(projection, view);

      // Draw connection lines
      gl.useProgram(lineProgram);
      gl.uniformMatrix4fv(lineUniforms.uProjection, false, projection);
      gl.uniformMatrix4fv(lineUniforms.uView, false, view);
      gl.uniformMatrix4fv(lineUniforms.uModel, false, mat4Identity());
      gl.uniform1f(lineUniforms.uTime, time);

      gl.bindBuffer(gl.ARRAY_BUFFER, linePosBuf);
      gl.vertexAttribPointer(lineAttribs.aPosition, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(lineAttribs.aPosition);
      gl.bindBuffer(gl.ARRAY_BUFFER, lineColBuf);
      gl.vertexAttribPointer(lineAttribs.aColor, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(lineAttribs.aColor);
      gl.drawArrays(gl.LINES, 0, connectionPositions.length / 3);

      // Draw octahedrons
      gl.useProgram(nodeProgram);
      gl.uniformMatrix4fv(nodeUniforms.uProjection, false, projection);
      gl.uniformMatrix4fv(nodeUniforms.uView, false, view);
      gl.uniform1f(nodeUniforms.uTime, time);

      gl.bindBuffer(gl.ARRAY_BUFFER, octPosBuf);
      gl.vertexAttribPointer(nodeAttribs.aPosition, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(nodeAttribs.aPosition);
      gl.bindBuffer(gl.ARRAY_BUFFER, octNormBuf);
      gl.vertexAttribPointer(nodeAttribs.aNormal, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(nodeAttribs.aNormal);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, octIdxBuf);

      connectNodes.forEach(node => {
        const [r, g, b] = hexToRgb(node.color);
        gl.vertexAttrib3f(nodeAttribs.aColor, r, g, b);

        const isHovered = hoveredRef.current === node.id ? 1.0 : 0.0;
        gl.uniform1f(nodeUniforms.uHover, isHovered);

        const model = mat4Identity();
        // Floating animation
        const floatY = Math.sin(time * 2 + connectNodes.indexOf(node)) * 0.1;
        model[12] = node.x;
        model[13] = node.y + floatY;
        model[14] = node.z;
        const scale = 0.35;
        model[0] = scale; model[5] = scale; model[10] = scale;

        gl.uniformMatrix4fv(nodeUniforms.uModel, false, model);
        gl.drawElements(gl.TRIANGLES, octGeo.indices.length, gl.UNSIGNED_SHORT, 0);
      });

      // Update labels
      const canvasRect = canvas.getBoundingClientRect();
      const displayWidth = canvasRect.width;
      const displayHeight = canvasRect.height;

      if (frameCount % 2 === 0) {
        const newLabels: Label2D[] = [];
        connectNodes.forEach((node, idx) => {
          const floatY = Math.sin(time * 2 + idx) * 0.1;
          const screen = projectToScreen([node.x, node.y + floatY + 0.5, node.z], mvp, displayWidth, displayHeight);
          if (screen.z > -1 && screen.z < 1) {
            newLabels.push({
              id: node.id,
              label: node.label,
              icon: node.icon,
              url: node.url,
              x: screen.x,
              y: screen.y,
              z: screen.z,
              color: node.color,
              scale: screen.scale,
            });
          }
        });
        newLabels.sort((a, b) => b.z - a.z);
        setLabels(newLabels);
      }

      animationRef.current = requestAnimationFrame(render);
    }

    animationRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationRef.current);
  }, [width, height]);

  const handleMouseEnter = (id: string) => {
    hoveredRef.current = id;
    setHoveredNode(id);
  };

  const handleMouseLeave = () => {
    hoveredRef.current = null;
    setHoveredNode(null);
  };

  return (
    <div className="connect-hub-container">
      <div className="connect-hub-header">
        <span className="connect-hub-title">CONNECT</span>
        <span className="connect-hub-subtitle">ESTABLISH LINK</span>
      </div>

      <div className="connect-hub-display" ref={containerRef}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', pointerEvents: 'none' }} />

        {labels.map(label => (
          <a
            key={label.id}
            href={label.url}
            target={label.id !== 'email' ? '_blank' : undefined}
            rel="noopener noreferrer"
            className={`connect-label ${hoveredNode === label.id ? 'hovered' : ''}`}
            style={{
              position: 'absolute',
              left: `${label.x}px`,
              top: `${label.y}px`,
              transform: `translate(-50%, -50%) scale(${label.scale})`,
              opacity: Math.max(0.6, 1 - label.z * 0.3),
              zIndex: Math.round(100 - label.z * 40),
              '--label-color': label.color,
            } as React.CSSProperties}
            onMouseEnter={() => handleMouseEnter(label.id)}
            onMouseLeave={handleMouseLeave}
          >
            <span className="connect-icon">{label.icon}</span>
            <span className="connect-text">{label.label}</span>
          </a>
        ))}

        <div className="connect-hub-overlay">
          <div className="scanlines" />
        </div>
      </div>

      <div className="connect-hub-hint">
        <span className="blink">[</span> CLICK TO CONNECT <span className="blink">]</span>
      </div>
    </div>
  );
}

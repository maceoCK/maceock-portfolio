import { useEffect, useRef, useState } from 'react';

interface ProjectNode {
  id: string;
  name: string;
  technologies: string[];
  color: string;
  x: number;
  y: number;
  z: number;
}

interface TechNode {
  id: string;
  name: string;
  projects: string[];
  x: number;
  y: number;
  z: number;
}

interface Label2D {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number; // for depth sorting
  color: string;
  type: 'project' | 'tech';
  scale: number;
}

const projects: ProjectNode[] = [
  { id: 'pravost', name: 'PRAVOST', technologies: ['Python', 'FastAPI', 'PostgreSQL', 'ML'], color: '#00ff41', x: 0, y: 0, z: 0 },
  { id: 'datost', name: 'DATOST', technologies: ['Tauri', 'Rust', 'React', 'TypeScript'], color: '#ff6600', x: 0, y: 0, z: 0 },
  { id: 'directdrive', name: 'DIRECTDRIVE', technologies: ['Python', 'Flask', 'Flutter', 'AWS', 'Docker'], color: '#00ffff', x: 0, y: 0, z: 0 },
  { id: 'prosperity', name: 'PROSPERITY', technologies: ['Python', 'NumPy'], color: '#9933ff', x: 0, y: 0, z: 0 },
  { id: 'boycott', name: 'BOYCOTT', technologies: ['Python', 'React'], color: '#ffcc00', x: 0, y: 0, z: 0 },
  { id: 'conway', name: 'CONWAY', technologies: ['TypeScript', 'React', 'Canvas'], color: '#00ff41', x: 0, y: 0, z: 0 },
];

function buildTechNodes(): TechNode[] {
  const techMap = new Map<string, string[]>();
  projects.forEach(project => {
    project.technologies.forEach(tech => {
      if (!techMap.has(tech)) techMap.set(tech, []);
      techMap.get(tech)!.push(project.id);
    });
  });
  const techNodes: TechNode[] = [];
  techMap.forEach((projectIds, techName) => {
    techNodes.push({
      id: techName.toLowerCase().replace(/\s+/g, '-'),
      name: techName.toUpperCase(),
      projects: projectIds,
      x: 0, y: 0, z: 0,
    });
  });
  return techNodes;
}

const technologies = buildTechNodes();

const vertexShaderSource = `
  precision mediump float;
  attribute vec3 aPosition;
  attribute vec3 aNormal;
  attribute vec3 aColor;
  attribute float aNodeType;

  uniform mat4 uProjection;
  uniform mat4 uView;
  uniform mat4 uModel;
  uniform float uTime;

  varying vec3 vColor;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vNodeType;
  varying float vDepth;

  void main() {
    vec3 pos = aPosition;
    float wave = sin(uTime * 2.0 + pos.x * 0.5 + pos.y * 0.3) * 0.05;
    pos.y += wave;

    vec4 worldPos = uModel * vec4(pos, 1.0);
    vec4 viewPos = uView * worldPos;
    gl_Position = uProjection * viewPos;

    vColor = aColor;
    vNormal = mat3(uModel) * aNormal;
    vPosition = worldPos.xyz;
    vNodeType = aNodeType;
    vDepth = -viewPos.z;
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  varying vec3 vColor;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vNodeType;
  varying float vDepth;

  uniform float uTime;
  uniform vec2 uResolution;

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

    float fogFactor = clamp((vDepth - 5.0) / 15.0, 0.0, 0.6);
    color = mix(color, vec3(0.02), fogFactor);

    float glow = vNodeType > 0.5 ? 0.3 + 0.1 * sin(uTime * 3.0) : 0.2;
    color += vColor * glow;

    float scanline = sin(gl_FragCoord.y * 2.0) * 0.5 + 0.5;
    color *= mix(1.0, scanline, 0.1);

    gl_FragColor = vec4(color, 1.0);
  }
`;

const lineVertexShader = `
  precision mediump float;
  attribute vec3 aPosition;
  attribute vec3 aColor;
  attribute float aAlpha;

  uniform mat4 uProjection;
  uniform mat4 uView;
  uniform mat4 uModel;
  uniform float uTime;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vDepth;

  void main() {
    vec4 worldPos = uModel * vec4(aPosition, 1.0);
    vec4 viewPos = uView * worldPos;
    gl_Position = uProjection * viewPos;
    vColor = aColor;
    vAlpha = aAlpha;
    vDepth = -viewPos.z;
  }
`;

const lineFragmentShader = `
  precision mediump float;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vDepth;
  uniform float uTime;

  void main() {
    float pulse = sin(uTime * 4.0 - vDepth * 0.5) * 0.3 + 0.7;
    vec3 color = vColor * pulse;
    float depthFade = clamp(1.0 - (vDepth - 5.0) / 15.0, 0.3, 1.0);
    gl_FragColor = vec4(color, vAlpha * depthFade);
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

function mat4RotateY(m: Float32Array, angle: number): Float32Array {
  const c = Math.cos(angle), s = Math.sin(angle);
  const result = new Float32Array(16);
  result[0] = m[0]*c + m[8]*s; result[1] = m[1]*c + m[9]*s;
  result[2] = m[2]*c + m[10]*s; result[3] = m[3]*c + m[11]*s;
  result[4] = m[4]; result[5] = m[5]; result[6] = m[6]; result[7] = m[7];
  result[8] = m[8]*c - m[0]*s; result[9] = m[9]*c - m[1]*s;
  result[10] = m[10]*c - m[2]*s; result[11] = m[11]*c - m[3]*s;
  result[12] = m[12]; result[13] = m[13]; result[14] = m[14]; result[15] = m[15];
  return result;
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

function normalize(v: number[]): number[] {
  const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
  return [v[0]/len, v[1]/len, v[2]/len];
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

function projectToScreen(
  pos: [number, number, number],
  mvp: Float32Array,
  width: number,
  height: number
): { x: number; y: number; z: number; scale: number } {
  // Transform position by MVP matrix
  const x = pos[0], y = pos[1], z = pos[2];
  const w = mvp[3]*x + mvp[7]*y + mvp[11]*z + mvp[15];
  const clipX = (mvp[0]*x + mvp[4]*y + mvp[8]*z + mvp[12]) / w;
  const clipY = (mvp[1]*x + mvp[5]*y + mvp[9]*z + mvp[13]) / w;
  const clipZ = (mvp[2]*x + mvp[6]*y + mvp[10]*z + mvp[14]) / w;

  // Convert to screen coordinates
  const screenX = (clipX * 0.5 + 0.5) * width;
  const screenY = (1 - (clipY * 0.5 + 0.5)) * height;
  const scale = 1 / w; // For size scaling based on distance

  return { x: screenX, y: screenY, z: clipZ, scale: Math.max(0.3, Math.min(1.5, scale * 10)) };
}

interface TechGraph3DProps {
  width?: number;
  height?: number;
}

export default function TechGraph3D({ width = 800, height = 500 }: TechGraph3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const rotationRef = useRef(0);
  const [labels, setLabels] = useState<Label2D[]>([]);
  const [_displaySize, setDisplaySize] = useState({ width, height });

  // Track actual displayed size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          setDisplaySize({ width: w, height: h });
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
    if (!gl) return;

    const dpr = Math.min(window.devicePixelRatio, 1.5);
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const nodeProgram = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    const lineProgram = createProgram(gl, lineVertexShader, lineFragmentShader);
    if (!nodeProgram || !lineProgram) return;

    // Position nodes
    const projectRadius = 4;
    const techRadius = 2;
    projects.forEach((project, i) => {
      const angle = (i / projects.length) * Math.PI * 2;
      project.x = Math.cos(angle) * projectRadius;
      project.y = (Math.random() - 0.5) * 1.5;
      project.z = Math.sin(angle) * projectRadius;
    });
    technologies.forEach((tech, i) => {
      const angle = (i / technologies.length) * Math.PI * 2 + 0.3;
      tech.x = Math.cos(angle) * techRadius;
      tech.y = (Math.random() - 0.5) * 1;
      tech.z = Math.sin(angle) * techRadius;
    });

    // Geometry helpers
    function createSphereGeometry(segments = 6) {
      const positions: number[] = [], normals: number[] = [], indices: number[] = [];
      for (let lat = 0; lat <= segments; lat++) {
        const theta = (lat * Math.PI) / segments;
        const sinTheta = Math.sin(theta), cosTheta = Math.cos(theta);
        for (let lon = 0; lon <= segments; lon++) {
          const phi = (lon * 2 * Math.PI) / segments;
          const x = Math.cos(phi) * sinTheta, y = cosTheta, z = Math.sin(phi) * sinTheta;
          positions.push(x, y, z); normals.push(x, y, z);
        }
      }
      for (let lat = 0; lat < segments; lat++) {
        for (let lon = 0; lon < segments; lon++) {
          const first = lat * (segments + 1) + lon, second = first + segments + 1;
          indices.push(first, second, first + 1, second, second + 1, first + 1);
        }
      }
      return { positions, normals, indices };
    }

    function createHexagonGeometry() {
      const positions: number[] = [], normals: number[] = [], indices: number[] = [];
      const sides = 6, h = 0.3;
      positions.push(0, h/2, 0); normals.push(0, 1, 0);
      positions.push(0, -h/2, 0); normals.push(0, -1, 0);
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        const x = Math.cos(angle), z = Math.sin(angle);
        positions.push(x, h/2, z); normals.push(0, 1, 0);
        positions.push(x, -h/2, z); normals.push(0, -1, 0);
      }
      for (let i = 0; i < sides; i++) {
        const next = (i + 1) % sides;
        indices.push(0, 2 + i*2, 2 + next*2);
        indices.push(1, 3 + next*2, 3 + i*2);
      }
      for (let i = 0; i < sides; i++) {
        const next = (i + 1) % sides;
        const angle = ((i + 0.5) / sides) * Math.PI * 2;
        const nx = Math.cos(angle), nz = Math.sin(angle);
        const sideBase = positions.length / 3;
        const tl = 2+i*2, tr = 2+next*2, bl = 3+i*2, br = 3+next*2;
        positions.push(positions[tl*3], positions[tl*3+1], positions[tl*3+2]); normals.push(nx, 0, nz);
        positions.push(positions[tr*3], positions[tr*3+1], positions[tr*3+2]); normals.push(nx, 0, nz);
        positions.push(positions[bl*3], positions[bl*3+1], positions[bl*3+2]); normals.push(nx, 0, nz);
        positions.push(positions[br*3], positions[br*3+1], positions[br*3+2]); normals.push(nx, 0, nz);
        indices.push(sideBase, sideBase+1, sideBase+2, sideBase+1, sideBase+3, sideBase+2);
      }
      return { positions, normals, indices };
    }

    const sphereGeo = createSphereGeometry(6);
    const hexGeo = createHexagonGeometry();

    // Build connections
    const connectionPositions: number[] = [], connectionColors: number[] = [], connectionAlphas: number[] = [];
    projects.forEach(project => {
      const [pr, pg, pb] = hexToRgb(project.color);
      project.technologies.forEach(techName => {
        const tech = technologies.find(t => t.name === techName.toUpperCase());
        if (tech) {
          connectionPositions.push(project.x, project.y, project.z, tech.x, tech.y, tech.z);
          connectionColors.push(pr, pg, pb, pr*0.5, pg*0.5, pb*0.5);
          const alpha = tech.projects.length > 1 ? 0.8 : 0.4;
          connectionAlphas.push(alpha, alpha);
        }
      });
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
    const lineAlphaBuf = createBuffer(connectionAlphas);
    const spherePosBuf = createBuffer(sphereGeo.positions);
    const sphereNormBuf = createBuffer(sphereGeo.normals);
    const sphereIdxBuf = createIndexBuffer(sphereGeo.indices);
    const hexPosBuf = createBuffer(hexGeo.positions);
    const hexNormBuf = createBuffer(hexGeo.normals);
    const hexIdxBuf = createIndexBuffer(hexGeo.indices);

    const nodeUniforms = {
      uProjection: gl.getUniformLocation(nodeProgram, 'uProjection'),
      uView: gl.getUniformLocation(nodeProgram, 'uView'),
      uModel: gl.getUniformLocation(nodeProgram, 'uModel'),
      uTime: gl.getUniformLocation(nodeProgram, 'uTime'),
      uResolution: gl.getUniformLocation(nodeProgram, 'uResolution'),
    };
    const nodeAttribs = {
      aPosition: gl.getAttribLocation(nodeProgram, 'aPosition'),
      aNormal: gl.getAttribLocation(nodeProgram, 'aNormal'),
      aColor: gl.getAttribLocation(nodeProgram, 'aColor'),
      aNodeType: gl.getAttribLocation(nodeProgram, 'aNodeType'),
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
      aAlpha: gl.getAttribLocation(lineProgram, 'aAlpha'),
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
      gl.clearColor(0.02, 0.02, 0.02, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      rotationRef.current += 0.004;
      const rotation = rotationRef.current;

      const aspect = width / height;
      const projection = mat4Perspective(Math.PI / 4, aspect, 0.1, 100);
      const eyeX = Math.sin(rotation) * 10;
      const eyeZ = Math.cos(rotation) * 10;
      const view = mat4LookAt([eyeX, 5, eyeZ], [0, 0, 0], [0, 1, 0]);
      const mvp = mat4Multiply(projection, view);

      // Draw lines
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
      gl.bindBuffer(gl.ARRAY_BUFFER, lineAlphaBuf);
      gl.vertexAttribPointer(lineAttribs.aAlpha, 1, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(lineAttribs.aAlpha);
      gl.drawArrays(gl.LINES, 0, connectionPositions.length / 3);

      // Draw nodes
      gl.useProgram(nodeProgram);
      gl.uniformMatrix4fv(nodeUniforms.uProjection, false, projection);
      gl.uniformMatrix4fv(nodeUniforms.uView, false, view);
      gl.uniform1f(nodeUniforms.uTime, time);
      gl.uniform2f(nodeUniforms.uResolution, canvas.width, canvas.height);

      // Draw hexagons (projects)
      gl.bindBuffer(gl.ARRAY_BUFFER, hexPosBuf);
      gl.vertexAttribPointer(nodeAttribs.aPosition, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(nodeAttribs.aPosition);
      gl.bindBuffer(gl.ARRAY_BUFFER, hexNormBuf);
      gl.vertexAttribPointer(nodeAttribs.aNormal, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(nodeAttribs.aNormal);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, hexIdxBuf);

      projects.forEach(project => {
        const [r, g, b] = hexToRgb(project.color);
        gl.vertexAttrib3f(nodeAttribs.aColor, r, g, b);
        gl.vertexAttrib1f(nodeAttribs.aNodeType, 1.0);
        const model = mat4Identity();
        model[12] = project.x; model[13] = project.y; model[14] = project.z;
        model[0] = 0.5; model[5] = 0.5; model[10] = 0.5;
        const rotatedModel = mat4RotateY(model, -rotation + Math.PI/6);
        gl.uniformMatrix4fv(nodeUniforms.uModel, false, rotatedModel);
        gl.drawElements(gl.TRIANGLES, hexGeo.indices.length, gl.UNSIGNED_SHORT, 0);
      });

      // Draw spheres (technologies)
      gl.bindBuffer(gl.ARRAY_BUFFER, spherePosBuf);
      gl.vertexAttribPointer(nodeAttribs.aPosition, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(nodeAttribs.aPosition);
      gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormBuf);
      gl.vertexAttribPointer(nodeAttribs.aNormal, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(nodeAttribs.aNormal);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIdxBuf);

      technologies.forEach(tech => {
        const sharedCount = tech.projects.length;
        const color = sharedCount >= 4 ? hexToRgb('#00ff41') : sharedCount >= 2 ? hexToRgb('#ff6600') : hexToRgb('#00ffff');
        gl.vertexAttrib3f(nodeAttribs.aColor, color[0], color[1], color[2]);
        gl.vertexAttrib1f(nodeAttribs.aNodeType, 0.0);
        const model = mat4Identity();
        model[12] = tech.x; model[13] = tech.y; model[14] = tech.z;
        const scale = 0.15 + sharedCount * 0.05;
        model[0] = scale; model[5] = scale; model[10] = scale;
        gl.uniformMatrix4fv(nodeUniforms.uModel, false, model);
        gl.drawElements(gl.TRIANGLES, sphereGeo.indices.length, gl.UNSIGNED_SHORT, 0);
      });

      // Update labels every 2 frames for performance
      // Use actual canvas display size for accurate label positioning
      const canvasRect = canvas.getBoundingClientRect();
      const displayWidth = canvasRect.width;
      const displayHeight = canvasRect.height;

      if (frameCount % 2 === 0) {
        const newLabels: Label2D[] = [];

        projects.forEach(project => {
          // Position label directly at node center, slightly above
          const screen = projectToScreen([project.x, project.y + 0.35, project.z], mvp, displayWidth, displayHeight);
          if (screen.z > -1 && screen.z < 1) {
            newLabels.push({
              id: project.id,
              name: project.name,
              x: screen.x,
              y: screen.y,
              z: screen.z,
              color: project.color,
              type: 'project',
              scale: screen.scale,
            });
          }
        });

        technologies.forEach(tech => {
          // Position label directly at node center
          const screen = projectToScreen([tech.x, tech.y + 0.15, tech.z], mvp, displayWidth, displayHeight);
          if (screen.z > -1 && screen.z < 1) {
            const sharedCount = tech.projects.length;
            const color = sharedCount >= 4 ? '#00ff41' : sharedCount >= 2 ? '#ff6600' : '#00ffff';
            newLabels.push({
              id: tech.id,
              name: tech.name,
              x: screen.x,
              y: screen.y,
              z: screen.z,
              color,
              type: 'tech',
              scale: screen.scale,
            });
          }
        });

        // Sort by z for proper layering
        newLabels.sort((a, b) => b.z - a.z);
        setLabels(newLabels);
      }

      animationRef.current = requestAnimationFrame(render);
    }

    animationRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationRef.current);
  }, [width, height]);

  const sharedTechs = technologies.filter(t => t.projects.length >= 2);
  const highlyShared = technologies.filter(t => t.projects.length >= 4);

  return (
    <div className="tech-graph-container">
      <div className="tech-graph-header">
        <span className="tech-graph-title">TECHNOLOGY NETWORK</span>
        <span className="tech-graph-subtitle">PROJECT / TECH RELATIONSHIPS</span>
      </div>

      <div className="tech-graph-display" ref={containerRef}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />

        {/* Floating 3D Labels */}
        <div className="tech-graph-labels">
          {labels.map(label => (
            <div
              key={label.id}
              className={`floating-label ${label.type}`}
              style={{
                left: `${label.x}px`,
                top: `${label.y}px`,
                transform: `translate(-50%, -50%) scale(${label.scale})`,
                opacity: Math.max(0.4, 1 - label.z * 0.5),
                zIndex: Math.floor((1 - label.z) * 100),
                '--label-color': label.color,
              } as React.CSSProperties}
            >
              <span className="label-text">{label.name}</span>
            </div>
          ))}
        </div>

        <div className="tech-graph-overlay">
          <div className="scanlines" />
        </div>
      </div>

      <div className="tech-graph-legend">
        <div className="legend-section">
          <span className="legend-title">NODES</span>
          <div className="legend-item"><span className="legend-hex" /> PROJECTS</div>
          <div className="legend-item"><span className="legend-sphere green" /> SHARED 4+</div>
          <div className="legend-item"><span className="legend-sphere orange" /> SHARED 2-3</div>
          <div className="legend-item"><span className="legend-sphere cyan" /> UNIQUE</div>
        </div>
        <div className="legend-section">
          <span className="legend-title">CORE TECHNOLOGIES</span>
          {highlyShared.map(tech => (
            <div key={tech.id} className="legend-tech">
              <span className="tech-name">{tech.name}</span>
              <span className="tech-count">{tech.projects.length} PROJECTS</span>
            </div>
          ))}
        </div>
        <div className="legend-section">
          <span className="legend-title">SHARED TECHNOLOGIES</span>
          {sharedTechs.filter(t => t.projects.length < 4).map(tech => (
            <div key={tech.id} className="legend-tech">
              <span className="tech-name">{tech.name}</span>
              <span className="tech-count">{tech.projects.length} PROJECTS</span>
            </div>
          ))}
        </div>
      </div>

      <div className="tech-graph-stats">
        <div className="stat-item"><span className="stat-value">{projects.length}</span><span className="stat-label">PROJECTS</span></div>
        <div className="stat-item"><span className="stat-value">{technologies.length}</span><span className="stat-label">TECHNOLOGIES</span></div>
        <div className="stat-item"><span className="stat-value">{sharedTechs.length}</span><span className="stat-label">SHARED TECHS</span></div>
        <div className="stat-item"><span className="stat-value">{Math.round((sharedTechs.length / technologies.length) * 100)}%</span><span className="stat-label">REUSE RATE</span></div>
      </div>
    </div>
  );
}

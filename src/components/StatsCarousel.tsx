import { useEffect, useRef } from 'react';

// Single long string that loops
const marqueeText = "2+ YEARS EXPERIENCE  ◆  4.0 GPA  ◆  TOP 0.1% IMC PROSPERITY  ◆  LET'S CONNECT  ◆  REACH OUT ANYTIME  ◆  ";

// Simple 5x7 pixel font for LED effect
const pixelFont: Record<string, number[]> = {
  'A': [0x7C,0x12,0x11,0x12,0x7C],
  'B': [0x7F,0x49,0x49,0x49,0x36],
  'C': [0x3E,0x41,0x41,0x41,0x22],
  'D': [0x7F,0x41,0x41,0x22,0x1C],
  'E': [0x7F,0x49,0x49,0x49,0x41],
  'F': [0x7F,0x09,0x09,0x09,0x01],
  'G': [0x3E,0x41,0x49,0x49,0x7A],
  'H': [0x7F,0x08,0x08,0x08,0x7F],
  'I': [0x00,0x41,0x7F,0x41,0x00],
  'J': [0x20,0x40,0x41,0x3F,0x01],
  'K': [0x7F,0x08,0x14,0x22,0x41],
  'L': [0x7F,0x40,0x40,0x40,0x40],
  'M': [0x7F,0x02,0x0C,0x02,0x7F],
  'N': [0x7F,0x04,0x08,0x10,0x7F],
  'O': [0x3E,0x41,0x41,0x41,0x3E],
  'P': [0x7F,0x09,0x09,0x09,0x06],
  'Q': [0x3E,0x41,0x51,0x21,0x5E],
  'R': [0x7F,0x09,0x19,0x29,0x46],
  'S': [0x46,0x49,0x49,0x49,0x31],
  'T': [0x01,0x01,0x7F,0x01,0x01],
  'U': [0x3F,0x40,0x40,0x40,0x3F],
  'V': [0x1F,0x20,0x40,0x20,0x1F],
  'W': [0x3F,0x40,0x38,0x40,0x3F],
  'X': [0x63,0x14,0x08,0x14,0x63],
  'Y': [0x07,0x08,0x70,0x08,0x07],
  'Z': [0x61,0x51,0x49,0x45,0x43],
  '0': [0x3E,0x51,0x49,0x45,0x3E],
  '1': [0x00,0x42,0x7F,0x40,0x00],
  '2': [0x42,0x61,0x51,0x49,0x46],
  '3': [0x21,0x41,0x45,0x4B,0x31],
  '4': [0x18,0x14,0x12,0x7F,0x10],
  '5': [0x27,0x45,0x45,0x45,0x39],
  '6': [0x3C,0x4A,0x49,0x49,0x30],
  '7': [0x01,0x71,0x09,0x05,0x03],
  '8': [0x36,0x49,0x49,0x49,0x36],
  '9': [0x06,0x49,0x49,0x29,0x1E],
  ' ': [0x00,0x00,0x00,0x00,0x00],
  '.': [0x00,0x60,0x60,0x00,0x00],
  '+': [0x08,0x08,0x3E,0x08,0x08],
  '%': [0x23,0x13,0x08,0x64,0x62],
  '\'': [0x00,0x05,0x03,0x00,0x00],
  '◆': [0x08,0x1C,0x3E,0x1C,0x08],
};

const CHAR_HEIGHT = 7;
const PIXEL_SIZE = 3;
const DISPLAY_COLS = 180;

export default function StatsCarousel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const offsetRef = useRef(0);
  const glitchRef = useRef({ active: false, offset: 0, timer: 0 });

  // Convert text to pixel columns
  const getTextPixels = (text: string): boolean[][] => {
    const columns: boolean[][] = [];

    for (const char of text.toUpperCase()) {
      const charData = pixelFont[char] || pixelFont[' '];
      for (let col = 0; col < 5; col++) {
        const column: boolean[] = [];
        for (let row = 0; row < CHAR_HEIGHT; row++) {
          column.push((charData[col] & (1 << row)) !== 0);
        }
        columns.push(column);
      }
      columns.push(Array(CHAR_HEIGHT).fill(false));
    }

    return columns;
  };

  const textPixels = getTextPixels(marqueeText);
  const totalCols = textPixels.length;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = DISPLAY_COLS * PIXEL_SIZE;
    const height = CHAR_HEIGHT * PIXEL_SIZE;
    canvas.width = width;
    canvas.height = height;

    let lastTime = performance.now();
    // Horizontal tear effect state
    const tearRef = { active: false, row: 0, offset: 0, timer: 0 };

    function render(currentTime: number) {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Smoother, faster scroll
      offsetRef.current += delta * 25;

      if (offsetRef.current >= totalCols) {
        offsetRef.current -= totalCols;
      }

      // Random glitch/stutter (less frequent)
      glitchRef.current.timer -= delta;
      if (glitchRef.current.timer <= 0) {
        if (Math.random() < 0.02) {
          glitchRef.current.active = true;
          glitchRef.current.offset = Math.floor(Math.random() * 3) - 1;
          glitchRef.current.timer = 0.03 + Math.random() * 0.06;
        } else {
          glitchRef.current.active = false;
          glitchRef.current.timer = 0.2 + Math.random() * 0.4;
        }
      }

      // Horizontal tear effect
      tearRef.timer -= delta;
      if (tearRef.timer <= 0) {
        if (Math.random() < 0.04) {
          tearRef.active = true;
          tearRef.row = Math.floor(Math.random() * CHAR_HEIGHT);
          tearRef.offset = (Math.random() - 0.5) * 8; // Tear offset in pixels
          tearRef.timer = 0.02 + Math.random() * 0.05;
        } else {
          tearRef.active = false;
          tearRef.timer = 0.1 + Math.random() * 0.3;
        }
      }

      ctx!.fillStyle = '#050505';
      ctx!.fillRect(0, 0, width, height);

      // Draw each pixel column
      for (let displayCol = 0; displayCol < DISPLAY_COLS; displayCol++) {
        // Get the source column from scrolling text
        let sourceCol = Math.floor(offsetRef.current + displayCol) % totalCols;

        // Apply glitch offset to random columns
        if (glitchRef.current.active && Math.random() < 0.08) {
          sourceCol = (sourceCol + glitchRef.current.offset + totalCols) % totalCols;
        }

        const columnData = textPixels[sourceCol];

        for (let row = 0; row < CHAR_HEIGHT; row++) {
          let isLit = columnData[row];

          // Random pixel flicker glitch
          if (glitchRef.current.active && Math.random() < 0.015) {
            isLit = !isLit;
          }

          let x = displayCol * PIXEL_SIZE;
          const y = row * PIXEL_SIZE;

          // Apply horizontal tear to specific row
          if (tearRef.active && row === tearRef.row) {
            x += tearRef.offset;
          }

          if (isLit) {
            // Lit pixel - bright green
            ctx!.fillStyle = '#00ff41';
            ctx!.shadowColor = 'rgba(0, 255, 65, 0.6)';
            ctx!.shadowBlur = 3;
          } else {
            // Unlit pixel - very dim
            ctx!.fillStyle = '#0a1a0a';
            ctx!.shadowBlur = 0;
          }

          // Draw pixel with small gap
          ctx!.fillRect(x + 0.5, y + 0.5, PIXEL_SIZE - 1, PIXEL_SIZE - 1);
        }
      }

      ctx!.shadowBlur = 0;

      animationRef.current = requestAnimationFrame(render);
    }

    animationRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationRef.current);
  }, [textPixels, totalCols]);

  return (
    <div className="pixel-marquee-container">
      <canvas
        ref={canvasRef}
        className="pixel-marquee-canvas"
      />
    </div>
  );
}

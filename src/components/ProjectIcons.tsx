// Bold Helvetica-style SVG icons for projects

export function MapIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Globe with crossing paths - representing transatlantic movements */}
      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="6" />
      <ellipse cx="50" cy="50" rx="40" ry="16" stroke="currentColor" strokeWidth="4" />
      <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="4" />
      {/* Movement paths */}
      <path
        d="M20 35 Q50 20 80 45"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M15 60 Q45 75 85 55"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      {/* Dots representing locations */}
      <circle cx="20" cy="35" r="6" fill="currentColor" />
      <circle cx="80" cy="45" r="6" fill="currentColor" />
      <circle cx="15" cy="60" r="6" fill="currentColor" />
      <circle cx="85" cy="55" r="6" fill="currentColor" />
    </svg>
  );
}

export function CellularIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Cellular automata grid pattern */}
      <rect x="10" y="10" width="18" height="18" fill="currentColor" />
      <rect x="32" y="10" width="18" height="18" fill="currentColor" opacity="0.3" />
      <rect x="54" y="10" width="18" height="18" fill="currentColor" />
      <rect x="76" y="10" width="14" height="18" fill="currentColor" opacity="0.3" />

      <rect x="10" y="32" width="18" height="18" fill="currentColor" opacity="0.3" />
      <rect x="32" y="32" width="18" height="18" fill="currentColor" />
      <rect x="54" y="32" width="18" height="18" fill="currentColor" />
      <rect x="76" y="32" width="14" height="18" fill="currentColor" />

      <rect x="10" y="54" width="18" height="18" fill="currentColor" />
      <rect x="32" y="54" width="18" height="18" fill="currentColor" />
      <rect x="54" y="54" width="18" height="18" fill="currentColor" opacity="0.3" />
      <rect x="76" y="54" width="14" height="18" fill="currentColor" />

      <rect x="10" y="76" width="18" height="14" fill="currentColor" opacity="0.3" />
      <rect x="32" y="76" width="18" height="14" fill="currentColor" />
      <rect x="54" y="76" width="18" height="14" fill="currentColor" />
      <rect x="76" y="76" width="14" height="14" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export function GridIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Grid for artists */}
      <rect x="10" y="10" width="80" height="80" stroke="currentColor" strokeWidth="4" fill="none" />
      {/* Grid lines */}
      <line x1="36.67" y1="10" x2="36.67" y2="90" stroke="currentColor" strokeWidth="3" />
      <line x1="63.33" y1="10" x2="63.33" y2="90" stroke="currentColor" strokeWidth="3" />
      <line x1="10" y1="36.67" x2="90" y2="36.67" stroke="currentColor" strokeWidth="3" />
      <line x1="10" y1="63.33" x2="90" y2="63.33" stroke="currentColor" strokeWidth="3" />
      {/* Focus indicator on one cell */}
      <rect x="36.67" y="36.67" width="26.66" height="26.66" stroke="currentColor" strokeWidth="6" fill="none" />
      {/* Corner marks showing zoom */}
      <path d="M30 30 L20 30 L20 20 L30 20" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="square" />
      <path d="M70 30 L80 30 L80 20 L70 20" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="square" />
      <path d="M30 70 L20 70 L20 80 L30 80" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="square" />
      <path d="M70 70 L80 70 L80 80 L70 80" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="square" />
    </svg>
  );
}

export function GliderIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Conway's Game of Life Glider pattern - the iconic shape */}
      {/* Grid background suggestion */}
      <rect x="10" y="10" width="80" height="80" stroke="currentColor" strokeWidth="2" opacity="0.2" fill="none" />

      {/* Glider cells - scaled up and bold */}
      {/*   X
           X
         X X X  */}
      <rect x="50" y="20" width="20" height="20" fill="currentColor" />
      <rect x="70" y="40" width="20" height="20" fill="currentColor" />
      <rect x="30" y="60" width="20" height="20" fill="currentColor" />
      <rect x="50" y="60" width="20" height="20" fill="currentColor" />
      <rect x="70" y="60" width="20" height="20" fill="currentColor" />

      {/* Motion trail suggestion */}
      <rect x="30" y="20" width="16" height="16" fill="currentColor" opacity="0.15" />
      <rect x="50" y="40" width="16" height="16" fill="currentColor" opacity="0.15" />
    </svg>
  );
}

export function StackIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Stacked layers representing full-stack / bulk operations */}
      <rect x="15" y="65" width="70" height="20" fill="currentColor" />
      <rect x="15" y="40" width="70" height="20" fill="currentColor" opacity="0.7" />
      <rect x="15" y="15" width="70" height="20" fill="currentColor" opacity="0.4" />

      {/* Connection lines suggesting data flow */}
      <line x1="50" y1="35" x2="50" y2="40" stroke="currentColor" strokeWidth="4" />
      <line x1="50" y1="60" x2="50" y2="65" stroke="currentColor" strokeWidth="4" />

      {/* Arrow suggesting movement/transfer */}
      <path d="M75 50 L88 50 L88 42 L98 52 L88 62 L88 54 L75 54 Z" fill="currentColor" />
    </svg>
  );
}

export function ShipIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shipping/logistics - truck/container style */}
      {/* Container body */}
      <rect x="10" y="30" width="55" height="40" fill="currentColor" />
      {/* Cab */}
      <rect x="65" y="45" width="25" height="25" fill="currentColor" />
      {/* Window */}
      <rect x="72" y="50" width="12" height="10" fill="white" opacity="0.3" />
      {/* Wheels */}
      <circle cx="30" cy="75" r="10" fill="currentColor" />
      <circle cx="30" cy="75" r="5" fill="white" opacity="0.3" />
      <circle cx="78" cy="75" r="10" fill="currentColor" />
      <circle cx="78" cy="75" r="5" fill="white" opacity="0.3" />
      {/* Container lines */}
      <line x1="25" y1="35" x2="25" y2="65" stroke="white" strokeWidth="3" opacity="0.3" />
      <line x1="45" y1="35" x2="45" y2="65" stroke="white" strokeWidth="3" opacity="0.3" />
    </svg>
  );
}

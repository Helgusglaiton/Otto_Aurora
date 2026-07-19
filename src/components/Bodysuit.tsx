export default function Bodysuit({ color, name, isLeft }: { color: string, name: string, isLeft?: boolean }) {
  const rotation = isLeft ? 'rotate(-6deg)' : 'rotate(6deg)';
  const idPrefix = name.toLowerCase();
  
  return (
    <div style={{ position: 'relative', width: '160px', transform: rotation, filter: 'drop-shadow(0px 8px 12px rgba(0,0,0,0.15))', zIndex: 2 }}>
      <svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id={`texture-${idPrefix}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.15 0" in="noise" result="coloredNoise" />
            <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="composite" />
            <feBlend mode="multiply" in="composite" in2="SourceGraphic" />
          </filter>
        </defs>
        
        {/* Base Shape */}
        <path d="M 30 10 C 30 10, 35 18, 50 18 C 65 18, 70 10, 70 10 L 95 20 C 95 20, 98 28, 92 35 L 82 40 C 78 50, 78 75, 78 75 C 78 75, 70 95, 55 100 C 55 100, 50 105, 45 100 C 30 95, 22 75, 22 75 C 22 75, 22 50, 18 40 L 8 35 C 2 28, 5 20, 5 20 Z" fill={color} filter={`url(#texture-${idPrefix})`} />
        
        {/* Collar Details */}
        <path d="M 30 10 C 35 15, 65 15, 70 10" fill="transparent" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" />
        <path d="M 32 12 C 37 17, 63 17, 68 12" fill="transparent" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" strokeDasharray="1.5,1.5" />
        
        {/* Front Stitching & Buttons */}
        <line x1="50" y1="18" x2="50" y2="40" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
        <circle cx="50" cy="26" r="1.5" fill="rgba(0,0,0,0.2)" />
        <circle cx="50" cy="33" r="1.5" fill="rgba(0,0,0,0.2)" />
        
        {/* Leg Holes */}
        <path d="M 22 75 C 28 85, 38 95, 45 100" fill="transparent" stroke="rgba(0,0,0,0.08)" strokeWidth="1.2" />
        <path d="M 78 75 C 72 85, 62 95, 55 100" fill="transparent" stroke="rgba(0,0,0,0.08)" strokeWidth="1.2" />
        
        {/* Bottom Buttons */}
        <circle cx="47" cy="101" r="1" fill="rgba(0,0,0,0.2)" />
        <circle cx="53" cy="101" r="1" fill="rgba(0,0,0,0.2)" />
      </svg>
      <div style={{
        position: 'absolute',
        top: '55%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontFamily: 'var(--font-serif)',
        fontSize: '1.15rem',
        color: 'var(--color-brown-deep)',
        fontWeight: '600',
        letterSpacing: '1px'
      }}>
        {name}
      </div>
    </div>
  )
}

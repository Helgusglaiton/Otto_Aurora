export default function Bunting() {
  return (
    <div style={{ position: 'relative', width: '350px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ position: 'relative', width: '100%', height: '100px' }}>
        {/* string */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          <path d="M 10 20 Q 175 60, 340 20" fill="transparent" stroke="#8c7769" strokeWidth="1.5" />
        </svg>
        {/* flags */}
        <div style={{ position: 'absolute', top: '25px', left: '0', display: 'flex', gap: '20px', width: '100%', justifyContent: 'center' }}>
          {['C', 'H', 'Á'].map((letter, i) => (
            <div key={i} style={{
              position: 'relative',
              width: '55px',
              height: '75px',
              transform: i === 1 ? 'translateY(15px)' : i === 0 ? 'rotate(5deg)' : 'rotate(-5deg)'
            }}>
              <svg viewBox="0 0 50 70" width="100%" height="100%" style={{ filter: 'drop-shadow(0px 3px 4px rgba(0,0,0,0.12))' }}>
                <defs>
                  <filter id={`texture-bunting-${i}`}>
                    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" />
                    <feColorMatrix type="matrix" values="1 0 0 0 0  0 0.9 0 0 0  0 0.8 0 0 0  0 0 0 0.15 0" in="noise" result="coloredNoise" />
                    <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="composite" />
                    <feBlend mode="multiply" in="composite" in2="SourceGraphic" />
                  </filter>
                </defs>
                <path d="M 0 0 L 50 0 L 50 70 L 25 55 L 0 70 Z" fill="#fdf9f1" filter={`url(#texture-bunting-${i})`} />
                <path d="M 0 0 L 50 0 L 50 70 L 25 55 L 0 70 Z" fill="transparent" stroke="#d5a57e" strokeWidth="1.5" opacity="0.6" />
              </svg>
              <span style={{
                position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%, -50%)',
                color: 'var(--color-brown-deep)', fontSize: '2rem', fontFamily: 'var(--font-sans)', fontWeight: '400'
              }}>
                {letter}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="cursive" style={{ 
        color: 'var(--color-terracotta)', 
        fontSize: '4.5rem', 
        marginTop: '-35px',
        transform: 'rotate(-4deg)',
        textShadow: '1px 2px 2px rgba(199, 123, 102, 0.2)'
      }}>
        Revelação
      </div>
    </div>
  )
}

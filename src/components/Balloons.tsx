export default function Balloons({ side }: { side: 'left' | 'right' }) {
  const transform = side === 'right' ? 'scaleX(-1)' : 'none';
  
  return (
    <div style={{ width: '120px', transform }}>
      <svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
        {/* Strings */}
        <path d="M 20 80 Q 30 110, 50 150" fill="transparent" stroke="#8c7769" strokeWidth="0.5" />
        <path d="M 50 70 Q 50 110, 50 150" fill="transparent" stroke="#8c7769" strokeWidth="0.5" />
        <path d="M 80 80 Q 70 110, 50 150" fill="transparent" stroke="#8c7769" strokeWidth="0.5" />
        
        {/* Balloons */}
        <g transform="translate(10, 40) rotate(-15)">
          <ellipse cx="20" cy="30" rx="18" ry="22" fill="#4d3b33" opacity="0.9" />
          <ellipse cx="14" cy="20" rx="4" ry="8" fill="white" opacity="0.2" transform="rotate(-30 14 20)" />
        </g>
        <g transform="translate(60, 40) rotate(15)">
          <ellipse cx="20" cy="30" rx="18" ry="22" fill="#f4eee6" opacity="0.9" />
          <ellipse cx="14" cy="20" rx="4" ry="8" fill="white" opacity="0.5" transform="rotate(-30 14 20)" />
        </g>
        <g transform="translate(35, 10) rotate(0)">
          <ellipse cx="20" cy="30" rx="20" ry="25" fill="#d5a57e" opacity="0.9" />
          <ellipse cx="14" cy="18" rx="5" ry="10" fill="white" opacity="0.3" transform="rotate(-30 14 18)" />
        </g>
      </svg>
    </div>
  )
}

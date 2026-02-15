import React from 'react';

const Logo = (props: React.SVGProps<SVGSVGElement>) => {
    // This SVG is based on the user's provided code.
    // The fill color for "EXAMEN" is set to 'var(--text-color)' to automatically adapt to light/dark themes.
    return (
        <svg {...props} width="100%" height="100%" viewBox="0 0 500 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:"#A855F7", stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:"#EC4899", stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:"#3B82F6", stopOpacity:1}} />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <g transform="translate(10, 20)">
            <path 
              d="M15 60 Q 22.5 30, 37.5 22.5 T 60 15" 
              stroke="url(#glowGradient)" 
              strokeWidth="6" 
              fill="none" 
              strokeLinecap="round" 
              filter="url(#glow)"
            />
            <circle 
              cx="60" 
              cy="15" 
              r="6" 
              fill="url(#glowGradient)" 
              filter="url(#glow)"
            />
          </g>
          <text 
            x="95" 
            y="70" 
            fontFamily="'Poppins', sans-serif" 
            fontSize="56" 
            fontWeight="900" 
            fill="url(#glowGradient)" 
            letterSpacing="-2"
            filter="url(#glow)"
          >GLOW</text>
          <text 
            x="260" 
            y="70" 
            fontFamily="'Inter', sans-serif" 
            fontSize="56" 
            fontWeight="700" 
            fill="var(--text-color)" 
            letterSpacing="-1"
          >EXAMEN</text>
        </svg>
    );
};

export default Logo;
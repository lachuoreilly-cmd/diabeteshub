
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 40 }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl"
      >
        {/* Shield Shape Background */}
        <path
          d="M50 5 L85 20 V50 C85 70 70 85 50 95 C30 85 15 70 15 50 V20 L50 5Z"
          className="fill-blue-600/10 stroke-blue-600"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        
        {/* Dynamic Pulse Line */}
        <path
          d="M25 50 H35 L42 35 L52 65 L60 45 L68 50 H75"
          className="stroke-blue-600"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: '100',
            strokeDashoffset: '100',
            animation: 'pulse-draw 3s ease-in-out infinite'
          }}
        />

        {/* Metabolic Core Glow */}
        <circle cx="50" cy="50" r="8" className="fill-blue-600 animate-pulse" />
      </svg>

      <style>{`
        @keyframes pulse-draw {
          0% { stroke-dashoffset: 100; opacity: 0; }
          20% { opacity: 1; }
          50% { stroke-dashoffset: 0; }
          80% { opacity: 1; }
          100% { stroke-dashoffset: -100; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Logo;

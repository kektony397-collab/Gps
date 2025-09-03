
import React from 'react';
import { OPTIMAL_SPEED } from '../constants';

interface SpeedometerProps {
    speed: number;
}

const Speedometer: React.FC<SpeedometerProps> = ({ speed }) => {
    const maxSpeed = 200;
    const speedRatio = Math.min(speed, maxSpeed) / maxSpeed;
    const rotation = speedRatio * 270 - 135;

    const getArcColor = (currentSpeed: number) => {
        const diff = Math.abs(currentSpeed - OPTIMAL_SPEED);
        if (diff <= 5) return 'stroke-green-400'; // Optimal
        if (diff <= 15) return 'stroke-yellow-400'; // Near optimal
        return 'stroke-red-500'; // Inefficient
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Background Arc */}
                <path
                    d="M 50 150 A 75 75 0 1 1 150 150"
                    fill="none"
                    stroke="rgba(0, 255, 255, 0.1)"
                    strokeWidth="20"
                    strokeLinecap="round"
                />
                
                {/* Speed Arc */}
                <path
                    d="M 50 150 A 75 75 0 1 1 150 150"
                    fill="none"
                    className={`transition-all duration-300 ${getArcColor(speed)}`}
                    strokeWidth="20"
                    strokeLinecap="round"
                    strokeDasharray="353.429"
                    strokeDashoffset={353.429 * (1 - speedRatio)}
                />

                {/* Ticks */}
                {Array.from({ length: 11 }).map((_, i) => {
                    const angle = (i / 10) * 270 - 135;
                    return (
                        <line
                            key={i}
                            x1="100"
                            y1="100"
                            x2={100 + 85 * Math.cos((angle * Math.PI) / 180)}
                            y2={100 + 85 * Math.sin((angle * Math.PI) / 180)}
                            stroke="rgba(255, 255, 255, 0.3)"
                            strokeWidth={i % 2 === 0 ? "2" : "1"}
                            transform={`translate(${100 + 90 * Math.cos((angle * Math.PI) / 180) - (100 + 85 * Math.cos((angle * Math.PI) / 180))} ${100 + 90 * Math.sin((angle * Math.PI) / 180) - (100 + 85 * Math.sin((angle * Math.PI) / 180))})`}
                        />
                    );
                })}

                {/* Needle */}
                <g transform={`rotate(${rotation}, 100, 100)`}>
                    <path d="M 100 100 L 100 20" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="100" cy="100" r="5" fill="#ffffff" />
                    <circle cx="100" cy="100" r="8" fill="rgba(0, 255, 255, 0.5)" />
                </g>
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="font-orbitron text-7xl font-bold text-white tracking-tighter" style={{ textShadow: '0 0 10px rgba(0,255,255,0.7)' }}>
                    {Math.round(speed)}
                </span>
                <span className="text-xl font-medium text-cyan-300 -mt-2">km/h</span>
            </div>
        </div>
    );
};

export default Speedometer;

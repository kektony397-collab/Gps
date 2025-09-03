
import React from 'react';

interface InfoCardProps {
    icon: React.ReactNode;
    title: string;
    value: string;
    unit: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, value, unit }) => {
    return (
        <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-slate-700/50 flex flex-col justify-between aspect-square">
            <div className="flex items-center text-cyan-400 space-x-2">
                <div className="w-6 h-6">{icon}</div>
                <h3 className="text-sm font-medium text-slate-300 whitespace-nowrap">{title}</h3>
            </div>
            <div className="text-right">
                <span className="font-orbitron text-3xl sm:text-4xl font-bold text-white">{value}</span>
                <span className="ml-1 text-lg text-slate-400">{unit}</span>
            </div>
        </div>
    );
};

export default InfoCard;

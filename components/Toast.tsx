
import React from 'react';
import { CheckCircleIcon } from './Icons';

interface ToastProps {
    message: string | null;
    show: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, show }) => {
    return (
        <div
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${
                show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
            }`}
        >
            {message && (
                <div className="flex items-center gap-3 bg-green-600/90 backdrop-blur-sm text-white text-sm font-semibold px-4 py-3 rounded-full shadow-lg border border-green-500/50">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>{message}</span>
                </div>
            )}
        </div>
    );
};

export default Toast;

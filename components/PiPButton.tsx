
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PipIcon } from './Icons';

interface PiPButtonProps {
    data: {
        speed: number;
        distance: number;
        remainingFuel: number;
    };
}

let requestAnimationFrameId: number;

export const PiPButton: React.FC<PiPButtonProps> = ({ data }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPiPSupported, setIsPiPSupported] = useState(false);
    const [isPiPActive, setIsPiPActive] = useState(false);

    useEffect(() => {
        if ('pictureInPictureEnabled' in document) {
            setIsPiPSupported(document.pictureInPictureEnabled);
        }

        if (videoRef.current) {
            videoRef.current.addEventListener('enterpictureinpicture', () => setIsPiPActive(true));
            videoRef.current.addEventListener('leavepictureinpicture', () => setIsPiPActive(false));
        }

        return () => {
             if (videoRef.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                videoRef.current.removeEventListener('enterpictureinpicture', () => setIsPiPActive(true));
                // eslint-disable-next-line react-hooks/exhaustive-deps
                videoRef.current.removeEventListener('leavepictureinpicture', () => setIsPiPActive(false));
            }
        }
    }, []);

    const draw = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        const { speed, distance, remainingFuel } = data;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Background
        ctx.fillStyle = '#0f172a'; // slate-900
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Speed
        ctx.fillStyle = 'white';
        ctx.font = "bold 96px 'Orbitron', sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(speed).toString(), canvas.width / 2, canvas.height / 2 - 20);

        ctx.fillStyle = '#67e8f9'; // cyan-300
        ctx.font = "24px 'Roboto', sans-serif";
        ctx.fillText('km/h', canvas.width / 2, canvas.height / 2 + 40);
        
        // Bottom info
        ctx.fillStyle = 'white';
        ctx.font = "20px 'Roboto', sans-serif";
        ctx.textAlign = 'left';
        ctx.fillText(`Dist: ${distance.toFixed(1)}km`, 20, canvas.height - 30);
        
        ctx.textAlign = 'right';
        ctx.fillText(`Fuel: ${remainingFuel.toFixed(1)}L`, canvas.width - 20, canvas.height - 30);
        
        requestAnimationFrameId = requestAnimationFrame(() => draw(ctx, canvas));
    }, [data]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        if (canvas && video) {
            const ctx = canvas.getContext('2d');
            if(ctx) {
                draw(ctx, canvas);
                if (!video.srcObject) {
                    const stream = canvas.captureStream(30);
                    video.srcObject = stream;
                    video.play().catch(e => console.error("Video play failed:", e));
                }
            }
        }
        
        return () => {
            cancelAnimationFrame(requestAnimationFrameId);
        }
    }, [draw]);
    
    const handleTogglePiP = async () => {
        if (!videoRef.current) return;
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await videoRef.current.requestPictureInPicture();
            }
        } catch (error) {
            console.error('PiP Error:', error);
        }
    };
    
    if (!isPiPSupported) {
        return null;
    }

    return (
        <>
            <canvas ref={canvasRef} width="400" height="300" style={{ display: 'none' }} />
            <video ref={videoRef} muted playsInline style={{ display: 'none' }} />
            <button
                onClick={handleTogglePiP}
                className={`w-20 h-20 text-white rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-900 ${isPiPActive ? 'bg-cyan-500 hover:bg-cyan-600 focus:ring-cyan-400' : 'bg-slate-700 hover:bg-slate-600 focus:ring-cyan-500'}`}
                title={isPiPActive ? 'Exit Picture-in-Picture' : 'Enter Picture-in-Picture'}
            >
                <PipIcon className="w-8 h-8" />
            </button>
        </>
    );
};

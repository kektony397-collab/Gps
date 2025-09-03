
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useGeolocation } from './hooks/useGeolocation';
import type { Trip } from './types';
import { BIKE_AVERAGE_KMPL } from './constants';
import Speedometer from './components/Speedometer';
import InfoCard from './components/InfoCard';
import FuelModal from './components/FuelModal';
import Footer from './components/Footer';
import { PiPButton } from './components/PiPButton';
import { FuelIcon, MapPinIcon, HistoryIcon, PowerIcon, NoGpsIcon } from './components/Icons';

const App: React.FC = () => {
    const [totalFuel, setTotalFuel] = useState<number>(0);
    const [isFuelModalOpen, setIsFuelModalOpen] = useState<boolean>(false);
    const [tripHistory, setTripHistory] = useState<Trip[]>([]);
    const initialStartAttempted = useRef(false);
    
    const { 
        data, 
        isTracking, 
        startTracking, 
        stopTracking, 
        permissionState,
        error
    } = useGeolocation();

    useEffect(() => {
        // Automatically try to start tracking on load if permission isn't denied.
        // This triggers the browser's native permission prompt.
        if (!initialStartAttempted.current && permissionState !== 'denied' && !isTracking) {
            startTracking();
            initialStartAttempted.current = true;
        }
    }, [permissionState, isTracking, startTracking]);

    const { speed, distance } = data;

    const fuelConsumed = useMemo(() => distance / BIKE_AVERAGE_KMPL, [distance]);
    const remainingFuel = useMemo(() => totalFuel - fuelConsumed, [totalFuel, fuelConsumed]);
    const estimatedRange = useMemo(() => remainingFuel > 0 ? remainingFuel * BIKE_AVERAGE_KMPL : 0, [remainingFuel]);
    
    const handleStopRide = useCallback(() => {
        if (distance > 0) {
            const newTrip: Trip = {
                id: Date.now(),
                distance: parseFloat(distance.toFixed(2)),
                date: new Date().toISOString(),
            };
            setTripHistory(prev => [newTrip, ...prev.slice(0, 4)]);
        }
        stopTracking();
    }, [distance, stopTracking]);
    
    const handleToggleRide = () => {
        if (isTracking) {
            handleStopRide();
        } else {
            startTracking();
        }
    };
    
    const handleAddFuel = (liters: number) => {
        setTotalFuel(prev => prev + liters);
        setIsFuelModalOpen(false);
    };

    const AppContent = () => {
        if (permissionState === 'prompt' && !isTracking) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <NoGpsIcon className="w-24 h-24 text-cyan-400 mb-4 animate-pulse" />
                    <h2 className="text-2xl font-bold text-white mb-2">Awaiting GPS Permission</h2>
                    <p className="text-slate-400 max-w-md">
                        Please allow location access in the prompt from your browser to begin tracking.
                    </p>
                </div>
            );
        }

        if (permissionState === 'denied') {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <NoGpsIcon className="w-24 h-24 text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">GPS Access Denied</h2>
                    <p className="text-slate-400 max-w-md">
                        You have denied location access. To use this app, please enable location permissions for this site in your browser settings and refresh the page.
                    </p>
                </div>
            );
        }

        return (
            <>
                <div className="relative w-full aspect-square max-w-sm mx-auto">
                    <Speedometer speed={speed} />
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 px-4 w-full max-w-2xl mx-auto">
                    <InfoCard icon={<MapPinIcon />} title="Trip Distance" value={distance.toFixed(2)} unit="km" />
                    <InfoCard icon={<FuelIcon />} title="Fuel Left" value={remainingFuel.toFixed(2)} unit="L" />
                    <InfoCard icon={<HistoryIcon />} title="Est. Range" value={estimatedRange.toFixed(0)} unit="km" />
                </div>

                <div className="flex items-center justify-center space-x-4 mt-8">
                     <button
                        onClick={handleToggleRide}
                        className={`relative w-20 h-20 flex items-center justify-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-900 group ${isTracking ? 'bg-red-500 hover:bg-red-600 focus:ring-red-400' : 'bg-green-500 hover:bg-green-600 focus:ring-green-400'}`}
                    >
                        <span className={`absolute inset-0 rounded-full ${isTracking ? 'animate-ping bg-red-400' : ''}`}></span>
                        <PowerIcon className="w-10 h-10 text-white" />
                    </button>
                    <button
                        onClick={() => setIsFuelModalOpen(true)}
                        className="w-20 h-20 bg-slate-700 hover:bg-slate-600 text-white rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-4 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                    >
                        <FuelIcon className="w-8 h-8"/>
                    </button>
                    <PiPButton data={{speed, distance, remainingFuel}} />
                </div>
                
                {error && <p className="text-red-400 text-center mt-4 text-sm">{error}</p>}
                
                <div className="mt-8 w-full max-w-2xl mx-auto px-4">
                    <h3 className="text-lg font-semibold text-slate-300 mb-2 flex items-center gap-2"><HistoryIcon className="w-5 h-5"/> Recent Trips</h3>
                    <div className="space-y-2">
                        {tripHistory.length > 0 ? tripHistory.map(trip => (
                            <div key={trip.id} className="bg-slate-800/50 p-3 rounded-lg flex justify-between items-center text-sm">
                                <span className="text-slate-400">{new Date(trip.date).toLocaleDateString()} {new Date(trip.date).toLocaleTimeString()}</span>
                                <span className="text-white font-medium">{trip.distance} km</span>
                            </div>
                        )) : <p className="text-slate-500 text-sm text-center py-4">No trips recorded yet.</p>}
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-between p-4 selection:bg-cyan-500 selection:text-black">
            <main className="w-full flex flex-col items-center justify-center flex-grow">
                <AppContent />
            </main>
            
            <FuelModal
                isOpen={isFuelModalOpen}
                onClose={() => setIsFuelModalOpen(false)}
                onAddFuel={handleAddFuel}
            />
            
            <Footer />
        </div>
    );
};

export default App;

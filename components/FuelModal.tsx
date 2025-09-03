
import React, { useState, useEffect } from 'react';

interface FuelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddFuel: (liters: number) => void;
}

const FuelModal: React.FC<FuelModalProps> = ({ isOpen, onClose, onAddFuel }) => {
    const [liters, setLiters] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setLiters('');
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fuelAmount = parseFloat(liters);
        if (!isNaN(fuelAmount) && fuelAmount > 0) {
            onAddFuel(fuelAmount);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity"
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm m-4 shadow-2xl border border-slate-700"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold text-white mb-4">Add Fuel</h2>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="fuel-liters" className="block text-sm font-medium text-slate-400 mb-2">
                        Enter amount in liters
                    </label>
                    <input
                        type="number"
                        id="fuel-liters"
                        value={liters}
                        onChange={(e) => setLiters(e.target.value)}
                        placeholder="e.g., 5.5"
                        step="0.1"
                        min="0.1"
                        required
                        autoFocus
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                    />
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-semibold transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition"
                        >
                            Add Fuel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FuelModal;

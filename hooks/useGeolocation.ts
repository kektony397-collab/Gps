
import { useState, useCallback, useRef, useEffect } from 'react';

interface GeolocationData {
    speed: number;
    distance: number;
}

interface GeolocationPosition {
    coords: {
        latitude: number;
        longitude: number;
        speed: number | null;
    };
    timestamp: number;
}

// Haversine formula to calculate distance between two lat/lon points
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
};

export const useGeolocation = () => {
    const [data, setData] = useState<GeolocationData>({ speed: 0, distance: 0 });
    const [isTracking, setIsTracking] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [permissionState, setPermissionState] = useState<PermissionState>('prompt');

    const watchId = useRef<number | null>(null);
    const lastPosition = useRef<GeolocationPosition | null>(null);
    const totalDistance = useRef<number>(0);

    const handleSuccess = (position: GeolocationPosition) => {
        let currentSpeed = 0;
        
        if (position.coords.speed !== null && position.coords.speed > 0) {
            // Use browser's speed if available (more accurate)
            currentSpeed = position.coords.speed * 3.6; // m/s to km/h
        } else if (lastPosition.current) {
            // Fallback to calculating speed manually
            const distanceDelta = calculateDistance(
                lastPosition.current.coords.latitude,
                lastPosition.current.coords.longitude,
                position.coords.latitude,
                position.coords.longitude
            );
            const timeDelta = (position.timestamp - lastPosition.current.timestamp) / 1000; // seconds

            if (timeDelta > 0) {
                 const speedMps = distanceDelta / timeDelta;
                 currentSpeed = speedMps * 3.6; // m/s to km/h
            }
        }
        
        if (lastPosition.current) {
            const distanceIncrement = calculateDistance(
                lastPosition.current.coords.latitude,
                lastPosition.current.coords.longitude,
                position.coords.latitude,
                position.coords.longitude
            );
             totalDistance.current += distanceIncrement / 1000; // to km
        }

        setData({
            speed: currentSpeed,
            distance: totalDistance.current,
        });
        
        lastPosition.current = position;
        setError(null);
    };

    const handleError = (err: GeolocationPositionError) => {
        if (err.code === 1) { // PERMISSION_DENIED
            setError("Location permission denied. Please enable it in your browser settings.");
            stopTracking();
        } else {
            setError(`GPS Error: ${err.message}`);
        }
    };

    const startTracking = useCallback(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }

        lastPosition.current = null;
        totalDistance.current = 0;
        setData({ speed: 0, distance: 0 });
        setIsTracking(true);

        const options: PositionOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        };
        
        watchId.current = navigator.geolocation.watchPosition(handleSuccess, handleError, options);
    }, []);

    const stopTracking = useCallback(() => {
        if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
        setIsTracking(false);
        lastPosition.current = null;
        setData(prev => ({...prev, speed: 0}));
    }, []);

     useEffect(() => {
        if (!navigator.permissions) {
           // Assume prompt for older browsers
           setPermissionState('prompt');
           return;
        }
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
            setPermissionState(result.state);
            result.onchange = () => {
                setPermissionState(result.state);
                 if(result.state === 'denied') {
                    stopTracking();
                    setError("Location permission has been denied.");
                }
            };
        });
        
        return () => {
            stopTracking();
        }
    }, [stopTracking]);

    return { data, isTracking, error, permissionState, startTracking, stopTracking };
};

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { apiUrl } from '../lib/api';

// Fix for default Leaflet icon not showing correctly in Vite/React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
    onAddressSelect: (address: string) => void;
    onLocationSelect?: (lat: number, lng: number) => void;
    initialAddress?: string;
}

interface SearchResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
    onAddressSelect,
    onLocationSelect,
    initialAddress = ''
}) => {
    const [address, setAddress] = useState(initialAddress);
    const [position, setPosition] = useState<[number, number]>([10.0101, 77.4770]); // Default: Theni
    const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Helper to update map center when marker moves
    const MapRefresher = ({ center }: { center: [number, number] }) => {
        const map = useMap();
        useEffect(() => {
            map.setView(center, map.getZoom());
        }, [center, map]);
        return null;
    };

    // ----- Reverse Geocoding (Lat/Lng -> Address) -----
    const fetchAddressFromCoords = useCallback(async (lat: number, lng: number) => {
        setIsLocating(true);
        try {
            const res = await fetch(apiUrl(`/api/geocode/reverse?lat=${lat}&lon=${lng}`));
            const data = await res.json();
            const resolved = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            setAddress(resolved);
            onAddressSelect(resolved);
            if (onLocationSelect) onLocationSelect(lat, lng);
            setLocationStatus('success');
        } catch {
            const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            setAddress(fallback);
            onAddressSelect(fallback);
            if (onLocationSelect) onLocationSelect(lat, lng);
        } finally {
            setIsLocating(false);
        }
    }, [onAddressSelect, onLocationSelect]);

    // ----- Search via backend proxy (no CORS) -----
    const searchSuggestions = useCallback(async (query: string) => {
        if (query.trim().length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        setIsSearching(true);
        try {
            const res = await fetch(apiUrl(`/api/geocode/search?q=${encodeURIComponent(query)}`));
            const data: SearchResult[] = await res.json();
            setSuggestions(data);
            setShowSuggestions(data.length > 0);
        } catch {
            setSuggestions([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // ----- Free text typing -----
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setAddress(val);
        onAddressSelect(val); // update parent with raw text too
        setLocationStatus('idle');

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => searchSuggestions(val), 500);
    };

    // ----- Pick a suggestion -----
    const handlePick = (result: SearchResult) => {
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        setPosition([lat, lon]);
        setAddress(result.display_name);
        onAddressSelect(result.display_name);
        if (onLocationSelect) onLocationSelect(lat, lon);
        setSuggestions([]);
        setShowSuggestions(false);
        setLocationStatus('success');
    };

    // ----- Use live GPS location -----
    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }
        setIsLocating(true);
        setLocationStatus('idle');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition([latitude, longitude]);
                fetchAddressFromCoords(latitude, longitude);
            },
            (err) => {
                console.warn('Geolocation error:', err.message);
                setLocationStatus('error');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // ----- Draggable Marker Map Events -----
    function MapLocationMarker() {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setPosition([lat, lng]);
                fetchAddressFromCoords(lat, lng);
            },
        });

        return (
            <Marker
                position={position}
                draggable={true}
                eventHandlers={{
                    dragend: (e) => {
                        const marker = e.target;
                        const { lat, lng } = marker.getLatLng();
                        setPosition([lat, lng]);
                        fetchAddressFromCoords(lat, lng);
                    },
                }}
            />
        );
    }

    return (
        <div style={{ position: 'relative', width: '100%' }} ref={dropdownRef}>

            {/* ── Input Row ── */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <input
                        type="text"
                        className="premium-input"
                        placeholder="Type your delivery address..."
                        value={address}
                        onChange={handleInput}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
                        style={{ width: '100%', paddingRight: isSearching ? '2.5rem' : undefined }}
                        autoComplete="off"
                    />
                    {isSearching && (
                        <span style={{
                            position: 'absolute', right: '0.7rem', top: '50%',
                            transform: 'translateY(-50%)', fontSize: '0.72rem', color: '#aaa'
                        }}>…</span>
                    )}
                </div>

                {/* GPS button */}
                <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={isLocating}
                    title="Use my current location"
                    style={{
                        flexShrink: 0,
                        padding: '0 0.9rem',
                        borderRadius: '10px',
                        border: '2px solid rgba(47,30,27,0.15)',
                        background: locationStatus === 'success'
                            ? '#e8f5e9'
                            : locationStatus === 'error'
                                ? '#fdecea'
                                : 'white',
                        cursor: isLocating ? 'wait' : 'pointer',
                        fontSize: '1.1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        minWidth: '44px', minHeight: '44px',
                        transition: 'background 0.2s',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
                    }}
                >
                    {isLocating ? '⏳' : locationStatus === 'success' ? '✅' : locationStatus === 'error' ? '❌' : '📍'}
                </button>
            </div>

            {/* Status hint */}
            <div style={{ fontSize: '0.72rem', marginTop: '0.3rem', color: '#888' }}>
                {isLocating
                    ? 'Getting your location…'
                    : locationStatus === 'success'
                        ? '✅ Location detected — you can still edit the address below'
                        : locationStatus === 'error'
                            ? '❌ Could not get location. Please type your address manually.'
                            : '📍 Tap the pin button to auto-fill with your GPS location, or type freely above'}
            </div>

            {/* ── Suggestions Dropdown ── */}
            {showSuggestions && suggestions.length > 0 && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999,
                    background: 'white', borderRadius: '10px', marginTop: '0.25rem',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.13)', border: '1px solid rgba(47,30,27,0.08)',
                    maxHeight: '210px', overflowY: 'auto'
                }}>
                    {suggestions.map((s) => (
                        <div
                            key={s.place_id}
                            onMouseDown={() => handlePick(s)}
                            style={{
                                padding: '0.6rem 0.85rem', cursor: 'pointer',
                                fontSize: '0.82rem', lineHeight: '1.4',
                                color: 'var(--chocolate)',
                                borderBottom: '1px solid rgba(47,30,27,0.05)',
                                transition: 'background 0.12s'
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(47,30,27,0.05)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                        >
                            <span style={{ marginRight: '0.4rem' }}>📍</span>
                            {s.display_name}
                        </div>
                    ))}
                </div>
            )}

            {/* ── Draggable Map ── */}
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(47, 30, 27, 0.1)', marginTop: '0.8rem' }}>
                <div style={{
                    position: 'absolute', top: '0.5rem', left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)',
                    borderRadius: '20px', padding: '0.3rem 0.8rem',
                    fontSize: '0.72rem', fontWeight: 600, color: 'var(--chocolate)',
                    zIndex: 1000, whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}>
                    📌 Drag pin or tap map to move
                </div>
                <MapContainer
                    center={position}
                    zoom={15}
                    scrollWheelZoom={false}
                    style={{ height: '220px', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapLocationMarker />
                    <MapRefresher center={position} />
                </MapContainer>
            </div>
        </div>
    );
};

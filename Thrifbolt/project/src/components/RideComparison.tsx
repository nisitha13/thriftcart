import React, { useState, useRef } from 'react';
import { MapPin, Navigation, Zap, Star, Clock, Sparkles } from 'lucide-react';
import RideAnalysisSidebar from './RideAnalysisSidebar';
import rideData from '../data/ridedata.json';

// Base vehicle interface
interface Vehicle {
  vehicle_type: string;
  cost_inr: number;
  travel_time_minutes: number;
  pickup_time_minutes: number;
}

// Original ride entry from JSON
interface RideEntry {
  platform: string;
  pickup_location: string;
  destination: string;
  distance_km: number;
  vehicles: Vehicle[];
}

// Flattened ride data for display
interface FlatRideEntry extends Omit<Vehicle, 'vehicles'> {
  platform: string;
  pickup_location: string;
  destination: string;
  distance_km: number;
}

const RideComparison: React.FC = () => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [rideApps, setRideApps] = useState<FlatRideEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRide, setSelectedRide] = useState<any>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);

  const pickupRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  const getUniqueLocations = (type: 'pickup' | 'destination'): string[] => {
    const locations = rideData.rides.map(ride => type === 'pickup' ? ride.pickup_location : ride.destination);
    return Array.from(new Set(locations));
  };

  const handlePickupChange = (val: string) => {
    setPickup(val);
    const matches = getUniqueLocations('pickup').filter(loc => loc.toLowerCase().includes(val.toLowerCase()));
    setPickupSuggestions(matches);
  };

  const handleDestinationChange = (val: string) => {
    setDestination(val);
    const matches = getUniqueLocations('destination').filter(loc => loc.toLowerCase().includes(val.toLowerCase()));
    setDestinationSuggestions(matches);
  };

  const handleSearch = () => {
    if (!pickup || !destination) return;

    setLoading(true);
    setSelectedRide(null);
    setShowAnalysis(false);
    
    setTimeout(() => {
      const matched = rideData.rides.filter(
        ride =>
          ride.pickup_location.toLowerCase() === pickup.toLowerCase() &&
          ride.destination.toLowerCase() === destination.toLowerCase()
      );

      const filtered = matched.map(entry => ({
        ...entry,
        vehicles: vehicleType
          ? entry.vehicles.map(v => ({
              ...v,
              platform: entry.platform,
              pickup_location: entry.pickup_location,
              destination: entry.destination,
              distance_km: entry.distance_km
            })).filter(v => v.vehicle_type.toLowerCase() === vehicleType.toLowerCase())
          : entry.vehicles.map(v => ({
              ...v,
              platform: entry.platform,
              pickup_location: entry.pickup_location,
              destination: entry.destination,
              distance_km: entry.distance_km
            }))
      })).filter(entry => entry.vehicles.length > 0);

      // Flatten the array to make it easier to work with
      const flattened: FlatRideEntry[] = filtered.flatMap(entry => 
        entry.vehicles.map(vehicle => ({
          ...vehicle,
          platform: entry.platform,
          pickup_location: entry.pickup_location,
          destination: entry.destination,
          distance_km: entry.distance_km
        }))
      );

      setRideApps(flattened);
      setLoading(false);
    }, 500);
  };
  
  const getBookingUrl = (ride: FlatRideEntry) => {
    // Encode the route details for the URL
    const pickupEncoded = encodeURIComponent(ride.pickup_location);
    const destEncoded = encodeURIComponent(ride.destination);
    
    // Define base URLs for different ride-sharing platforms
    const platformUrls: {[key: string]: string} = {
      'Ola': `https://book.olacabs.com/?pickup_name=${pickupEncoded}&drop_name=${destEncoded}`,
      'Uber': `https://m.uber.com/ul/?action=setPickup&pickup=my_location&drop[formatted_address]=${destEncoded}`,
      'Rapido': `https://www.rapido.bike/`,
      'Namaya 3': 'https://www.namaya3.com/'
    };
    
    // Default to platform's homepage if no specific URL mapping exists
    return platformUrls[ride.platform] || `https://www.${ride.platform.toLowerCase()}.com`;
  };

  const handleBookNow = (e: React.MouseEvent, ride: FlatRideEntry) => {
    e.stopPropagation();
    const bookingUrl = getBookingUrl(ride);
    window.open(bookingUrl, '_blank', 'noopener,noreferrer');
  };

  const handleRideSelect = (ride: FlatRideEntry) => {
    setSelectedRide(ride);
    setShowAnalysis(true);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Compare Your Rides</h1>
          <p className="text-gray-400 italic">Search from local ride options based on your route</p>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1" ref={pickupRef}>
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-green-400" />
              <input
                type="text"
                value={pickup}
                onChange={(e) => handlePickupChange(e.target.value)}
                onBlur={() => setTimeout(() => setPickupSuggestions([]), 200)}
                placeholder="Enter Pickup Location"
                className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
              />
              {pickupSuggestions.length > 0 && (
                <ul className="absolute z-50 bg-gray-800 border border-gray-600 mt-1 rounded-lg w-full">
                  {pickupSuggestions.map((sug, i) => (
                    <li
                      key={i}
                      onMouseDown={() => {
                        setPickup(sug);
                        setPickupSuggestions([]);
                      }}
                      className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                    >
                      {sug}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="relative flex-1" ref={destRef}>
              <Navigation className="absolute left-3 top-3 h-5 w-5 text-red-400" />
              <input
                type="text"
                value={destination}
                onChange={(e) => handleDestinationChange(e.target.value)}
                onBlur={() => setTimeout(() => setDestinationSuggestions([]), 200)}
                placeholder="Enter Destination"
                className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
              />
              {destinationSuggestions.length > 0 && (
                <ul className="absolute z-50 bg-gray-800 border border-gray-600 mt-1 rounded-lg w-full">
                  {destinationSuggestions.map((sug, i) => (
                    <li
                      key={i}
                      onMouseDown={() => {
                        setDestination(sug);
                        setDestinationSuggestions([]);
                      }}
                      className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                    >
                      {sug}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
            >
              <option value="">All Vehicle Types</option>
              <option value="Bike">Bike</option>
              <option value="Auto">Auto</option>
              <option value="Car">Car</option>
            </select>

            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-lavender-500 hover:bg-lavender-600 rounded-lg text-white flex items-center"
            >
              <Zap className="h-4 w-4 mr-2" />
              Compare
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-300">Searching for rides...</p>
        ) : rideApps.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
            {rideApps.map((ride, index) => (
              <div
                key={index}
                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-lavender-400 transition-colors cursor-pointer"
                onClick={() => handleRideSelect(ride)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold">{ride.platform}</h3>
                    <p className="text-sm text-gray-300">{ride.vehicle_type}</p>
                  </div>
                  <button
                    className="p-1.5 rounded-full bg-gray-700 hover:bg-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRideSelect(ride);
                    }}
                  >
                    <Sparkles className="h-4 w-4 text-lavender-400" />
                  </button>
                </div>
                <div className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4" />
                  <span>{ride.travel_time_minutes} min • {ride.distance_km} km</span>
                </div>
                <div className="text-sm text-yellow-400 flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4" />
                  <span>{Math.floor(Math.random() * 2) + 4}.0</span>
                </div>
                <div className="text-2xl font-bold text-white mb-3">₹{ride.cost_inr}</div>
                <div className="flex gap-2">
                  <button 
                    className="flex-1 py-2 bg-lavender-500 text-white rounded-lg hover:bg-lavender-600 transition-colors flex items-center justify-center gap-2"
                    onClick={(e) => handleBookNow(e, ride)}
                  >
                    <span>Book Now</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 mt-8">No rides to show yet. Enter valid route.</div>
        )}
        
        {/* Ride Analysis Sidebar */}
        <RideAnalysisSidebar
          isOpen={showAnalysis && selectedRide !== null}
          onClose={() => setShowAnalysis(false)}
          ride={selectedRide}
        />
      </div>
    </div>
  );
};

export default RideComparison;

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

const RestaurantFinder = () => {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);

  useEffect(() => {
    // Load Google Maps script
    const script = document.createElement('script');
    const callback = 'initMap_' + Math.random().toString(36).substr(2, 9);
    window[callback] = () => {
      setMapLoaded(true);
    };

    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD-ig8toFkOuI7QLb0T8RZTUOA1A4gZCW4&libraries=places&callback=${callback}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      delete window[callback];
    };
  }, []);

  useEffect(() => {
    if (mapLoaded && mapRef.current && !googleMapRef.current) {
      // Initialize map
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 37.7749, lng: -122.4194 }, // San Francisco
        zoom: 14,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });
    }
  }, [mapLoaded]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const geocoder = new window.google.maps.Geocoder();
      const result = await new Promise((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            resolve(results[0]);
          } else {
            reject(new Error('Could not find that address'));
          }
        });
      });

      const location = {
        lat: result.geometry.location.lat(),
        lng: result.geometry.location.lng()
      };
      googleMapRef.current.setCenter(location);
      
      // Search for places
      const service = new window.google.maps.places.PlacesService(googleMapRef.current);
      const places = await new Promise((resolve, reject) => {
        service.nearbySearch({
          location,
          radius: 1609.34, // 1 mile in meters
          type: ['restaurant', 'bar']
        }, (results, status) => {
          if (status === 'OK') {
            resolve(results);
          } else {
            reject(new Error('No places found'));
          }
        });
      });

      // Clear existing markers
      // Add new markers with circles
      places.forEach(place => {
        const popularity = Math.min(100, Math.round((place.rating * (place.user_ratings_total || 1)) / 50));
        const circle = new window.google.maps.Circle({
          strokeColor: 'rgb(0, 255, 0)',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: 'rgb(0, 255, 0)',
          fillOpacity: 0.35,
          map: googleMapRef.current,
          center: place.geometry.location,
          radius: 25 + (50 * popularity/100),
          clickable: true
        });

        circle.addListener('click', () => {
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold;">${place.name}</h3>
                <p style="margin: 4px 0;">Rating: ${place.rating}⭐ (${place.user_ratings_total || 0} reviews)</p>
                <p style="margin: 4px 0;">Popularity Score: ${popularity}%</p>
                <p style="margin: 4px 0;">${place.vicinity}</p>
              </div>
            `
          });
          infoWindow.setPosition(place.geometry.location);
          infoWindow.open(googleMapRef.current);
        });
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter an address (e.g., '123 Main St, San Francisco, CA')"
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !mapLoaded}>
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </form>

      {/* Map Container */}
      <div 
        ref={mapRef}
        style={{ 
          width: '100%',
          height: '500px',
          backgroundColor: '#f0f0f0',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}
      />

      {/* Legend */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <h3 className="font-semibold mb-2">Venue Popularity</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span className="text-sm">High Popularity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <span className="text-sm">Low Popularity</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantFinder;
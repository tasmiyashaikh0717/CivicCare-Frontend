
import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(event) {
      onLocationSelect({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

function MapUpdater({ value }) {
  const map = useMap();

  if (value) {
    map.setView(
      [value.latitude, value.longitude],
      16
    );
  }

  return null;
}

function LocationPicker({ value, onChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleLocationSelect(location) {
    setError("");
    onChange(location);
  }

  function getCurrentLocation() {
    setError("");

    if (!navigator.geolocation) {
      setError("Your browser does not support location access.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        onChange(location);
        setLoading(false);
      },
      (error) => {
        if (error.code === 1) {
          setError(
            "Location permission denied. Allow location access in your browser settings."
          );
        } else if (error.code === 2) {
          setError("Your current location could not be detected.");
        } else {
          setError(
            "Location request timed out. Please try again."
          );
        }

        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  return (
    <div className="location-picker">
      <h3>Select Complaint Location</h3>

      <p>
        Use your current location or click on the map
        to mark where the civic issue is located.
      </p>

      <button
        type="button"
        onClick={getCurrentLocation}
        disabled={loading}
        style={{
          marginBottom: "15px",
          padding: "10px 16px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#2563eb",
          color: "white",
          cursor: loading ? "wait" : "pointer",
        }}
      >
        {loading
          ? "Detecting location..."
          : "📍 Use My Current Location"}
      </button>

      {error && (
        <p role="alert" style={{ color: "red" }}>
          {error}
        </p>
      )}

      <MapContainer
        center={[18.5204, 73.8567]}
        zoom={12}
        style={{
          height: "350px",
          width: "100%",
          borderRadius: "12px",
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler
          onLocationSelect={handleLocationSelect}
        />

        <MapUpdater value={value} />

        {value && (
          <Marker
            position={[value.latitude, value.longitude]}
            icon={markerIcon}
          />
        )}
      </MapContainer>

      {value ? (
        <p className="selected-location">
          <strong>Selected coordinates:</strong>{" "}
          {value.latitude.toFixed(6)},{" "}
          {value.longitude.toFixed(6)}
        </p>
      ) : (
        <p>Select a point on the map or use your current location.</p>
      )}
    </div>
  );
}

export default LocationPicker;

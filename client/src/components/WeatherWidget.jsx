import { useEffect, useState } from "react";
import api from "../services/api";

function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Location not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const res = await api.get(
            `/weather?lat=${latitude}&lon=${longitude}`
          );

          setWeather(res.data);
        } catch (err) {
          console.error(err);
          setError("Unable to load weather.");
        }
      },
      () => {
        setError("Location permission denied.");
      }
    );
  }, []);

  if (error) {
    return (
      <p
        style={{
          opacity: 0.7,
          fontSize: "0.9rem",
        }}
      >
        {error}
      </p>
    );
  }

  if (!weather) {
    return (
      <p
        style={{
          opacity: 0.7,
          fontSize: "0.9rem",
        }}
      >
        Loading weather...
      </p>
    );
  }

  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: "12px",
        width: "100%",
      }}
    >
      <img
        src={iconUrl}
        alt={weather.description}
        width={55}
        height={55}
      />

      <div>
        <h3
          style={{
            margin: 0,
          }}
        >
          {weather.temperature}°C
        </h3>

        <div>{weather.city}</div>

        <div
          style={{
            fontSize: "0.9rem",
            opacity: 0.75,
          }}
        >
          Feels like {weather.feelsLike}°C
        </div>
      </div>
    </div>
  );
}

export default WeatherWidget;
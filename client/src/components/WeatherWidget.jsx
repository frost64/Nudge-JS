import {
  useEffect,
  useState,
} from "react";

import useBreakpoint from "../hooks/useBreakpoint";
import api from "../services/api";

import LoadingSpinner from "./LoadingSpinner";

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: false,
  timeout: 10000,
  maximumAge: 5 * 60 * 1000,
};

// Default weather location:
// Islamabad, Pakistan
const DEFAULT_LOCATION = {
  latitude: 33.6844,
  longitude: 73.0479,
};

/**
 * Displays the user's current local weather.
 *
 * Uses the user's browser location when available.
 * Falls back to Islamabad, Pakistan if location
 * permission is denied or geolocation is unavailable.
 */
function WeatherWidget() {
  const { isMobile } = useBreakpoint();

  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const controller =
      new AbortController();

    const fetchWeather = async (
      latitude,
      longitude
    ) => {
      try {
        const response = await api.get(
          "/weather",
          {
            params: {
              lat: latitude,
              lon: longitude,
            },

            signal: controller.signal,
          }
        );

        if (!active) return;

        setWeather(response.data);
        setError("");
      } catch (requestError) {
        if (
          requestError.name ===
            "CanceledError" ||
          requestError.code ===
            "ERR_CANCELED"
        ) {
          return;
        }

        console.error(requestError);

        if (active) {
          setError(
            "Unable to load weather."
          );
        }
      }
    };

    const loadDefaultWeather = () => {
      fetchWeather(
        DEFAULT_LOCATION.latitude,
        DEFAULT_LOCATION.longitude
      );
    };

    const handleLocationSuccess = (
      position
    ) => {
      const {
        latitude,
        longitude,
      } = position.coords;

      fetchWeather(
        latitude,
        longitude
      );
    };

    const handleLocationError = (
      locationError
    ) => {
      if (!active) return;

      switch (locationError.code) {
        case locationError.PERMISSION_DENIED:
          console.info(
            "Location permission denied. Using Islamabad, Pakistan."
          );

          loadDefaultWeather();
          break;

        case locationError.POSITION_UNAVAILABLE:
          console.info(
            "Location unavailable. Using Islamabad, Pakistan."
          );

          loadDefaultWeather();
          break;

        case locationError.TIMEOUT:
          console.info(
            "Location request timed out. Using Islamabad, Pakistan."
          );

          loadDefaultWeather();
          break;

        default:
          console.info(
            "Unable to access location. Using Islamabad, Pakistan."
          );

          loadDefaultWeather();
      }
    };

    if (!navigator.geolocation) {
      loadDefaultWeather();
    } else {
      navigator.geolocation.getCurrentPosition(
        handleLocationSuccess,
        handleLocationError,
        GEOLOCATION_OPTIONS
      );
    }

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  if (error) {
    return (
      <p
        role="status"
        style={{
          margin: 0,
          opacity: 0.7,
          fontSize: "0.9rem",

          textAlign: isMobile
            ? "center"
            : "right",
        }}
      >
        {error}
      </p>
    );
  }

  if (!weather) {
    return (
      <LoadingSpinner
        text="Loading weather..."
        size={50}
      />
    );
  }

  const {
    icon,
    description = "Current weather",
    temperature,
    feelsLike,
    city = "Current location",
  } = weather;

  const iconUrl = icon
    ? `https://openweathermap.org/img/wn/${icon}@2x.png`
    : null;

  return (
    <div
      style={{
        display: "flex",

        flexDirection: isMobile
          ? "column"
          : "row",

        justifyContent: isMobile
          ? "center"
          : "flex-end",

        alignItems: "center",

        width: "100%",
        minWidth: 0,

        gap: isMobile
          ? "6px"
          : "12px",

        textAlign: isMobile
          ? "center"
          : "left",
      }}
    >
      {iconUrl && (
        <img
          src={iconUrl}
          alt={description}
          width={isMobile ? 46 : 55}
          height={isMobile ? 46 : 55}
          loading="lazy"
          style={{
            flexShrink: 0,
            objectFit: "contain",
          }}
        />
      )}

      <div
        style={{
          minWidth: 0,
        }}
      >
        <h3
          style={{
            margin: 0,

            fontSize: isMobile
              ? "1.2rem"
              : "1.45rem",
          }}
        >
          {temperature ?? "—"}°C
        </h3>

        <div
          style={{
            maxWidth: "100%",

            fontSize: isMobile
              ? ".95rem"
              : "1rem",

            fontWeight: 500,

            overflowWrap:
              "anywhere",
          }}
        >
          {city}
        </div>

        <div
          style={{
            marginTop: "4px",
            opacity: 0.75,
            fontSize: ".9rem",
          }}
        >
          Feels like{" "}
          {feelsLike ?? "—"}°C
        </div>
      </div>
    </div>
  );
}

export default WeatherWidget;
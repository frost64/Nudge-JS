const axios = require("axios");

const OPENWEATHER_URL =
  "https://api.openweathermap.org/data/2.5/weather";

const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Converts a coordinate query value into a number.
 *
 * @param {unknown} value
 * @returns {number|null}
 */
function parseCoordinate(value) {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return null;
  }

  const coordinate = Number(value);

  return Number.isFinite(coordinate)
    ? coordinate
    : null;
}

/**
 * Validates latitude and longitude values.
 *
 * @param {number|null} latitude
 * @param {number|null} longitude
 * @returns {string|null}
 */
function validateCoordinates(
  latitude,
  longitude
) {
  if (
    latitude === null ||
    longitude === null
  ) {
    return (
      "Latitude and longitude are required."
    );
  }

  if (
    latitude < -90 ||
    latitude > 90
  ) {
    return (
      "Latitude must be between -90 and 90."
    );
  }

  if (
    longitude < -180 ||
    longitude > 180
  ) {
    return (
      "Longitude must be between -180 and 180."
    );
  }

  return null;
}

/**
 * Returns a normalized weather response for the frontend.
 *
 * @param {object} weather
 * @returns {object}
 */
function formatWeatherResponse(weather) {
  const currentCondition =
    weather.weather?.[0];

  if (
    !weather.main ||
    !weather.wind ||
    !weather.sys ||
    !currentCondition
  ) {
    throw new Error(
      "Weather provider returned incomplete data."
    );
  }

  return {
    city: weather.name || "",
    country: weather.sys.country || "",

    temperature: Math.round(
      weather.main.temp
    ),

    feelsLike: Math.round(
      weather.main.feels_like
    ),

    humidity: weather.main.humidity,
    wind: weather.wind.speed,

    description:
      currentCondition.description || "",

    icon:
      currentCondition.icon || "",
  };
}

/**
 * Handles errors returned by the weather provider.
 *
 * @param {import("express").Response} res
 * @param {unknown} error
 * @returns {import("express").Response}
 */
function handleWeatherError(res, error) {
  console.error(
    "Weather request failed:",
    error
  );

  if (
    axios.isAxiosError(error)
  ) {
    if (
      error.code === "ECONNABORTED"
    ) {
      return res.status(504).json({
        success: false,
        message:
          "Weather service timed out.",
      });
    }

    const upstreamStatus =
      error.response?.status;

    if (upstreamStatus === 429) {
      return res.status(503).json({
        success: false,
        message:
          "Weather service is temporarily unavailable.",
      });
    }

    if (
      upstreamStatus === 401 ||
      upstreamStatus === 403
    ) {
      return res.status(502).json({
        success: false,
        message:
          "Weather service configuration error.",
      });
    }

    return res.status(502).json({
      success: false,
      message:
        "Failed to fetch weather.",
    });
  }

  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Failed to fetch weather."
        : error.message ||
          "Failed to fetch weather.",
  });
}

/**
 * Returns current weather for supplied coordinates.
 */
async function getWeather(req, res) {
  try {
    if (
      !process.env.OPENWEATHER_API_KEY
    ) {
      console.error(
        "OPENWEATHER_API_KEY is not configured."
      );

      return res.status(500).json({
        success: false,
        message:
          "Weather service is not configured.",
      });
    }

    const latitude = parseCoordinate(
      req.query.lat
    );

    const longitude = parseCoordinate(
      req.query.lon
    );

    const validationError =
      validateCoordinates(
        latitude,
        longitude
      );

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const response = await axios.get(
      OPENWEATHER_URL,
      {
        params: {
          lat: latitude,
          lon: longitude,
          units: "metric",
          appid:
            process.env
              .OPENWEATHER_API_KEY,
        },

        timeout:
          REQUEST_TIMEOUT_MS,

        headers: {
          Accept: "application/json",
        },
      }
    );

    const weather =
      formatWeatherResponse(
        response.data
      );

    return res.status(200).json(
      weather
    );
  } catch (error) {
    return handleWeatherError(
      res,
      error
    );
  }
}

module.exports = {
  getWeather,
};
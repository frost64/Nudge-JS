const axios = require("axios");

const getWeather = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        message: "Latitude and longitude are required.",
      });
    }

    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          lat,
          lon,
          units: "metric",
          appid: process.env.OPENWEATHER_API_KEY,
        },
      }
    );

    const weather = response.data;

    res.json({
      city: weather.name,
      country: weather.sys.country,
      temperature: Math.round(weather.main.temp),
      feelsLike: Math.round(weather.main.feels_like),
      humidity: weather.main.humidity,
      wind: weather.wind.speed,
      description: weather.weather[0].description,
      icon: weather.weather[0].icon,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch weather.",
    });
  }
};

module.exports = {
  getWeather,
};
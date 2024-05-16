import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import moment from "moment-timezone";

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000;
const baseApiUrl = "http://api.openweathermap.org";

const apiKey = process.env.OPENWEATHER_API_KEY;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index', { location: null, forecast: null, error: null, content: 'Enter a zip code to get the current weather.' });
});

app.get('/getWeather', async (req, res) => {
  const zip = req.query.zip;
  try {
    const weatherResponse = await axios.get(`${baseApiUrl}/data/2.5/forecast?zip=${zip},us&appid=${apiKey}&units=imperial`);
    const forecast = weatherResponse.data;

    // Extract city and country
    const city = forecast.city.name;
    const country = forecast.city.country;
    const location = `${city}, ${country}`;

    // Get the timezone offset from the API response (in seconds)
    const timezoneOffset = forecast.city.timezone;

    // Get the current local date in the city's time zone
    const today = moment.utc().add(timezoneOffset, 'seconds').format('YYYY-MM-DD');

    // Group forecasts by day and calculate high and low temperatures
    const forecastByDay = {};

    forecast.list.forEach(item => {
      // Adjust each forecast item's timestamp to the local date using the timezone offset
      const localDate = moment.utc(item.dt * 1000).add(timezoneOffset, 'seconds').format('YYYY-MM-DD');
      if (!forecastByDay[localDate]) {
        forecastByDay[localDate] = { tempMin: item.main.temp, tempMax: item.main.temp, weather: [] };
      } else {
        if (item.main.temp < forecastByDay[localDate].tempMin) {
          forecastByDay[localDate].tempMin = item.main.temp;
        }
        if (item.main.temp > forecastByDay[localDate].tempMax) {
          forecastByDay[localDate].tempMax = item.main.temp;
        }
      }
      forecastByDay[localDate].weather.push(item.weather[0]);
    });

    const dailyForecasts = Object.keys(forecastByDay).sort().map(date => {
      const dayData = forecastByDay[date];
      const weatherCounts = dayData.weather.reduce((acc, weather) => {
        const key = weather.icon.replace('n', 'd'); // Force day icon
        if (!acc[key]) {
          acc[key] = { count: 0, weather };
        }
        acc[key].count += 1;
        return acc;
      }, {});
      const mostFrequentWeather = Object.values(weatherCounts).sort((a, b) => b.count - a.count)[0].weather;

      // Capitalize the first letter of the weather description
      const description = mostFrequentWeather.description.charAt(0).toUpperCase() + mostFrequentWeather.description.slice(1);

      return {
        date,
        tempMin: Math.round(dayData.tempMin),
        tempMax: Math.round(dayData.tempMax),
        weather: {
          ...mostFrequentWeather,
          description: description,
          icon: mostFrequentWeather.icon.replace('n', 'd') // Ensure day icon
        }
      };
    });

    // Filter forecasts to show only today and the next four days
    const filteredForecasts = dailyForecasts.filter(forecast => moment(forecast.date).isAfter(today)).slice(0, 5);

    res.render('index', { location: location, forecast: filteredForecasts, error: null });
  } catch (error) {
    console.error(error);
    res.render('index', { location: null, forecast: null, error: 'Error fetching data. Please try again.', content: null });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});














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
  res.render('index', {
    activePage: 'home',
    location: null,
    forecast: null,
    error: null,
    content: 'Enter a postal code to get the current weather.'
  });
});

app.get('/about', (req, res) => {
  res.render('about', {
    activePage: 'about'
  });
});

app.get('/getWeather', async (req, res) => {
  const zip = req.query.zip;
  try {
    const weatherResponse = await axios.get(`${baseApiUrl}/data/2.5/forecast?zip=${zip}&appid=${apiKey}&units=imperial`);
    const forecast = weatherResponse.data;

    const city = forecast.city.name;
    const country = forecast.city.country;
    const location = `${city}, ${country}`;

    const timezoneOffset = forecast.city.timezone;

    // Correct handling of local time based on API-provided offset
    const localNow = moment.utc().add(timezoneOffset, 'seconds');
    const today = localNow.clone().startOf('day'); // Keeps as Moment object

    // Group forecasts by local date
    const forecastByDay = {};

    forecast.list.forEach(item => {
      const localDate = moment.utc(item.dt * 1000).add(timezoneOffset, 'seconds').format('YYYY-MM-DD');
      if (!forecastByDay[localDate]) {
        forecastByDay[localDate] = {
          tempMin: item.main.temp,
          tempMax: item.main.temp,
          weather: []
        };
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
        const key = weather.icon.replace('n', 'd');
        if (!acc[key]) {
          acc[key] = { count: 0, weather };
        }
        acc[key].count += 1;
        return acc;
      }, {});
      const mostFrequentWeather = Object.values(weatherCounts).sort((a, b) => b.count - a.count)[0].weather;

      const description = mostFrequentWeather.description.charAt(0).toUpperCase() + mostFrequentWeather.description.slice(1);

      return {
        date,
        tempMin: Math.round(dayData.tempMin),
        tempMax: Math.round(dayData.tempMax),
        weather: {
          ...mostFrequentWeather,
          description,
          icon: mostFrequentWeather.icon.replace('n', 'd')
        }
      };
    });

    const filteredForecasts = dailyForecasts
      .filter(forecast => moment(forecast.date).isSameOrAfter(today, 'day'))
      .slice(0, 5);

    res.render('index', {
      activePage: 'home',
      location,
      forecast: filteredForecasts,
      error: null
    });
  } catch (error) {
    console.error(error);
    res.render('index', {
      activePage: 'home',
      location: null,
      forecast: null,
      error: 'Error fetching data. Please try again.',
      content: null
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

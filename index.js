import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";

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
    const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?zip=${zip},us&appid=${apiKey}&units=imperial`);
    const forecast = weatherResponse.data;

    // Extract location name
    const location = forecast.city.name;

    // Filter forecast to get data for a specific time each day (e.g., 12:00:00)
    const dailyForecasts = forecast.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 5);

    res.render('index', { location: location, forecast: dailyForecasts, error: null });
  } catch (error) {
    console.error(error);
    res.render('index', { location: null, forecast: null, error: 'Error fetching data. Please try again.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

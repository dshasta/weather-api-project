# Weather App

This is a simple weather application that fetches and displays the weather forecast for a specified zip code. The application uses the OpenWeatherMap API to retrieve weather data and displays a 5-day forecast.

## Features

- Toggle between Fahrenheit and Celsius units
- Displays the weather for the entered zip city as a 5-day forecast (including today) including high and low temp, weather condition, and condition icon
- Responsive design

## Project Structure

Capstone 4 - Public API
├── node_modules
├── public
│ ├── images
│ │ ├── shaheen-family-fun-q65.jpeg
│ │ ├── weather-favicon.png
│ ├── styles
│ │ └── main.css
├── views
│ ├── partials
│ │ ├── footer.ejs
│ │ ├── head.ejs
│ │ ├── header.ejs
│ ├── about.ejs
│ ├── index.ejs
├── .env
├── .gitignore
├── index.js
├── package-lock.json
├── package.json
└── README.md


## Installation

1. Clone the repository to your local machine:
    ```sh
    git clone <your-repo-url>
    cd capstone-4-public-api
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root of the project and add your OpenWeatherMap API key:
    ```
    OPENWEATHER_API_KEY=your_api_key_here
    ```

## Usage

1. Start the server:
    ```sh
    nodemon index.js
    ```

2. Open your web browser and navigate to:
    ```
    http://localhost:3000
    ```

## Project Files

### `index.js`

This is the main server file that sets up the Express server, handles routes, and fetches weather data from the OpenWeatherMap API.

### `views/index.ejs`

This file contains the main HTML structure for the home page, including the form to enter a zip code and the display of weather data.

### `views/about.ejs`

This file contains the HTML structure for the about page, displaying information about the creator and interests.

### `views/partials`

This directory contains reusable EJS partials for the header, footer, and head sections of the HTML.

### `public`

This directory contains static assets like images and CSS files.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.


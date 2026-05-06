# Weather Search

A small React app that searches current weather by city using OpenWeatherMap.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

   On Windows PowerShell, use `npm.cmd install` if script execution policy blocks `npm`.

2. Create `.env.local` from `.env.example` and add your OpenWeatherMap API key:

   ```bash
   VITE_OPENWEATHER_API_KEY=your_key_here
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

   On Windows PowerShell, `npm.cmd run dev` works the same way.

The app calls OpenWeatherMap's current weather endpoint with city name search, metric units, and JSON responses.

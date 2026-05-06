import { useMemo, useState } from 'react';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const WEATHER_ENDPOINT = 'https://api.openweathermap.org/data/2.5/weather';

function getWeatherIconUrl(icon) {
  return `https://openweathermap.org/img/wn/${icon}@4x.png`;
}

function getErrorMessage(status, fallbackMessage) {
  if (status === 404) {
    return 'City not found. Check the spelling and try another search.';
  }

  if (status === 429) {
    return 'API limit exceeded. Wait a little while before searching again.';
  }

  if (status === 401) {
    return 'OpenWeatherMap rejected the API key. Check your VITE_OPENWEATHER_API_KEY value.';
  }

  return fallbackMessage || 'Something went wrong while fetching weather data.';
}

function mapWeatherResponse(data) {
  return {
    city: data.name,
    country: data.sys?.country,
    temp: Math.round(data.main?.temp),
    feelsLike: Math.round(data.main?.feels_like),
    humidity: data.main?.humidity,
    pressure: data.main?.pressure,
    windSpeed: data.wind?.speed,
    visibility: typeof data.visibility === 'number' ? Math.round(data.visibility / 1000) : null,
    condition: data.weather?.[0]?.description || data.weather?.[0]?.main || 'Current weather',
    icon: data.weather?.[0]?.icon || '01d',
    updatedAt: new Date().toISOString(),
  };
}

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const formattedDate = useMemo(() => {
    if (!weather) {
      return '';
    }

    return new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(weather.updatedAt));
  }, [weather]);

  async function handleSubmit(event) {
    event.preventDefault();

    const requestedCity = city.trim();
    if (!requestedCity) {
      setStatus('error');
      setError('Enter a city name to search.');
      return;
    }

    if (!API_KEY) {
      setStatus('error');
      setError('Missing OpenWeatherMap API key. Add VITE_OPENWEATHER_API_KEY to .env.local.');
      return;
    }

    const url = new URL(WEATHER_ENDPOINT);
    url.searchParams.set('q', requestedCity);
    url.searchParams.set('appid', API_KEY);
    url.searchParams.set('units', 'metric');

    setStatus('loading');
    setError('');

    try {
      const response = await fetch(url);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(getErrorMessage(response.status, data.message), {
          cause: { status: response.status },
        });
      }

      setWeather(mapWeatherResponse(data));
      setStatus('success');
    } catch (requestError) {
      const isNetworkFailure = requestError instanceof TypeError;
      setStatus('error');
      setError(
        isNetworkFailure
          ? 'Network failure. Check your connection and try again.'
          : requestError.message,
      );
    }
  }

  return (
    <main className="app-shell">
      <section className="weather-panel" aria-labelledby="app-title">
        <div className="search-area">
          <div>
            <p className="eyebrow">Current conditions</p>
            <h1 id="app-title">Weather Search</h1>
          </div>

          <form className="search-form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="city-search">
              City name
            </label>
            <input
              id="city-search"
              type="search"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Search city"
              autoComplete="address-level2"
            />
            <button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? <span className="button-spinner" aria-hidden="true" /> : null}
              <span>{status === 'loading' ? 'Searching' : 'Search'}</span>
            </button>
          </form>
        </div>

        {status === 'loading' ? (
          <div className="state-banner loading-state" role="status" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            <span>Fetching live weather data...</span>
          </div>
        ) : null}

        {status === 'error' ? (
          <div className="state-banner error-state" role="alert">
            {error}
          </div>
        ) : null}

        {weather ? (
          <article className="weather-card">
            <div className="current-weather">
              <div>
                <p className="location">
                  {weather.city}
                  {weather.country ? `, ${weather.country}` : ''}
                </p>
                <p className="updated">{formattedDate}</p>
              </div>
              <img
                src={getWeatherIconUrl(weather.icon)}
                alt={`${weather.condition} icon`}
                className="weather-icon"
              />
            </div>

            <div className="temperature-row">
              <p className="temperature">{weather.temp}&deg;</p>
              <div>
                <p className="condition">{weather.condition}</p>
                <p className="feels-like">Feels like {weather.feelsLike}&deg;C</p>
              </div>
            </div>

            <dl className="weather-details">
              <div>
                <dt>Humidity</dt>
                <dd>{weather.humidity}%</dd>
              </div>
              <div>
                <dt>Wind</dt>
                <dd>{weather.windSpeed} m/s</dd>
              </div>
              <div>
                <dt>Pressure</dt>
                <dd>{weather.pressure} hPa</dd>
              </div>
              <div>
                <dt>Visibility</dt>
                <dd>{weather.visibility ?? 'N/A'} km</dd>
              </div>
            </dl>
          </article>
        ) : (
          <section className="idle-card" aria-label="No city selected">
            <span aria-hidden="true">&deg;C</span>
            <p>No city selected</p>
          </section>
        )}
      </section>
    </main>
  );
}

export default App;

const API_KEY = '51d7d0e6b0ef4a9b8df132116260706';
const MAX_FORECAST_DAYS = 14;

const form = document.getElementById('weather-form');
const input = document.getElementById('city-input');
const dateInput = document.getElementById('date-input');
const out = document.getElementById('weather-output');
const weatherVideo = document.querySelector('.weather-bg-video');
const STORAGE_KEY = 'weatherLastCity';

function saveLastCity(city) {
	localStorage.setItem(STORAGE_KEY, city);
}

function loadLastCity() {
	const saved = localStorage.getItem(STORAGE_KEY);
	if (saved) {
		input.value = saved;
		return saved;
	}
	return null;
}

let forecastData = null;
let availableDates = [];

function formatDate(dateString) {
	return new Date(dateString).toLocaleDateString('uk-UA', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});
}

function renderWeatherCard(location, dayData) {
	const iconUrl = dayData.condition.icon.startsWith('http') ? dayData.condition.icon : `https:${dayData.condition.icon}`;

	return `
		<div class="weather-card">
			<img class="weather-icon" src="${iconUrl}" alt="${dayData.condition.text}" />
			<h2>${location.name}, ${location.country}</h2>
			<p class="weather-condition">${dayData.condition.text}</p>
			<table class="weather-table">
				<tr><td>Max Temperature</td><td>${dayData.maxtemp_c} °C</td></tr>
				<tr><td>Min Temperature</td><td>${dayData.mintemp_c} °C</td></tr>
				<tr><td>Average Temperature</td><td>${dayData.avgtemp_c} °C</td></tr>
				<tr><td>Chance of Rain</td><td>${dayData.daily_chance_of_rain} %</td></tr>
				<tr><td>Humidity</td><td>${dayData.avghumidity} %</td></tr>
				<tr><td>Wind</td><td>${dayData.maxwind_kph} km/h</td></tr>
				<tr><td>UV Index</td><td>${dayData.uv}</td></tr>
			</table>
		</div>
	`;
}

function renderError(message) {
	out.innerHTML = `<div class="weather-error">${message}</div>`;
	if (weatherVideo) {
		weatherVideo.style.display = 'none';
	}
}

function applyWeatherTheme(conditionText) {
	const normalized = conditionText.toLowerCase();
	const root = document.documentElement;

	const theme = {
		clear: {
			'--ui-panel': 'rgba(255, 233, 163, 0.18)',
			'--ui-border': 'rgba(255, 213, 95, 0.35)',
			'--ui-card': 'rgba(255, 248, 220, 0.2)',
			'--ui-card-border': 'rgba(255, 219, 128, 0.45)',
			'--button-bg': '#d69f2f',
			'--button-hover': '#b47a16',
			'--button-text': '#ffffff',
			'--title-border': 'rgba(255, 229, 143, 0.35)',
			'--body-overlay': 'rgba(19, 30, 45, 0.35)',
		},
		partly: {
			'--ui-panel': 'rgba(191, 219, 255, 0.16)',
			'--ui-border': 'rgba(148, 178, 241, 0.4)',
			'--ui-card': 'rgba(223, 235, 255, 0.22)',
			'--ui-card-border': 'rgba(173, 196, 235, 0.45)',
			'--button-bg': '#4a728f',
			'--button-hover': '#31556b',
			'--button-text': '#ffffff',
			'--title-border': 'rgba(171, 204, 237, 0.32)',
			'--body-overlay': 'rgba(14, 32, 55, 0.35)',
		},
		cloudy: {
			'--ui-panel': 'rgba(176, 182, 210, 0.16)',
			'--ui-border': 'rgba(147, 153, 180, 0.35)',
			'--ui-card': 'rgba(212, 215, 232, 0.2)',
			'--ui-card-border': 'rgba(162, 168, 196, 0.42)',
			'--button-bg': '#5a6684',
			'--button-hover': '#3b4460',
			'--button-text': '#ffffff',
			'--title-border': 'rgba(170, 177, 205, 0.32)',
			'--body-overlay': 'rgba(17, 26, 43, 0.35)',
		},
		rain: {
			'--ui-panel': 'rgba(144, 171, 196, 0.18)',
			'--ui-border': 'rgba(113, 146, 169, 0.35)',
			'--ui-card': 'rgba(180, 205, 220, 0.2)',
			'--ui-card-border': 'rgba(132, 161, 183, 0.45)',
			'--button-bg': '#3d6d84',
			'--button-hover': '#285064',
			'--button-text': '#ffffff',
			'--title-border': 'rgba(151, 182, 204, 0.32)',
			'--body-overlay': 'rgba(14, 29, 42, 0.35)',
		},
		snow: {
			'--ui-panel': 'rgba(224, 236, 255, 0.14)',
			'--ui-border': 'rgba(188, 207, 236, 0.35)',
			'--ui-card': 'rgba(242, 250, 255, 0.22)',
			'--ui-card-border': 'rgba(198, 217, 241, 0.45)',
			'--button-bg': '#5e8bbf',
			'--button-hover': '#3b6a98',
			'--button-text': '#ffffff',
			'--title-border': 'rgba(185, 208, 236, 0.32)',
			'--body-overlay': 'rgba(14, 29, 42, 0.3)',
		},
		storm: {
			'--ui-panel': 'rgba(112, 104, 149, 0.16)',
			'--ui-border': 'rgba(126, 116, 172, 0.35)',
			'--ui-card': 'rgba(140, 135, 178, 0.22)',
			'--ui-card-border': 'rgba(107, 98, 150, 0.45)',
			'--button-bg': '#5f4f8e',
			'--button-hover': '#42356b',
			'--button-text': '#ffffff',
			'--title-border': 'rgba(143, 131, 198, 0.32)',
			'--body-overlay': 'rgba(17, 21, 42, 0.4)',
		},
		mist: {
			'--ui-panel': 'rgba(200, 205, 212, 0.16)',
			'--ui-border': 'rgba(165, 170, 180, 0.35)',
			'--ui-card': 'rgba(226, 232, 239, 0.2)',
			'--ui-card-border': 'rgba(183, 190, 201, 0.45)',
			'--button-bg': '#6b7a8a',
			'--button-hover': '#4c5a69',
			'--button-text': '#ffffff',
			'--title-border': 'rgba(180, 188, 199, 0.32)',
			'--body-overlay': 'rgba(14, 24, 38, 0.35)',
		},
	};

	let chosen = theme.clear;
	if (normalized.includes('cloud') || normalized.includes('overcast') || normalized.includes('fog')) chosen = theme.cloudy;
	if (normalized.includes('partly')) chosen = theme.partly;
	if (normalized.includes('rain') || normalized.includes('drizzle') || normalized.includes('shower') || normalized.includes('sleet')) chosen = theme.rain;
	if (normalized.includes('snow') || normalized.includes('blizzard') || normalized.includes('ice')) chosen = theme.snow;
	if (normalized.includes('thunder') || normalized.includes('storm')) chosen = theme.storm;
	if (normalized.includes('mist') || normalized.includes('haze') || normalized.includes('smoke')) chosen = theme.mist;
	if (normalized.includes('sunny') || normalized.includes('clear')) chosen = theme.clear;

	Object.entries(chosen).forEach(([key, value]) => {
		root.style.setProperty(key, value);
	});
}

function isInvalidCityQuery(query) {
	const normalized = query.trim();
	if (normalized.length < 2) return true;
	const invalidChars = /[^a-zа-яіїєґёїієґь'\s,-]/iu;
	return invalidChars.test(normalized);
}

function matchesLocation(query, location) {
	const normalizedQuery = query.toLowerCase().replace(/[.,]/g, '').trim();
	const fullLocation = `${location.name}, ${location.region}, ${location.country}`.toLowerCase();
	return normalizedQuery && fullLocation.includes(normalizedQuery);
}

function enableDatePicker() {
	if (availableDates.length === 0) return;
	dateInput.disabled = false;
	dateInput.min = availableDates[0];
	dateInput.max = availableDates[availableDates.length - 1];
	dateInput.value = availableDates[0];
}

function renderSelectedDate() {
	if (!forecastData || !availableDates.length) {
		renderError('Спочатку знайдіть місто.');
		return;
	}
	const selectedDate = dateInput.value;
	const forecastDay = forecastData.forecast.forecastday.find((day) => day.date === selectedDate);

	if (!forecastDay) {
		renderError('Погода за обрану дату недоступна.');
		return;
	}

	applyWeatherTheme(forecastDay.day.condition.text);
	out.innerHTML = renderWeatherCard(forecastData.location, forecastDay.day);
}

async function fetchForecast(q) {
	try {
		const url = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(q)}&days=${MAX_FORECAST_DAYS}&aqi=no&alerts=no`;
		console.log('Fetching forecast for:', q);
		console.log('Request URL:', url);
		const res = await fetch(url);
		const text = await res.text();

		let data;
		try {
			data = text ? JSON.parse(text) : null;
		} catch (e) {
			console.warn('Response is not valid JSON:', text);
			data = null;
		}

		if (!res.ok) {
			console.error('API HTTP error', res.status, res.statusText);
			console.error('Body:', data || text);
			renderError('Error city not found');
			return;
		}

		if (data && data.error) {
			console.error('API error object:', data.error);
			if (data.error.code === 1006) {
				renderError('Error city not found');
				return;
			}
			renderError(`API: ${data.error.message}`);
			return;
		}

		if (isInvalidCityQuery(q) || !matchesLocation(q, data.location)) {
			renderError('Error city not found');
			return;
		}

		forecastData = data;
		applyWeatherTheme(data.current.condition.text);
		if (weatherVideo) {
			weatherVideo.style.display = 'block';
		}
		availableDates = data.forecast.forecastday.map((day) => day.date);
		enableDatePicker();
		renderSelectedDate();
		saveLastCity(q);
	} catch (err) {
		console.error('Fetch error:', err);
		renderError('Fetch error');
	}
}

form.addEventListener('submit', (e) => {
	e.preventDefault();
	const q = input.value.trim();
	if (!q) return;
	out.textContent = 'Завантажую...';
	fetchForecast(q);
});

dateInput.addEventListener('change', () => {
	renderSelectedDate();
});

function init() {
	const lastCity = loadLastCity();
	if (lastCity) {
		out.textContent = 'Завантажую останнє місто...';
		fetchForecast(lastCity);
	}
}

window.addEventListener('load', init);

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('sw.js').then((registration) => {
		console.log('Service Worker registered with scope:', registration.scope);
	}).catch((error) => {

		console.error('Service Worker registration failed:', error);
	});
}


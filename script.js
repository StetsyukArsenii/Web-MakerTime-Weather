// Тимчасово API ключ (заміни або тримай .env при розгортанні)
const API_KEY = '51d7d0e6b0ef4a9b8df132116260706';

console.log('script.js loaded');

const form = document.getElementById('weather-form');
const input = document.getElementById('city-input');
const out = document.getElementById('weather-output');

async function fetchCurrent(q, triedSuffix = false) {
	try {
		const url = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(q)}&aqi=no`;
		console.log('Fetching weather for:', q);
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
			// If API returned "No matching location" (code 1006), try retry with country code
			if (data && data.error && data.error.code === 1006 && !triedSuffix) {
				console.log("No matching location — retrying with ',UA'");
				return fetchCurrent(q + ',UA', true);
			}
			out.textContent = 'Помилка API — дивись консоль.';
			return;
		}

		console.log('Weather API response:', data);
		if (data && data.error) {
			console.error('API error object:', data.error);
			if (data.error.code === 1006 && !triedSuffix) {
				console.log("No matching location — retrying with ',UA'");
				return fetchCurrent(q + ',UA', true);
			}
			out.textContent = `API: ${data.error.message}`;
			return;
		}

		out.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
	} catch (err) {
		console.error('Fetch error:', err);
		out.textContent = 'Помилка запиту — дивись консоль.';
	}
}

form.addEventListener('submit', (e) => {
	e.preventDefault();
	const q = input.value.trim();
	console.log('Form submit, city:', q);
	if (!q) return;
	out.textContent = 'Завантажую...';
	fetchCurrent(q);
});

// Автоматичний приклад (можна закоментувати)
// fetchCurrent('Kyiv');

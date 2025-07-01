// favorites.js

// 1) Your API key & endpoints
const API_KEY = 'cA+A9NYqQZEASFHqHWkwxg==GR2d10JvhdnDhfVZ';
const BASE_URL = 'https://api.api-ninjas.com/v1/cars';
const UNSPLASH_ACCESS_KEY = 'BH3nnJItZLD1woey72qSdl9AYBBOpsNMAkO3qSXrtYk';
const FAVORITES_KEY = 'favoriteCars';

// 2) DOM reference
const container = document.getElementById('favorites-container');

// 3) Helper functions
function carKey(car) {
    return `${car.make}|${car.model}|${car.year}`;
}
function saveFavorites(keys) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(keys));
}

async function fetchCar(make, model, year) {
    try {
        const res = await fetch(`${BASE_URL}?make=${encodeURIComponent(make.toLowerCase())}`, {
            headers: { 'X-Api-Key': API_KEY }
        });
        const cars = await res.json();
        return cars.find(c => c.model === model && String(c.year) === year) || null;
    } catch (err) {
        console.warn('Error fetching car:', err);
        return null;
    }
}

async function fetchUnsplashImage(make, model) {
    const query = encodeURIComponent(`${make} ${model} car`);
    const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=1&client_id=${UNSPLASH_ACCESS_KEY}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
            return data.results[0].urls.small;
        }
    } catch (err) {
        console.warn('Unsplash fetch error:', err);
    }
    return null;
}

function showNoFavorites() {
    container.innerHTML = `<p class="text-center text-white mt-5">No favorite cars added yet.</p>`;
}

function renderFavoriteCar(car, key, imgSrc) {
    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6 mb-4';
    col.innerHTML = `
    <div class="card shadow-lg car-card h-100 position-relative overflow-hidden transition-card">
      <img src="${imgSrc}" class="card-img-top" alt="${car.make} ${car.model}">
      <div class="card-body d-flex flex-column p-3">
        <h5 class="card-title mb-1 text-white">${car.make} ${car.model}</h5>
        <small class="mb-2 text-muted">${car.year}</small>
        <p class="car-detail mb-1"><i class="bi bi-fuel-pump-fill"></i> ${car.fuel_type}</p>
        <p class="car-detail mb-1"><i class="bi bi-gear-wide-connected"></i> ${car.transmission === 'a' ? 'Automatic' : 'Manual'}</p>
        <p class="car-detail mb-3"><i class="bi bi-arrow-left-right"></i> ${car.drive.toUpperCase()}</p>
        <button class="btn btn-outline-danger btn-sm mt-auto remove-fav" data-key="${key}">Remove</button>
      </div>
    </div>`;
    container.appendChild(col);
}

// 4) Load & render favorites
async function loadFavorites() {
    const keys = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    if (keys.length === 0) {
        showNoFavorites();
        return;
    }
    container.innerHTML = '';
    for (const key of keys) {
        const [make, model, year] = key.split('|');
        const car = await fetchCar(make, model, year) || { make, model, year, fuel_type: 'N/A', transmission: 'n', drive: 'n' };
        let imgSrc = await fetchUnsplashImage(car.make, car.model);
        if (!imgSrc) imgSrc = 'assets/images/placeholder_car.png';
        renderFavoriteCar(car, key, imgSrc);
    }
}

document.addEventListener('DOMContentLoaded', loadFavorites);

// 5) Remove with animation on the card (not the column)
container.addEventListener('click', e => {
    if (e.target.classList.contains('remove-fav')) {
        const key = e.target.dataset.key;
        let keys = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
        keys = keys.filter(k => k !== key);
        saveFavorites(keys);
        const card = e.target.closest('.card.transition-card');
        card.classList.add('removing');
        card.addEventListener('transitionend', () => {
            // remove the parent .col- wrapper
            const col = card.closest('.col-lg-4, .col-md-6');
            if (col) col.remove();
            if (keys.length === 0) showNoFavorites();
        }, { once: true });
    }
});

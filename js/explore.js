// explore.js

// 0) Your API key & endpoint
const API_KEY = 'cA+A9NYqQZEASFHqHWkwxg==GR2d10JvhdnDhfVZ';
const BASE_URL = 'https://api.api-ninjas.com/v1/cars';
const UNSPLASH_ACCESS_KEY = 'BH3nnJItZLD1woey72qSdl9AYBBOpsNMAkO3qSXrtYk';

// 1) Curated list of popular makes
const popularMakes = [
    'Toyota', 'Ford', 'Honda', 'Chevrolet',
    'BMW', 'Mercedes-Benz', 'Tesla', 'Audi',
    'Volkswagen', 'Nissan'
];

// 2) State
let allCars = [];   // full fetched list of cars
let filteredCars = []; // what’s currently being shown

// 3) DOM references
const container = document.getElementById('carCardsContainer');
const filterMake = document.getElementById('filterMake');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const spinner = document.getElementById('loadingSpinner');

function showSpinner() {
    spinner.classList.remove('d-none');
}

function hideSpinner() {
    spinner.classList.add('d-none');
}

// 4) Populate the “Makes” dropdown
function populateMakeDropdown() {
    filterMake.innerHTML = `<option value="">All Makes</option>`;
    popularMakes.forEach(make => {
        const opt = document.createElement('option');
        opt.value = make;
        opt.textContent = make;
        filterMake.appendChild(opt);
    });
}

// 5) Fetch one representative car for each popular make
async function loadInitialCars() {
    showSpinner();             // ← show before you start fetching
    allCars = [];

    for (const make of popularMakes) {
        try {
            const res = await fetch(`${BASE_URL}?make=${encodeURIComponent(make.toLowerCase())}`, {
                headers: {'X-Api-Key': API_KEY}
            });
            const cars = await res.json();
            if (cars.length) allCars.push(cars[0]);
        } catch (err) {
            console.warn(`Failed to fetch ${make}`, err);
        }
    }

    filteredCars = allCars.slice();
    await renderCars(filteredCars);
    hideSpinner();             // ← hide when rendering is done
}


// 6) Render a list of car objects into the grid
async function renderCars(list) {
    container.innerHTML = '';
    if (list.length === 0) {
        container.innerHTML = `<p class="text-center text-white">No cars found.</p>`;
        return;
    }


    for (const car of list) {
        const col = document.createElement('div');
        col.className = 'col-sm-6 col-lg-4';
        let imgSrc = await fetchUnsplashImage(car.make, car.model);
        if (!imgSrc) imgSrc = 'assets/images/placeholder_car.png';

        col.innerHTML = `
  <div class="card car-card bg-dark text-white h-100 border-0 position-relative">
    <!-- favorite star -->
    <button class="btn-favorite" data-car='${JSON.stringify(car)}'>
      <i class="bi ${isFavorited(car) ? 'bi-star-fill' : 'bi-star'}"></i>
    </button>

    <img src="${imgSrc}"
         class="card-img-top car-card-img"
         alt="${car.make} ${car.model}">
    <div class="card-body d-flex flex-column">
      <h5 class="card-title mb-1">${car.make} ${car.model}</h5>
      <small class="text-muted mb-2">${car.year}</small>
      <p class="mb-1">
        <i class="bi bi-fuel-pump-fill"></i> ${car.fuel_type}
        &nbsp;|&nbsp;
        <i class="bi bi-gear-wide-connected"></i>
        ${car.transmission === 'a' ? 'Auto' : 'Manual'}
      </p>
      <p class="mb-3">
        <i class="bi bi-arrow-left-right"></i>
        ${car.drive.toUpperCase()}
      </p>
      <button class="btn btn-outline-light mt-auto btn-sm view-details"
              data-car='${JSON.stringify(car)}'>
        View Details
      </button>
    </div>
  </div>`;

        container.appendChild(col);
    }
}

// 7) Apply the current make filter + search term, then re-render
function applyFilters() {
    const makeQuery = filterMake.value;
    const termQuery = searchInput.value.trim().toLowerCase();

    // 1️⃣ Start with allCars
    let result = allCars.slice();

    // 2️⃣ If a make is selected, narrow to that make
    if (makeQuery) {
        result = result.filter(c => c.make.toLowerCase() === makeQuery.toLowerCase());
    }

    // 3️⃣ If a search term is present, filter by substring in the model
    if (termQuery) {
        result = result.filter(c =>
            c.model.toLowerCase().includes(termQuery)
        );
    }

    // 4️⃣ Render
    filteredCars = result;
    renderCars(filteredCars);
}

// 8) Wire up events
filterMake.addEventListener('change', applyFilters);
searchBtn.addEventListener('click', applyFilters);
searchInput.addEventListener('keyup', e => {
    if (e.key === 'Enter') applyFilters();
});

// 9) Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // 1) fill the top-picks carousel
    populateTopPicksCarousel();
    populateMakeDropdown();
    loadInitialCars();
});

// after renderCars or in your DOMContentLoaded

// 1) Grab modal instance
const detailModal = new bootstrap.Modal(
    document.getElementById('carDetailModal')
);

container.addEventListener('click', e => {
    // 1) Favorite toggle
    const favBtn = e.target.closest('.btn-favorite');
    if (favBtn) {
        const car = JSON.parse(favBtn.dataset.car);
        toggleFavorite(car);
        const icon = favBtn.querySelector('i');
        icon.classList.toggle('bi-star');
        icon.classList.toggle('bi-star-fill');

    }
})

// 2) Delegate click on “View Details”
container.addEventListener('click', e => {
    const btn = e.target.closest('.view-details');
    if (!btn) return;

    const car = JSON.parse(btn.dataset.car);
    // fill modal
    document.getElementById('carDetailLabel').textContent =
        `${car.make} ${car.model}`;
    document.getElementById('detail-img').src =
        car.image || 'assets/images/placeholder_car.png'; // if you fetched one
    document.getElementById('detail-year').textContent = car.year;
    document.getElementById('detail-class').textContent = car.class;
    document.getElementById('detail-fuel').textContent = car.fuel_type;
    document.getElementById('detail-trans').textContent =
        car.transmission === 'a' ? 'Automatic' : 'Manual';
    document.getElementById('detail-drive').textContent = car.drive;
    document.getElementById('detail-cyl').textContent = car.cylinders;
    document.getElementById('detail-displ').textContent = car.displacement;

    detailModal.show();
});

async function fetchUnsplashImage(make, model) {
    const query = encodeURIComponent(`${make} ${model} car`);
    const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=1&client_id=${UNSPLASH_ACCESS_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    // if we got at least one result, return the small-ish URL
    if (data.results && data.results.length > 0) {
        return data.results[0].urls.small;
    }
    // fallback to null if nothing found
    return null;
}

// 1) Define your Top-Picks data
const topPicks = [
    {make: 'Hyundai', model: 'Ioniq 5', year: 2022, type: 'Electric', price: 85990},
    {make: 'Audi', model: 'R8', year: 2023, type: 'Supercar', price: 204000},
    {make: 'Chevrolet', model: 'Camaro', year: 2021, type: 'Hybrid', price: 62500}
];

// 2) Populate the carousel dynamically
async function populateTopPicksCarousel() {
    const inner = document.querySelector('#topPicksCarousel .carousel-inner');
    inner.innerHTML = '';  // clear the static markup

    for (let i = 0; i < topPicks.length; i++) {
        const pick = topPicks[i];
        // fetch an Unsplash image (fallback to bundled JPG)
        let imgSrc = await fetchUnsplashImage(pick.make, pick.model);
        if (!imgSrc) {
            imgSrc = `assets/images/${pick.model.toLowerCase().replace(/\s+/g, '_')}.jpg`;
        }

        // build the carousel-item
        const item = document.createElement('div');
        item.className = `carousel-item${i === 0 ? ' active' : ''}`;

        item.innerHTML = `
      <div class="card car-card bg-dark text-white mx-auto position-relative" style="width: 16rem;">
        <!-- Favorite star -->
        <button class="btn-favorite" data-car='${JSON.stringify(pick)}'>
          <i class="bi ${isFavorited(pick) ? 'bi-star-fill' : 'bi-star'}"></i>
        </button>
        <img src="${imgSrc}"
             class="card-img-top car-card-img"
             alt="${pick.make} ${pick.model}">
        <div class="card-body">
          <h5 class="card-title">${pick.make} ${pick.model}</h5>
          <p class="card-text">
            ${pick.year} • ${pick.type} • $${pick.price.toLocaleString()}
          </p>
          <button class="btn btn-orange view-details"
                  data-car='${JSON.stringify(pick)}'>
            View Details
          </button>
        </div>
      </div>`;

        inner.appendChild(item);
    }
}


// FAVORITES
const FAVORITES_KEY = 'favoriteCars';
let favoriteCars = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];

function saveFavorites() {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteCars));
}

function carKey(car) {
    // unique key per car
    return `${car.make}|${car.model}|${car.year}`;
}

function isFavorited(car) {
    return favoriteCars.includes(carKey(car));
}

function toggleFavorite(car) {
    const key = carKey(car);
    const idx = favoriteCars.indexOf(key);
    if (idx > -1) favoriteCars.splice(idx, 1);
    else favoriteCars.push(key);
    saveFavorites();
}




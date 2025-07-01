// compare.js

const API_KEY  = 'cA+A9NYqQZEASFHqHWkwxg==GR2d10JvhdnDhfVZ';
const BASE_URL    = 'https://api.api-ninjas.com/v1/cars';
let selectedCars  = []; // in-memory array of full car objects

document.addEventListener('DOMContentLoaded', () => {
    buildPickerUI();
    renderComparison();
});

function buildPickerUI() {
    const main = document.querySelector('main.container');
    const picker = document.createElement('div');
    picker.className = 'car-picker';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search models (e.g. "Civic, Accord, M3..")';
    picker.appendChild(input);

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add Car';
    addBtn.disabled = true;
    picker.appendChild(addBtn);

    main.insertBefore(picker, main.querySelector('.compare-card'));

    const selDiv = document.createElement('div');
    selDiv.className = 'selected-cars';
    main.insertBefore(selDiv, picker.nextSibling);

    input.addEventListener('input', () => {
        addBtn.disabled = !input.value.trim() || selectedCars.length >= 3;
    });

    addBtn.addEventListener('click', async () => {
        const model = input.value.trim();
        if (!model || selectedCars.length >= 3) return;
        const car = await fetchCarBy({ model });
        if (car && !selectedCars.some(c => c.make===car.make && c.model===car.model && c.year===car.year)) {
            selectedCars.push(car);
            input.value = '';
            addBtn.disabled = true;
            renderSelectedCars();
            renderComparison();
        } else {
            alert('No new car found for that model.');
        }
    });
}

function renderSelectedCars() {
    const selDiv = document.querySelector('.selected-cars');
    selDiv.innerHTML = '';
    selectedCars.forEach((car, i) => {
        const div = document.createElement('div');
        div.className = 'selected-car';
        div.textContent = `${car.make} ${car.model} ${car.year}`;
        const btn = document.createElement('button');
        btn.textContent = '×';
        btn.title = 'Remove';
        btn.addEventListener('click', () => {
            selectedCars.splice(i, 1);
            renderSelectedCars();
            renderComparison();
        });
        div.appendChild(btn);
        selDiv.appendChild(div);
    });
}

/**
 * Fetches the first matching car for given params.
 */
async function fetchCarBy(params) {
    const qs = new URLSearchParams(params).toString();
    try {
        const res  = await fetch(`${BASE_URL}?${qs}`, {
            headers: { 'X-Api-Key': API_KEY }
        });
        const data = await res.json();
        return data[0] || null;
    } catch (e) {
        console.error('Fetch error:', e);
        return null;
    }
}

function renderComparison() {
    // grab by class, or any table inside .compare-card
    const table = document.querySelector('.comparison-table')
        || document.querySelector('.compare-card table');
    if (!table) return;

    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');

    // rebuild headers
    thead.innerHTML = '';
    thead.appendChild(createTH('Feature'));
    selectedCars.forEach(c => {
        thead.appendChild(createTH(`${c.make} ${c.model} ${c.year}`));
    });
    thead.appendChild(createTH('Difference'));

    // gather all keys from response objects
    const keySet = new Set();
    selectedCars.forEach(c => Object.keys(c).forEach(k => keySet.add(k)));
    ['make', 'model', 'year'].forEach(k => keySet.delete(k));

    const features = Array.from(keySet);

    // populate rows
    tbody.innerHTML = '';
    if (features.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${selectedCars.length + 2}">No data fields available.</td></tr>`;
        return;
    }

    features.forEach(fKey => {
        const label = fKey
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());

        const tr = document.createElement('tr');
        tr.appendChild(createTD(label));

        const vals = selectedCars.map(c => c[fKey] != null ? c[fKey] : '—');
        vals.forEach(v => tr.appendChild(createTD(v)));

        // difference := last car’s value minus first car’s value
        const diffTD = createTD('', true);
        const first = selectedCars[0][fKey];
        const last  = selectedCars[selectedCars.length - 1][fKey];
        if (typeof first === 'number' && typeof last === 'number') {
            const diff = last - first;
            diffTD.textContent = (diff > 0 ? '+' : '') + diff;
            diffTD.classList.add(diff > 0 ? 'difference-positive' : 'difference-negative');
        } else {
            diffTD.textContent = '—';
        }
        tr.appendChild(diffTD);

        tbody.appendChild(tr);
    });
}

function createTH(txt) {
    const th = document.createElement('th');
    th.scope        = 'col';
    th.textContent  = txt;
    return th;
}

function createTD(txt, isBold = false) {
    const td = document.createElement('td');
    if (isBold) td.classList.add('fw-bold');
    td.textContent = txt;
    return td;
}

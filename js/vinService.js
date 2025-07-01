// js/vinService.js

const API_KEY     = 'cA+A9NYqQZEASFHqHWkwxg==GR2d10JvhdnDhfVZ';
const proxy       = 'https://cors-anywhere.herokuapp.com/';
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;
const FREE_FIELDS = ['vin','country','region','wmi','vds','vis','year'];

async function lookupVIN(vin) {
    const url = `https://api.api-ninjas.com/v1/vinlookup?vin=${encodeURIComponent(vin)}`;
    let response;
    try {
        response = await fetch(proxy + url, {
            method: 'GET',
            headers: { 'X-Api-Key': API_KEY }
        });
    } catch (networkErr) {
        throw new Error(`Network error: ${networkErr.message}`);
    }

    const text = await response.text();
    console.log('VIN API response:', response.status, text);

    if (!response.ok) {
        throw new Error(`API error ${response.status}: ${text}`);
    }

    try {
        return JSON.parse(text);
    } catch (parseErr) {
        throw new Error(`Invalid JSON: ${parseErr.message}`);
    }
}

document.getElementById('vin-submit').addEventListener('click', async () => {
    const rawVin        = document.getElementById('vin-input').value.trim();
    const vin           = rawVin.toUpperCase();
    const reportSection = document.getElementById('vin-report');
    const contentDiv    = document.getElementById('report-content');

    // 1. Validate format
    if (!VIN_PATTERN.test(vin)) {
        contentDiv.innerHTML = `
      <div class="alert alert-warning">
        Please enter a valid 17-character VIN (A–H, J–N, P–R, S–Z and 0–9).
      </div>`;
        reportSection.classList.remove('d-none');
        return;
    }

    // 2. Show loading
    reportSection.classList.add('d-none');
    contentDiv.innerHTML = '<p>Loading...</p>';

    // 3. Fetch and display only free-tier fields
    try {
        const data = await lookupVIN(vin);
        const rows = FREE_FIELDS
            .filter(key => key in data)
            .map(key => `<p><strong>${key}:</strong> ${data[key]}</p>`)
            .join('');
        contentDiv.innerHTML = rows || '<div class="alert alert-info">No data found for this VIN.</div>';
    } catch (err) {
        console.error('Lookup failed:', err);
        contentDiv.innerHTML = `
      <div class="alert alert-danger">
        <strong>Error:</strong> ${err.message}
      </div>`;
    } finally {
        reportSection.classList.remove('d-none');
    }
});

document.getElementById('download-pdf').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc       = new jsPDF();
    const content   = document.getElementById('report-content').innerText;
    const lines     = doc.splitTextToSize(content, 180);
    doc.text(lines, 10, 10);
    doc.save('vin-report.pdf');
});

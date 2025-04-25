let allDoctors = []; // will store full API data
let filteredDoctors = []; // will store filtered data after applying filters

// Fetch data from the API
async function fetchData() {
  try {
    const response = await fetch('https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json');
    allDoctors = await response.json();
    filteredDoctors = [...allDoctors]; // Initially, no filter is applied
    renderDoctors(filteredDoctors.slice(0, 10)); // Show top 10 doctors by default
    setupFilters(); // Initialize filters
  } catch (error) {
    console.error('API fetch error:', error);
  }
}

// Render doctors to cards
function renderDoctors(doctors) {
  const container = document.getElementById('card-container');
  container.innerHTML = ''; // Clear previous doctors
  if (doctors.length === 0) {
    container.innerHTML = '<p>No doctors found based on the applied filters.</p>';
    return;
  }
  doctors.forEach(item => {
    const specialties = item.specialities.map(s => s.name).join(', '); // Join multiple specialties
    const languages = item.languages.join(', '); // Join languages
    const clinic = item.clinic ? item.clinic.name : 'N/A';
    const consultationModes = [];
    if (item.video_consult) consultationModes.push('Video Consult');
    if (item.in_clinic) consultationModes.push('In Clinic');
    const modes = consultationModes.join(', ') || 'N/A';

    container.innerHTML += `
      <div class="col-md-4 mb-4" data-testid="doctor-card">
        <div class="card h-100 shadow-sm">
          <img src="${item.photo}" alt="${item.name}" class="card-img-top" />
          <div class="card-body">
            <h5 class="card-title" data-testid="doctor-name">${item.name}</h5>
            <p class="card-text" data-testid="doctor-introduction">${item.doctor_introduction}</p>
            <p class="card-text" data-testid="doctor-specialty"><strong>Specialities:</strong> ${specialties}</p>
            <p class="card-text" data-testid="doctor-experience"><strong>Experience:</strong> ${item.experience}</p>
            <p class="card-text" data-testid="doctor-fee"><strong>Fees:</strong> ${item.fees}</p>
            <p class="card-text" data-testid="doctor-languages"><strong>Languages:</strong> ${languages}</p>
            <p class="card-text" data-testid="doctor-clinic"><strong>Clinic:</strong> ${clinic}</p>
            <p class="card-text" data-testid="doctor-consultation"><strong>Consultation Mode:</strong> ${modes}</p>
          </div>
        </div>
      </div>
    `;
  });
}

// Setup autocomplete and search functionality
function setupSearch() {
  const input = document.getElementById('searchInput');
  const suggestions = document.getElementById('suggestionList');

  input.addEventListener('input', () => {
    const query = input.value.toLowerCase().trim();
    suggestions.innerHTML = '';

    if (query === '') {
      renderDoctors(filteredDoctors.slice(0, 10)); // Show top 10 filtered doctors
      return;
    }

    const matched = filteredDoctors.filter(d => d.name.toLowerCase().includes(query));

    // Autocomplete suggestions (max 3)
    matched.slice(0, 3).forEach(doc => {
      const li = document.createElement('li');
      li.className = 'list-group-item suggestion';
      li.textContent = doc.name;
      li.setAttribute('data-testid', 'suggestion-item');
      li.addEventListener('click', () => {
        input.value = doc.name;
        suggestions.innerHTML = '';
        renderDoctors([doc]);
      });
      suggestions.appendChild(li);
    });

    // Render full matches below
    renderDoctors(matched);
  });
}

// Setup filters (Speciality, Consultation Mode)
function setupFilters() {
  // Apply filters when any filter changes
  document.querySelectorAll('.form-check-input').forEach(input =>
    input.addEventListener('change', applyFilters)
  );
}

// Apply filters to the doctors data
function applyFilters() {
  const searchQuery = document.getElementById('searchInput').value.toLowerCase().trim();
  const selectedSpecialties = Array.from(document.querySelectorAll('input[type=checkbox]:checked')).map(cb => cb.value);
  const selectedMode = document.querySelector('input[name="consultationMode"]:checked')?.value;

  // Start with all doctors
  let filtered = [...allDoctors];

  // Apply Speciality Filter
  if (selectedSpecialties.length > 0) {
    filtered = filtered.filter(d => d.specialities.some(s => selectedSpecialties.includes(s.name)));
  }

  // Apply Consultation Mode Filter
  if (selectedMode) {
    filtered = filtered.filter(d => {
      const modes = [];
      if (d.video_consult) modes.push('Video Consult');
      if (d.in_clinic) modes.push('In Clinic');
      return modes.includes(selectedMode);
    });
  }

  // Apply Search Filter on top of the filtered list
  if (searchQuery) {
    filtered = filtered.filter(d => d.name.toLowerCase().includes(searchQuery));
  }

  // Store the filtered list
  filteredDoctors = filtered;

  // Display the applied filters
  displayAppliedFilters(selectedSpecialties, selectedMode);

  // Render doctors after applying both search and filters
  renderDoctors(filteredDoctors.slice(0, 10)); // Show top 10 doctors
}

// Display applied filters on the page
function displayAppliedFilters(selectedSpecialties, selectedMode) {
  const filterContainer = document.getElementById('applied-filters');
  filterContainer.innerHTML = ''; // Clear existing filters

  if (selectedSpecialties.length > 0) {
    const specialtiesText = selectedSpecialties.join(', ');
    const specialtyDiv = document.createElement('div');
    specialtyDiv.textContent = `Specialities: ${specialtiesText}`;
    filterContainer.appendChild(specialtyDiv);
  }

  if (selectedMode) {
    const modeDiv = document.createElement('div');
    modeDiv.textContent = `Consultation Mode: ${selectedMode}`;
    filterContainer.appendChild(modeDiv);
  }

  if (selectedSpecialties.length === 0 && !selectedMode) {
    const noFilterDiv = document.createElement('div');
    noFilterDiv.textContent = 'No filters applied';
    filterContainer.appendChild(noFilterDiv);
  }
}

fetchData(); // Fetch data when the page loads
setupSearch(); // Initialize search functionality

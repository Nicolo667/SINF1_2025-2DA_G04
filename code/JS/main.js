// WE NEED TO PUT THIS DATA INTO A DATABASE AND CONNECT IT TO THESE FUNCTIONS!!!

// Data for Events
const eventsData = [
    { title: "Serenata Monumental", date: "May 15", time: "23:59", location: "Sé do Porto", type: "Tradition" },
    { title: "Concert Night", date: "May 16", time: "22:00", location: "Queimódromo", type: "Music" },
    { title: "Cortejo Académico", date: "May 19", time: "14:00", location: "Baixa", type: "Tradition" },
    { title: "DJ Set - Sunset", date: "May 20", time: "18:00", location: "Queimódromo", type: "Music" }
];

// Data for Tents
const tentsData = [
    { name: "FEUP Tent", faculty: "Engineering", highlights: "Techno & Light Shows" },
    { name: "FMUP Tent", faculty: "Medicine", highlights: "Pop Classics" },
    { name: "FEP Tent", faculty: "Economics", highlights: "Live DJ Sets" }
];


function renderEvents(filter = 'all') {
    const grid = document.getElementById('events-grid'); // select the id of the correct position in html page
    grid.innerHTML = ''; // Clear current grid

    const filtered = filter === 'all' // decide whitch event shows 
        ? eventsData 
        : eventsData.filter(e => e.type === filter);

    filtered.forEach(event => { // if the filter is not 'all' create new list
        grid.innerHTML += `
            <div class="card">
                <span class="category">${event.type}</span>
                <h3>${event.title}</h3>
                <p>📍 ${event.location}</p>
                <p>⏰ ${event.date}, ${event.time}</p>
            </div>
        `;
    });
}

function renderTents() { // generate all the tents 
    const grid = document.getElementById('tents-grid');
    tentsData.forEach(tent => {
        grid.innerHTML += `
            <div class="card">
                <span class="category">${tent.faculty}</span>
                <h3>${tent.name}</h3>
                <p>Don't miss: ${tent.highlights}</p>
            </div>
        `;
    });
}

function filterEvents(type) {
    // Update button styling
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === type || (type === 'all' && btn.textContent === 'All')) {
            btn.classList.add('active');
        }
    });
    
    renderEvents(type);
}

// to see all data in the page
window.onload = () => {
    renderEvents();
    renderTents();
};


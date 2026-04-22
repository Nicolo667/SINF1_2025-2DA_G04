let eventsData = [];

async function loadData() {
    const response = await fetch('../PHP/events.php');
    const data = await response.json();
    eventsData = data.events;
    renderEvents();
    // renderTents(data.tents); // Removed tents rendering for now...
}

function renderEvents(filter = 'all') {
    const grid = document.getElementById('events-grid');
    grid.innerHTML = '';

    let filtered; // how to filter events based on the selected category.
    if (filter === 'all') {
        filtered = eventsData;
    } else if (filter === 'Music') {
        filtered = eventsData.filter(e => e.type === 'Concert' || e.type === 'Party');
    } else if (filter === 'Tradition') {
        filtered = eventsData.filter(e => e.type === 'Workshop' || e.type === 'Conference' || e.type === 'Cerimony');
    } else {
        filtered = eventsData.filter(e => e.type === filter);
    }

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #666;">No events found for this category.</p>';
    } else {
        filtered.forEach(event => {
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
}

function renderTents(tents) {
    const grid = document.getElementById('tents-grid');
    tents.forEach(tent => {
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
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === type || (type === 'all' && btn.textContent === 'All')) {
            btn.classList.add('active');
        }
    });
    renderEvents(type);
}

window.onload = loadData;

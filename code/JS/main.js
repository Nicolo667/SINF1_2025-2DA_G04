let eventsData = [];

async function loadData() {
    const response = await fetch('../PHP/events.php');
    const data = await response.json();
    eventsData = data.events;
    renderEvents();
    renderTents(data.tents);
}

function renderEvents(filter = 'all') {
    const grid = document.getElementById('events-grid');
    grid.innerHTML = '';

    const filtered = filter === 'all'
        ? eventsData
        : eventsData.filter(e => e.type === filter);

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

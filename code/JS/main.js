document.addEventListener('DOMContentLoaded', () => {
    // profile button (it check if the user is logged or not)
    const profileBtn = document.querySelector('.profile-btn');
    if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
            if (!localStorage.getItem('userRole')) {
                e.preventDefault();
                alert("You must log in to access your profile.");
                window.location.href = 'loginPage.html';
            }
        });
    }

    loadMainPageData(); // create the structure of main page.
});

let allEvents = []; // list of events.

function loadMainPageData() {
    const eventsContainer = document.getElementById('events-grid');
    const tentsContainer = document.getElementById('tents-grid');

    // upload the events in the main page.
    const eventFormData = new FormData();
    eventFormData.append('action', 'getMainEvents');

    fetch('../PHP/controller.php', { method: 'POST', body: eventFormData }) //call the php controller to get the events.
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            allEvents = data.events;
            renderFilteredEvents('all');  // show all the events in the beginning.
            setupFilters();
        }
    });

    // upload the tents in the main page.
    const tentFormData = new FormData();
    tentFormData.append('action', 'getTents');

    fetch('../PHP/controller.php', { method: 'POST', body: tentFormData }) // take the tents from the db (call the controller).
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success' && tentsContainer) {
            // if there are some tents, show them.
            if (data.tents && data.tents.length > 0) {
                tentsContainer.innerHTML = data.tents.map(t => renderTentCard(t)).join('');
            } else {
                tentsContainer.innerHTML = '<p>No tents available.</p>';
            }
        }
    })
    .catch(err => console.error("Errore tende:", err));
}

function setupFilters() { // set up the filter botton.
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            buttons.forEach(b => b.classList.remove('active')); // remove the active class from all buttons.
            this.classList.add('active');
            renderFilteredEvents(this.innerText.trim());
        });
    });
}

function renderFilteredEvents(filter) { // show the events according to the filter.
    const container = document.getElementById('events-grid');
    if (!container) return;

    let filtered = allEvents;
    const f = filter.toLowerCase();

    if (f === 'music') { // if the user click on music, show only the music events.
        filtered = allEvents.filter(e => e.type.toLowerCase().includes('concert') || e.type.toLowerCase().includes('party'));
    } else if (f === 'tradition') {
        filtered = allEvents.filter(e => !e.type.toLowerCase().includes('concert') && !e.type.toLowerCase().includes('party'));
    }

    container.innerHTML = filtered.map(e => renderEventCard(e)).join('');
}

function renderEventCard(event) { // create the card for the events.
    return `
        <article class="card">
            <div class="category">${event.type}</div>
            <h3>${event.title}</h3>
            <div style="margin: 1rem 0; font-size: 0.9rem; color: #666;">
                <p><strong>📅 Date:</strong> ${event.event_date}</p>
                <p><strong>⏰ Time:</strong> ${event.event_time}</p>
                <p><strong>📍 Location:</strong> ${event.location}</p>
            </div>
            <p>${event.description || ''}</p>
        </article>
    `;
}

function renderTentCard(tent) { // create the card for the tents.
    return ` 
        <article class="card">
            <div class="category">Faculty Tent</div>
            <h3>${tent.name}</h3>
            
            <div style="margin: 1rem 0; font-size: 0.9rem; color: #555;">
                <p><strong>📍 Location:</strong> ${tent.location}</p>
                <p><strong>🕒 Hours:</strong> ${tent.opening_time.substring(0,5)} - ${tent.closing_time.substring(0,5)}</p>
            </div>

            <div style="border-top: 1px solid #eee; padding-top: 1rem; margin-top: 1rem;">
                <p style="font-style: italic; color: #666;">${tent.description || 'No description available.'}</p>
            </div>
        </article>
    `;
}

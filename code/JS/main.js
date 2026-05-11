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

    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    const searchInput = document.getElementById('eventSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }

    const sortSelect = document.getElementById('eventSort');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            loadMainPageData(e.target.value); 
        });
    }

    loadMainPageData(); // create the structure of main page.
});

let allEvents = []; // list of events.

function loadMainPageData(sortOrder = 'date_asc') {
    const eventsContainer = document.getElementById('events-grid');
    const tentsContainer = document.getElementById('tents-grid');

    if (eventsContainer) eventsContainer.innerHTML = ''; // clean the container before doing all the operations.
    if (tentsContainer) tentsContainer.innerHTML = ''; // clean also the tents container

    // upload the events in the main page.
    const eventFormData = new FormData();
    eventFormData.append('action', 'getAllEvents'); // call the new controller function. 
    eventFormData.append('sort', sortOrder);

    fetch('../PHP/controller.php', { method: 'POST', body: eventFormData }) //call the php controller to get the events.
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            allEvents = data.events;

            const activeFilterBtn = document.querySelector('.filter-btn.active'); // mantain the filter 
            const currentFilter = activeFilterBtn ? activeFilterBtn.innerText.trim() : 'all';

            renderFilteredEvents('all');  // show all the events in the beginning.
            setupFilters();
        }
    });

    // upload the tents in the main page.
    const tentFormData = new FormData();
    tentFormData.append('action', 'getTents');
    tentFormData.append('sort', sortOrder);

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
            renderFilteredEvents(this.getAttribute('data-filter'));
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
    // change the first line, when we click on the card we go to the event own page.
    const stars = event.avg_rating ? `⭐ ${event.avg_rating}` : "No ratings yet"; //add the stars on the main page.

    return `
        <article class="card" onclick="window.location.href='eventDetails.html?id=${event.id}'" style="cursor: pointer;"> 
            <div class="category">${event.type}</div>
            <h3>${event.title}</h3>
            <div class="rating-badge" style="font-size: 0.85rem; font-weight: bold; color: #444; background: #f0f0f0; padding: 2px 8px; border-radius: 12px;">
                    ${stars}
            </div>
            <div style="margin: 1rem 0; font-size: 0.9rem; color: #666;">
                <p><strong>📅 Date:</strong> ${event.event_date}</p>
                <p><strong>⏰ Time:</strong> ${event.event_time.substring(0,5)}</p>
                <p><strong>📍 Location:</strong> ${event.location}</p>
            </div>
            <p>${event.description || ''}</p>
        </article>
    `;
}

function renderTentCard(tent) { // create the card for the tents.
    const avgRating = tent.avg_rating ? tent.avg_rating : "0.0";
    
    // create the 5 stars 
    let starsHtml = '';
    for (let i = 5; i >= 1; i--) {
        starsHtml += `<span class="star" onclick="submitTentRating(${tent.id}, ${i})" style="cursor:pointer; font-size: 1.2rem; color: #ccc;">★</span>`;
    }

    return ` 
        <article class="card">
            <div class="category">Faculty Tent</div>
            <h3>${tent.name}</h3>
            <span class="rating-badge">⭐ ${avgRating}</span>

            <div style="margin: 1rem 0; font-size: 0.9rem; color: #555;">
                <p><strong>📍 Location:</strong> ${tent.location}</p>
                <p><strong>🕒 Hours:</strong> ${tent.opening_time.substring(0,5)} - ${tent.closing_time.substring(0,5)}</p>
            </div>

            <div style="border-top: 1px solid #eee; padding-top: 1rem; margin-top: 1rem;">
                <p style="font-style: italic; color: #666;">${tent.description || 'No description available.'}</p>
            </div>

            <div class="rating-section" style="border-top: 1px solid #eee; padding-top: 1rem; margin-top: 1rem; text-align: center;">
                <p style="font-size: 0.8rem; margin-bottom: 5px; color: #777;">Rate this tent:</p>
                <div class="stars-container">${starsHtml}</div>
            </div>
        </article>
    `;
}

function performSearch() {
    const input = document.getElementById('eventSearch');
    if (!input) return;

    const searchTerm = input.value.toLowerCase().trim();
    if (searchTerm === "") return;

    // important to reset all the filter cause if is not like this the bar couldn't find some events
    renderFilteredEvents('all'); 
    
    // btn All active
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.toLowerCase() === 'all') {
            btn.classList.add('active');
        }
    });

    const allCards = document.querySelectorAll('article.card');
    let found = false;

    for (let card of allCards) {
        const titleElement = card.querySelector('h3');
        if (!titleElement) continue;

        const title = titleElement.innerText.toLowerCase();

        if (title.includes(searchTerm)) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // change the effect of the card when finds it
            card.style.transition = "all 0.4s ease";
            card.style.outline = "4px solid #f5c518"; 
            card.style.transform = "scale(1.02)";
            
            setTimeout(() => {
                card.style.outline = "none";
                card.style.transform = "scale(1)";
            }, 3000);

            found = true;
            break; // stop when find the first match
        }
    }

    if (!found) {
        alert("No results found for '" + searchTerm + "'");
    }
}

function submitTentRating(tentId, score) {
    const userId = localStorage.getItem('userId'); 
    

    const formData = new FormData();
    formData.append('action', 'rateTent');
    formData.append('user_id', userId);
    formData.append('tent_id', tentId);
    formData.append('score', score);

    fetch('../PHP/controller.php', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            alert(data.message);
            loadMainPageData(); // Rrecall to show the new avg.
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(err => console.error("Error rating tent:", err));
}

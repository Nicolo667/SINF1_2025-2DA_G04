document.addEventListener('DOMContentLoaded', () => {
    // profile button (it check if the user is logged or not)
    const profileBtn = document.querySelector('.profile-btn');
    if (profileBtn) { // to avoid that the page crash if doesn't find the btn
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

    // we can use also the 'enter' on the keyboard
    const searchInput = document.getElementById('eventSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }

    const sortSelect = document.getElementById('eventSort');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => { // when we change the type of sort
            loadMainPageData(e.target.value); // call the value in html cause we change it
        });
    }

    loadMainPageData(); // create the structure of main page.
});

function loadMainPageData(sortOrder = 'date_asc') { // default sorting 
    const eventsContainer = document.getElementById('events-grid');
    const tentsContainer = document.getElementById('tents-grid');

    if (eventsContainer) eventsContainer.innerHTML = ''; // clean the container before doing all the operations.
    if (tentsContainer) tentsContainer.innerHTML = ''; // clean also the tents container

    // upload the events in the main page.
    const eventFormData = new FormData(); // container of data that we send to the controller
    eventFormData.append('action', 'getAllEvents'); // call the new controller function. 
    eventFormData.append('sort', sortOrder);

    fetch('../PHP/controller.php', { method: 'POST', body: eventFormData }) //call the php controller to get the events.
    // we told the controller to do a POST action and we send the data.

    // from here php send to js the correct data that js wants.
    .then(r => r.json()) // 'r' is the response
    .then(data => { // the final translated object is called data
        if (data.status === 'success') { // check if everything is correct  
            allEvents = data.events; // list of the events 

            const activeFilterBtn = document.querySelector('.filter-btn.active'); // search the active filter in the page 
            const currentFilter = activeFilterBtn ? activeFilterBtn.innerText.trim() : 'all'; // if there is a btn take his test, if not use 'all'

            renderFilteredEvents('all');  // show all the events in the beginning.
            setupFilters(); // refresh the page based on the category
        }
    });

    // upload the tents in the main page.
    const tentFormData = new FormData(); // we do the same thing for the tents.
    tentFormData.append('action', 'getTents');
    tentFormData.append('sort', sortOrder);

    fetch('../PHP/controller.php', { method: 'POST', body: tentFormData }) // take the tents from the db (call the controller).
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success' && tentsContainer) {
            // if there are some tents, show them.
            if (data.tents && data.tents.length > 0) {
                tentsContainer.innerHTML = data.tents.map(t => renderTentCard(t)).join(''); 
                // for every tent call the function renderTentCard, crate a long string with all the html of the tents
            } else {
                tentsContainer.innerHTML = '<p>No tents available.</p>';
            }
        }
    })
    .catch(err => console.error("Errore tents:", err));

}

function setupFilters() { // set up the filter botton.
    const buttons = document.querySelectorAll('.filter-btn'); // all the element of that class
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            buttons.forEach(b => b.classList.remove('active')); // remove the active class from all buttons.
            this.classList.add('active'); // put the active status at this one
            renderFilteredEvents(this.getAttribute('data-filter')); // show the ewents below at that category.
        });
    });
}

function renderFilteredEvents(filter) { // show the events according to the filter.
    const container = document.getElementById('events-grid');
    if (!container) return; // check

    let filtered = allEvents; 
    const f = filter.toLowerCase(); // lower case to avoid errors

    if (f === 'music') { // if the user click on music, show only the music events.
        filtered = allEvents.filter(e => e.type.toLowerCase().includes('concert') || e.type.toLowerCase().includes('party'));
    } else if (f === 'tradition') {
        filtered = allEvents.filter(e => !e.type.toLowerCase().includes('concert') && !e.type.toLowerCase().includes('party'));
    }

    container.innerHTML = filtered.map(e => renderEventCard(e)).join(''); // create one test with html code.
}

function renderEventCard(event) { // create the card for the events.
    // if the events have a rate, we show it.
    const stars = event.avg_rating ? `⭐ ${event.avg_rating}` : "No ratings yet"; //add the stars

    const countdownId = `timer-${event.id}`; // add the timer for the dinamic countdown (generate ad id)
    setTimeout(() => {
        updateCountdown(countdownId, event.event_date, event.event_time);
    }, 100);

    // in the first line, when we click on the card we go to the event own page.
    return `
        <article class="card" onclick="window.location.href='eventDetails.html?id=${event.id}'" style="cursor: pointer;"> 
            <div class="category">${event.type}</div>
            <h3>${event.title}</h3>
            <div class="rating-badge" style="font-size: 0.85rem; font-weight: bold; color: #444; background: #f0f0f0; padding: 2px 8px; border-radius: 12px;">
                    ${stars}
            </div>

            <div id="${countdownId}" class="event-countdown" style="font-weight: bold; color: #e74c3c; margin: 10px 0;">
                Loading countdown...
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
            card.scrollIntoView({ behavior: 'smooth', block: 'center' }); // scroll the page 

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
    const userId = localStorage.getItem('userId'); // recover the user
    

    const formData = new FormData();
    formData.append('action', 'rateTent');
    formData.append('user_id', userId);
    formData.append('tent_id', tentId);
    formData.append('score', score);

    fetch('../PHP/controller.php', { method: 'POST', body: formData })
    .then(r => r.json()) // r is the answer 
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

function updateCountdown(elementId, dateStr, timeStr) {
    const timerElement = document.getElementById(elementId); // timer id (we create it before)
    if (!timerElement) return;

    // date and hours combination
    const eventDate = new Date(`${dateStr}T${timeStr}`).getTime(); // trasform the date in the variable that we need

    const interval = setInterval(() => { // The code executes itself every 1000 ms so that the page does not need to be reloaded.
        const now = new Date().getTime();
        const distance = eventDate - now;

        // if the event is about the past
        if (distance < 0) {
            timerElement.innerHTML = "Event already done";
            timerElement.style.color = "#888";
            clearInterval(interval);
            return;
        }

        // calculate days hours and minutes
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
            timerElement.innerHTML = `Starts in: ${days} days`;
        } else if (hours > 0) {
            timerElement.innerHTML = `Starts in: ${hours} hours`;
        } else {
            timerElement.innerHTML = `Starts in: ${minutes} minutes`;
        }
    }, 1000); 
}
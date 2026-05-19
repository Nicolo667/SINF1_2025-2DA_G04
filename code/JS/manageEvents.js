document.addEventListener('DOMContentLoaded', () => {
    const eventsGrid = document.getElementById('eventsGrid');
    const logoutBtn = document.getElementById('logoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            const formData = new FormData();
            formData.append('action', 'logout');
            fetch('../PHP/controller.php', { method: 'POST', body: formData })
                .then(response => response.json())
                .then(() => {
                    localStorage.clear();
                    window.location.href = 'mainPage.html';
                })
                .catch(() => {
                    localStorage.clear();
                    window.location.href = 'mainPage.html';
                });
        });
    }

    if (eventsGrid) {
        eventsGrid.addEventListener('click', (e) => {
            const button = e.target.closest('button[data-event-id]');
            if (!button) {
                return;
            }

            const eventId = button.dataset.eventId;

            if (button.classList.contains('delete-btn')) {
                const confirmed = confirm('Do you really want to delete this event?');
                if (!confirmed) {
                    return;
                }
                deleteEvent(eventId);
            }

            if (button.classList.contains('edit-btn')) {
                window.location.href = `editEvent.html?event_id=${encodeURIComponent(eventId)}`;
            }
        });
    }

    loadEvents();
});

// function to load events from the server and display them on the page.
function loadEvents() {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) {
        return;
    }

    const formData = new FormData();
    formData.append('action', 'getEvents');

    fetch('../PHP/controller.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success' && Array.isArray(data.events)) {
            renderEvents(data.events); // render the events on the page.
        } else {
            eventsGrid.innerHTML = `<p class="no-events">${data.message || 'No events found.'}</p>`;
        }
    })
    .catch(error => {
        console.error('Error loading events:', error);
        eventsGrid.innerHTML = '<p class="no-events">Unable to load events right now.</p>';
    });
}

// function to render the events on this page.
function renderEvents(events) {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) {
        return;
    }

    if (events.length === 0) {
        eventsGrid.innerHTML = '<p class="no-events">No events found.</p>';
        return;
    }

    // create the card for each event.
    eventsGrid.innerHTML = events.map(event => `
        <article class="event-card">
            <div class="card-actions">
                <button type="button" class="edit-btn" data-event-id="${event.id}" title="Edit event">✏️</button>
                <button type="button" class="delete-btn" data-event-id="${event.id}" title="Delete event">🗑️</button>
            </div>
            <h3>${event.title}</h3>
            <p><strong>Date:</strong> ${event.event_date}</p>
            <p><strong>Time:</strong> ${event.event_time}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Type:</strong> ${event.type}</p>
            <p>${event.description || ''}</p>
        </article>
    `).join('');
}

// function to delete an event.
function deleteEvent(eventId) {
    const formData = new FormData();
    formData.append('action', 'deleteEvent');
    formData.append('event_id', eventId);

    fetch('../PHP/controller.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert(data.message);
            loadEvents(); // without the deleted event.
        } else {
            alert('Error: ' + (data.message || 'Unable to delete event.'));
        }
    })
    .catch(error => {
        console.error('Error deleting event:', error);
        alert('Unable to delete the event right now.');
    });
}
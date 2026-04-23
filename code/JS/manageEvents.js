document.addEventListener('DOMContentLoaded', async function() {
    await loadEvents();

    // Logout functionality cause in the manageEvent page there is the logout button.
    document.getElementById('logoutBtn').addEventListener('click', async function() {
        const conferma = confirm('Are you sure you want to log out?');
        if (conferma) {
            try {
                const response = await fetch('../PHP/logout.php');
                const data = await response.json();
                if (data.success) {
                    localStorage.removeItem('isLoggedIn');
                    window.location.href = './mainPage.html';
                }
            } catch (err) {
                console.error('Error during logging out:', err);
                window.location.href = './mainPage.html';
            }
        }
    });
});

async function loadEvents() { // this is for load all the events on the page (from the database).
    try {
        console.log('Loading events...');
        const response = await fetch('../PHP/getAdminEvents.php');
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error('HTTP error! status: ' + response.status);
        }
        const events = await response.json();
        console.log('Events received:', events);

        const grid = document.getElementById('eventsGrid');
        grid.innerHTML = '';

        if (events.length === 0) {
            grid.innerHTML = '<div class="no-events"><p>You have not created any events yet.</p></div>';
            return;
        }

        events.forEach(event => {
            const card = document.createElement('div');
            card.className = 'event-card';
            card.innerHTML = `
                <div class="card-actions">
                    <button class="edit-btn" data-event-id="${event.id}">✏️</button> // the edit button.
                    <button class="delete-btn" data-event-id="${event.id}">🗑️</button>
                </div>
                <h3>${event.title}</h3>
                <p><strong>Type:</strong> ${event.type}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                <p><strong>Date:</strong> ${event.date}</p>
                <p><strong>Time:</strong> ${event.time}</p>
                <p><strong>Description:</strong> ${event.description || 'No description'}</p>
            `;
            grid.appendChild(card);
        });

        // Add event listeners to edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => { // creation of the edit button.
            btn.addEventListener('click', function() {
                const eventId = this.getAttribute('data-event-id'); // when click on the edit button we get the event id and then we redirect to the editEvent page.
                window.location.href = `editEvent.html?event_id=${eventId}`;
            });
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async function() {
                const eventId = this.getAttribute('data-event-id');
                const confirmDelete = confirm('Are you sure you want to delete this event? This action cannot be undone.');
                if (confirmDelete) {
                    await deleteEvent(eventId);
                }
            });
        });

    } catch (err) {
        console.error('Error loading events:', err);
        alert('Error loading events: ' + err.message);
    }
}

async function deleteEvent(eventId) { // logif for the delete button, send a request to the deleteEvent.php to delete the event from the database and then reload the events list.
    try {
        const response = await fetch('../PHP/deleteEvent.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event_id: eventId })
        });
        const result = await response.json();
        if (result.success) {
            alert('Event deleted successfully!');
            await loadEvents(); // Reload the events list
        } else {
            alert('Error deleting event: ' + result.message);
        }
    } catch (err) {
        console.error('Error deleting event:', err);
        alert('Connection error while deleting event');
    }
}
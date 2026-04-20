document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('../PHP/session.php');
        const data = await response.json();

        if (!data.loggedIn) {
            window.location.href = './loginPage.html';
            return;
        }

        document.getElementById('fullName').textContent        = data.name || `${data.firstName} ${data.lastName}`;
        document.getElementById('displayUsername').textContent = data.username || '';
        document.getElementById('displayEmail').textContent    = data.email;

    } catch (err) {
        window.location.href = './loginPage.html';
    }

    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = `
        <div class="no-events">
            <p>You are not yet registered for any event.</p>
            <p style="font-size: 0.9rem; color: #666;">Discover the program and join the events!</p>
        </div>
    `;
});

    // Fill User Info
    document.getElementById('fullName').textContent = `${userData.firstName} ${userData.lastName}`;
    document.getElementById('displayUsername').textContent = userData.username;
    document.getElementById('displayEmail').textContent = userData.email;

    // Event List Management
    const eventsList = document.getElementById('eventsList');

    if (myEvents.length === 0) {
        // If there are no events
        eventsList.innerHTML = `
            <div class="no-events">
                <p>You are not yet registered for any event.</p>
                <p style="font-size: 0.9rem; color: #666;">Discover the program and join the events!</p>
            </div>
        `;
    } else {
        eventsList.innerHTML = '';
        // If there are events, we create the cards
        myEvents.forEach(event => {
            eventsList.innerHTML += `
                <div class="card">
                    <span class="category">${event.type}</span>
                    <h3>${event.title}</h3>
                    <p>📍 ${event.location}</p>
                    <p>⏰ ${event.date}, ${event.time}</p>
                </div>
            `;
        });
    }
});

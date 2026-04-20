document.addEventListener('DOMContentLoaded', function() {
    // User data simulation (in the future it will come from the DB)
    const userData = {
        firstName: "Mario",
        lastName: "Rossi",
        username: "mario_2026",
        email: "mario.rossi@esempio.it"
    };

    // array of events 
    const myEvents = [
         { 
            title: "Cortejo Académico", 
            date: "12 Maggio 2026", 
            location: "Baixa, Porto",
            type: "Tradition"
            
        },
        { 
            title: "Noite no Queimódromo", 
            date: "15 Maggio 2026", 
            location: "Estrada da Circunvalação",
            type: "Music"
        }
        
    ];

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
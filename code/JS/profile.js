document.addEventListener('DOMContentLoaded', () => {
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('userName'); // Defined as 'name'
    const lastName = localStorage.getItem('userLastName');
    const email = localStorage.getItem('userEmail');
    const username = localStorage.getItem('userUsername');

    const fullNameElement = document.getElementById('fullName');
    const usernameElement = document.getElementById('displayUsername');
    const emailElement = document.getElementById('displayEmail');

    
    if (fullNameElement) {
        fullNameElement.textContent = (name && lastName) ? `${name} ${lastName}` : "User Profile";
    }
    if (usernameElement) {
        usernameElement.textContent = username || "username";
    }
    if (emailElement) {
        emailElement.textContent = email || "email@example.com";
    }

    // role pages.
    const adminView = document.getElementById('adminView'); 
    const studentView = document.getElementById('studentView');

    if (role === 'admin' || role === 'administrator') {
        if (adminView) adminView.style.display = 'block';
        if (studentView) studentView.style.display = 'none';
    } else {
        if (adminView) adminView.style.display = 'none';
        if (studentView) studentView.style.display = 'block';
    }

    //Logout functionality
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

    // load events for admin.
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.btn-admin');

        if (target && target.classList.contains('add')) {
            console.log("Redirecting to addEvent.html...");
            window.location.href = 'addEvent.html';
        }

        if (target && target.classList.contains('edit')) { 
            window.location.href = 'manageEvents.html'; // redirect to the manage page.
        }
    });
    
    //Load events
    if (typeof loadEvents === "function") {
        loadEvents();
    }
});

function loadEvents() {
    const eventsList = document.getElementById('eventsList');
    if (!eventsList) return;

    const formData = new FormData();
    formData.append('action', 'getUserAgenda');

    fetch('../PHP/controller.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            eventsList.innerHTML = ''; 
            
            if (data.events.length === 0) {
                eventsList.innerHTML = '<p>You haven\'t registered for any events yet.</p>';
                return;
            }

            data.events.forEach(event => {
                const card = document.createElement('div');
                card.className = 'card event-card-profile'; 
                card.innerHTML = `
                        <div class="card-content" onclick="window.location.href='eventDetails.html?id=${event.id}'" >
                            <span class="category">${event.type}</span>
                            <h3>${event.title}</h3>
                            <p><i class="fa fa-calendar"></i> ${event.event_date}</p>
                            <p><i class="fa fa-map-marker"></i> ${event.location}</p>
                            <button class="btn-delete" onclick="removeRegistration(${event.id})">
                                Remove Registration
                            </button>
                        </div>
                `;
                eventsList.appendChild(card);
            });
        }
    })
    .catch(error => console.error("Error loading agenda:", error));
}

// global function to remove an event
window.removeRegistration = function(eventId) {
    if (!confirm("Are you sure you want to remove this registration?")) return;

    const formData = new FormData();
    formData.append('action', 'removeFromAgenda');
    formData.append('event_id', eventId);

    fetch('../PHP/controller.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            loadEvents(); // Refresh the events list.
        } else {
            alert(data.message);
        }
    });

    
};

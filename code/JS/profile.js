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

    checkUpcomingNotifications();

    // import csv file.
    const importBtn = document.getElementById('importCsvBtn');
    const fileInput = document.getElementById('csvFileInput');

    // open the selector for file 
    if (importBtn && fileInput) {
        importBtn.addEventListener('click', () => fileInput.click());

        // when a user select a file
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const formData = new FormData();
                formData.append('action', 'importArtistsCsv');
                formData.append('csvFile', this.files[0]);

                // call the controller.
                fetch('../PHP/controller.php', {
                    method: 'POST',
                    body: formData
                })
                .then(r => r.json())
                .then(data => {
                    alert(data.message);
                    fileInput.value = ''; // reset the imput
                })
                .catch(err => {
                    console.error("Error:", err);
                    alert("error during upload.");
                });
            }
        });
    }

    //function for the export btn (for the user agenda)
    const exportBtn = document.getElementById('exportAgendaBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            // create a form for the download
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '../PHP/controller.php';

            const actionInput = document.createElement('input');
            actionInput.type = 'hidden';
            actionInput.name = 'action';
            actionInput.value = 'exportUserAgenda';

            form.appendChild(actionInput);
            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
        });
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
                const stars = event.avg_rating ? `⭐ ${event.avg_rating}` : "No ratings yet"; //add the stars also in the profile page
                card.className = 'card event-card-profile'; 

                const countdownId = `timer-${event.id}`; // add the timer for the dinamic countdown
                setTimeout(() => {
                    updateCountdown(countdownId, event.event_date, event.event_time);
                }, 100);

                card.innerHTML = `
                        <div class="card-content" onclick="window.location.href='eventDetails.html?id=${event.id}'" >
                            <span class="category">${event.type}</span>
                            <h3>${event.title}</h3>
                            <div class="rating-badge" style="font-size: 0.85rem; font-weight: bold; color: #444; background: #f0f0f0; padding: 2px 8px; border-radius: 12px;">
                                    ${stars}
                            </div>
                            <div id="${countdownId}" class="event-countdown" style="font-weight: bold; color: #e74c3c; margin: 10px 0;">
                                Loading countdown...
                            </div>
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

function checkUpcomingNotifications() {

    const formData = new FormData();
    formData.append('action', 'checkUpcomingEvents');

    // call the controller
    fetch('../PHP/controller.php', {
        method: 'POST',
        body: formData
    })
    .then(r => {
        if (!r.ok) {
            throw new Error("errer" +  r.status);
        }
        return r.json();
    })

    .then(data => {
        console.log("Data received:", data);

        // create the alert
        if (data.status === 'success') {
            if (data.events && data.events.length > 0) {
                let message = "UPCOMING EVENTS (Next 48h):\n\n";
                data.events.forEach(ev => {
                    message += `- ${ev.title}`;
                });
                alert(message);
            }
        } else {
            alert("Server Error: " + data.message);
        }
    })
    .catch(err => {
        console.error("Fetch error:", err);
        alert("Connection Error: " + err.message);
    });
}

function updateCountdown(elementId, dateStr, timeStr) {
    const timerElement = document.getElementById(elementId);
    if (!timerElement) return;

    // date and hours combination
    const eventDate = new Date(`${dateStr}T${timeStr}`).getTime();

    const interval = setInterval(() => {
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
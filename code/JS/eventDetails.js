document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    console.log("ID retrieved from URL:", eventId); 

    if (eventId) {
        fetchEventDetails(eventId);
        setupStarRating(eventId);
        fetchRatings(eventId);
    } else {
        console.error("No id found in URL");
        document.getElementById('event-detail-content').innerHTML = "<p>Error: Event ID missing.</p>";
    }

    // logic for the registration to an event.
    const registerBtn = document.getElementById('btn-register');
    const role = localStorage.getItem('userRole');

    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            if (role !== 'user') {
                alert("Only users can register for events.");
                return;
            }

            const formData = new FormData();
            formData.append('action', 'addToAgenda');
            formData.append('event_id', eventId);

            fetch('../PHP/controller.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert("Registered successfully!");
                    window.location.href = 'profile.html'; 
                } else {
                    alert(data.message);
                }
            })
            .catch(error => console.error("Error:", error));
        });
    }
});

// take all the info of an event from the db.
function fetchEventDetails(id) {
    const formData = new FormData();
    formData.append('action', 'getAllEvents');
    formData.append('id', id); // send id to controller.

    fetch('../PHP/controller.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {

        if (data.status === 'success') {
            // data.event contains all the data for the event.
            renderEventDetail(data.event);

            // show the artists if the events have some
            if (data.artists && data.artists.length > 0) {
                renderArtists(data.artists);
            }
        } else {
            console.error("Error:", data.message);
            document.getElementById('event-detail-content').innerHTML = `<p>Error: ${data.message}</p>`;
        }
    })
    .catch(error => {
        console.error("Error in fetching:", error);
    });
}

// takethe data from db and create the structure of the event page.
function renderEventDetail(event) {
    const container = document.getElementById('event-detail-content');
    
    // use the same class of the css file.
    container.innerHTML = `
        <article class="card" style="border-top-color: var(--accent); cursor: default;">
            <span class="category">${event.type}</span>
            <h1 style="color: var(--primary); margin: 1rem 0;">${event.title}</h1>
            
            <div style="margin: 1.5rem 0; font-size: 1rem; color: #444;">
                <p style="margin: 0.5rem 0;"><i class="fa fa-calendar"></i> <strong>Date:</strong> ${event.event_date}</p>
                <p style="margin: 0.5rem 0;"><i class="fa fa-clock-o"></i> <strong>Time:</strong> ${event.event_time.substring(0,5)}</p>
                <p style="margin: 0.5rem 0;"><i class="fa fa-map-marker"></i> <strong>Location:</strong> ${event.location}</p>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 1.5rem 0;">
            
            <div class="event-description">
                <h3 style="margin-bottom: 0.5rem;">About this event</h3>
                <p style="line-height: 1.8; color: #555;">${event.description || 'No description available for this event.'}</p>
            </div>
        </article>
    `;
}

// same for the artist.
function renderArtists(artists) {
    const section = document.getElementById('lineup-section');
    const grid = document.getElementById('event-artists-grid');

    section.style.display = 'block';
    grid.innerHTML = ''; // clen the grid.

    artists.forEach(artist => {
        const artistCard = document.createElement('div');
        artistCard.className = 'artist-card';
        artistCard.style.borderTopColor = 'var(--primary)'; 
        const imgSource = artist.image_path ? `../../${artist.image_path}` : '../../default_artist.jpg';
        
        artistCard.innerHTML = `
            <div class="artist-image-container">
                <img src="${imgSource}" alt="${artist.name}" class="artist-img">
            </div>
            <div class="artist-content">
                <span class="genre-badge">${artist.genre}</span>
                <h2 class="artist-name">${artist.name}</h2>
                <p class="bio-text">${artist.bio}</p>
            </div>
        `;
        grid.appendChild(artistCard);
    });
}

function setupStarRating(eventId) {
    const stars = document.querySelectorAll('#starRating span');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const score = this.getAttribute('data-value');
            const commentText = document.getElementById('eventComment').value; // we take also the comment
            
            const formData = new FormData();
            formData.append('action', 'rateEvent');
            formData.append('event_id', eventId); 
            formData.append('score', score);
            formData.append('comment', commentText); // add the comment to the request

            fetch('../PHP/controller.php', { method: 'POST', body: formData })
            .then(r => r.json())
            .then(data => {
                if (data.status === 'success') {
                    alert(data.message);
                    location.reload(); // new averange
                    window.location.href = 'profile.html';
                } else {
                    alert(data.message); // error if a user isn't registered for that event.
                }
            });
        });

        star.addEventListener('mouseover', () => highlightStars(star.getAttribute('data-value')));
        star.addEventListener('mouseleave', resetStars);
    });

    function highlightStars(val) {
        stars.forEach(s => {
            s.innerText = s.getAttribute('data-value') <= val ? '★' : '☆'; // how the stars change
            s.style.color = s.getAttribute('data-value') <= val ? '#ffb81c' : '#ccc';
        });
    }

    function resetStars() {
        stars.forEach(s => { s.innerText = '☆'; s.style.color = '#ccc'; });
    }

}

function fetchRatings(eventId) {
    const formData = new FormData();
    formData.append('action', 'getEventRatings');
    formData.append('id', eventId);

    fetch('../PHP/controller.php', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(ratings => {
        renderRatings(ratings);
    });
}

function renderRatings(ratings) {
    const container = document.getElementById('reviews-container');
    if (ratings.length === 0) {
        container.innerHTML = '<p>No reviews yet. Be the first to rate this event!</p>';
        return;
    }

    container.innerHTML = ratings.map(r => `
        <div class="card" style="margin-bottom: 1rem; border-left: 5px solid var(--primary);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong>${r.username}</strong>
                <span style="color: #ffb81c;">${'★'.repeat(r.score)}${'☆'.repeat(5 - r.score)}</span>
            </div>
            <p style="margin: 0.5rem 0; color: #555;">${r.comment || '<em>No comment left.</em>'}</p>
            <small style="color: #999;">${new Date(r.created_at).toLocaleDateString()}</small>
        </div>
    `).join('');
}
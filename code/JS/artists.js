document.addEventListener('DOMContentLoaded', () => {
    fetchArtists();
});

function fetchArtists() { // function that get all the artists and put them on the page.
    const formData = new FormData();
    formData.append('action', 'getArtists'); 

    fetch('../PHP/controller.php', { // send the request to the controller 
        method: 'POST',
        body: formData
    })
    .then(response => response.json()) // response should be a json.
    .then(data => {
        if (data.status === 'success') {
            renderArtists(data.artists);
        } else {
            console.error('Error:', data.message);
        }
    })
    .catch(error => console.error('Fetch error:', error));
}

function renderArtists(artists) { // create the card for the artists and put it on the html page.
    const container = document.getElementById('artists-container'); // the container where we put the cards
    container.innerHTML = ''; 

    artists.forEach(artist => {
        const artistCard = document.createElement('div'); // create a card for every artist.
        artistCard.className = 'artist-card';
        
        // content of the card.
        artistCard.innerHTML = ` 
            <div class="card-header"> 
                <h2 class="artist-name">${artist.name}</h2>
                <span class="genre-badge">${artist.genre}</span>
            </div>
            <hr>
            <div class="card-body">
                <p><strong>Biography:</strong></p>
                <p class="bio-text">${artist.bio}</p>
            </div>
        `;
        container.appendChild(artistCard); // add the card to the container.
    });
}
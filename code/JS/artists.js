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

        // take the image
        const imgSource = artist.image_path ? `../../${artist.image_path}` : '../../default_artist.jpg';
        
        // content of the card.
        artistCard.innerHTML = ` 
            <div class="artist-image-container">
                <img src="${imgSource}" alt="${artist.name}" class="artist-img">
            </div>
            <div class="artist-content">
                <span class="genre-badge">${artist.genre}</span>
                <h2 class="artist-name">${artist.name}</h2>
                <p class="bio-text">${artist.bio || 'Biography not available.'}</p>
            </div>
        `;
        container.appendChild(artistCard); // add the card to the container.
    });
}
document.addEventListener('DOMContentLoaded', () => {
    const editEventForm = document.getElementById('editEventForm');
    const eventIdInput = document.getElementById('eventId');
    const titleInput = document.getElementById('title');
    const dateInput = document.getElementById('eventDate');
    const timeInput = document.getElementById('eventTime');
    const locationInput = document.getElementById('location');
    const typeInput = document.getElementById('type');
    const descriptionInput = document.getElementById('description');

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event_id');

    if (!eventId) {
        alert('Missing event id.');
        window.location.href = 'manageEvents.html';
        return;
    }

    fetchEvent(eventId);

    if (editEventForm) {
        editEventForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // the new value of the event.
            const formData = new FormData();
            formData.append('action', 'updateEvent');
            formData.append('event_id', eventId);
            formData.append('title', titleInput.value.trim());
            formData.append('event_date', dateInput.value);
            formData.append('event_time', timeInput.value);
            formData.append('location', locationInput.value.trim());
            formData.append('type', typeInput.value);
            formData.append('description', descriptionInput.value.trim());

            fetch('../PHP/controller.php', { // send the data to the controller.
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert(data.message); // shoe a success message.
                    window.location.href = 'manageEvents.html'; 
                } else {
                    alert('Error: ' + (data.message || 'Unable to update event.'));
                }
            })
            .catch(error => {
                console.error('Error updating event:', error);
                alert('Unable to update the event right now.');
            });
        });
    }
});

function fetchEvent(eventId) { // function to fetch the event data from the server.
    const formData = new FormData();
    formData.append('action', 'getEvent');
    formData.append('event_id', eventId);

    fetch('../PHP/controller.php', { // call the controller.
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success' && data.event) { // if the event is found.
            populateForm(data.event); // populate the form with the event data.
        } else {
            alert('Error: ' + (data.message || 'Event not found.'));
            window.location.href = 'manageEvents.html';
        }
    })
    .catch(error => {
        console.error('Error loading event:', error);
        alert('Unable to load the event data.');
        window.location.href = 'manageEvents.html';
    });
}

// function to populate the form with the event data.
function populateForm(event) {
    const eventIdInput = document.getElementById('eventId'); // all the data of the event.
    const titleInput = document.getElementById('title');
    const dateInput = document.getElementById('eventDate');
    const timeInput = document.getElementById('eventTime');
    const locationInput = document.getElementById('location');
    const typeInput = document.getElementById('type');
    const descriptionInput = document.getElementById('description');
 
    // set the value of the form inputs with the event data.
    if (eventIdInput) eventIdInput.value = event.id;
    if (titleInput) titleInput.value = event.title;
    if (dateInput) dateInput.value = event.event_date;
    if (timeInput) timeInput.value = event.event_time;
    if (locationInput) locationInput.value = event.location;
    if (typeInput) typeInput.value = event.type;
    if (descriptionInput) descriptionInput.value = event.description;
}
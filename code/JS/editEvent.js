document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event_id');

    if (!eventId) { // there could be an event id in the url.
        alert('Event ID not provided');
        window.location.href = 'manageEvents.html';
        return;
    }

    document.getElementById('eventId').value = eventId;

    try { // here load the event data from the database.
        const response = await fetch(`../PHP/getEvent.php?event_id=${eventId}`); // recall the getEvent.php file to get the event data from the database.
        const event = await response.json();

        if (event.error) { // if there is an error e.g. the event doent exist, show an alert.
            alert(event.error);
            window.location.href = 'manageEvents.html';
            return;
        }

        // event data. 
        document.getElementById('title').value = event.title;
        document.getElementById('eventDate').value = event.event_date;
        document.getElementById('eventTime').value = event.event_time;
        document.getElementById('location').value = event.location;
        document.getElementById('type').value = event.type;
        document.getElementById('description').value = event.description || '';
    } catch (err) {
        console.error('Error loading event:', err);
        alert('Error loading event');
        window.location.href = 'manageEvents.html';
    }
});

// submit the form to update an event in database.
document.getElementById('editEventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('../PHP/updateEvent.php', { // use the php file to update the database
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) { // if the update is successful show an alert and go back to the manage events page.
            alert('Event updated successfully!');
            window.location.href = 'manageEvents.html';
        } else {
            alert('Error: ' + result.message);
        }
    } catch (err) {
        alert('Connection error');
    }
});
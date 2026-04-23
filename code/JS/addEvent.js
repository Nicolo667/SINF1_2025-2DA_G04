document.getElementById('addEventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('../PHP/saveEvent.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            alert('Event created successfully!');
            window.location.href = 'profile.html';
        } else {
            alert('Error: ' + result.message);
        }
    } catch (err) {
        alert('Connection error');
    }
});

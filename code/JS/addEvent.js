document.addEventListener('DOMContentLoaded', () => {
    const eventForm = document.querySelector('form');

    if (!eventForm) {
        return;
    }

    eventForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append('action', 'createEvent');

        const textInputs = eventForm.querySelectorAll('input[type="text"]');
        const dateInput = eventForm.querySelector('input[type="date"]');
        const timeInput = eventForm.querySelector('input[type="time"]');
        const descriptionInput = eventForm.querySelector('textarea');
        const typeSelect = eventForm.querySelector('select');

        formData.append('title', textInputs[0] ? textInputs[0].value.trim() : '');
        formData.append('description', descriptionInput ? descriptionInput.value.trim() : '');
        formData.append('date', dateInput ? dateInput.value : '');
        formData.append('time', timeInput ? timeInput.value : '');
        formData.append('location', textInputs[1] ? textInputs[1].value.trim() : '');
        formData.append('type', typeSelect ? typeSelect.value : 'Other');

        fetch('../PHP/controller.php', { // send the data to the controller
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert(data.message);
                window.location.href = 'profile.html';
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Critical error: could not save the event.');
        });
    });
});
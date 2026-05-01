document.addEventListener('DOMContentLoaded', () => {
    const editForm = document.getElementById('editProfileForm');

    // Pre-fill data
    document.getElementById('first_name').value = localStorage.getItem('userName') || '';
    document.getElementById('last_name').value = localStorage.getItem('userLastName') || '';
    document.getElementById('username').value = localStorage.getItem('userUsername') || '';
    document.getElementById('email').value = localStorage.getItem('userEmail') || '';

    // Submit changes
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(editForm);
            formData.append('action', 'updateProfile');

            fetch('../PHP/controller.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert("Profile updated successfully!");
                    
                    // Update localStorage
                    localStorage.setItem('userName', document.getElementById('first_name').value);
                    localStorage.setItem('userLastName', document.getElementById('last_name').value);
                    localStorage.setItem('userUsername', document.getElementById('username').value);
                    localStorage.setItem('userEmail', document.getElementById('email').value);
                    
                    window.location.href = 'profile.html';
                } else {
                    alert("Error: " + data.message);
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("A communication error occurred.");
            });
        });
    }
});
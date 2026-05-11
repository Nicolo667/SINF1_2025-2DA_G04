document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData();
            formData.append('action', 'login'); // This matches the case in controller.php so the controller understands it is a login request.
            formData.append('email', document.getElementById('email').value);
            formData.append('password', document.getElementById('password').value);

            //call controller
            fetch('../PHP/controller.php', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network error or file not found');
                }
                return response.json();
            })
            .then(data => {

                if (data.status === 'success') {
                    // Save user info locally to use them in profile.html
                    localStorage.setItem('userId', data.id); // add the user id.
                    localStorage.setItem('userRole', data.role);
                    localStorage.setItem('userName', data.firstName);
                    localStorage.setItem('userLastName', data.lastName);
                    localStorage.setItem('userEmail', data.email);
                    localStorage.setItem('userUsername', data.username);
                    
                    // Redirect to your single profile page
                    window.location.href = 'profile.html';
                } else {
                    alert("Error: " + data.message);
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                alert("Critical error: Make sure you are using XAMPP/Apache and not Live Server.");
            });
        });
    }
});

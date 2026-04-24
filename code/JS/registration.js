document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('registrationForm');
    const roleSelect = document.getElementById('role');
    const adminCodeGroup = document.getElementById('adminCodeGroup');

    roleSelect.addEventListener('change', function() {
        adminCodeGroup.style.display = (this.value === 'admin') ? 'block' : 'none';
    });

    registrationForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // create a formatData object.
        const formData = new FormData();
        formData.append('action', 'register');
        formData.append('username', document.getElementById('username').value);
        formData.append('firstName', document.getElementById('firstName').value);
        formData.append('lastName', document.getElementById('lastName').value);
        formData.append('birthDate', document.getElementById('birthDate').value);
        formData.append('email', document.getElementById('email').value);
        formData.append('password', document.getElementById('password').value);
        formData.append('role', document.getElementById('role').value);
        
        if (document.getElementById('role').value === 'admin') {
            formData.append('adminCode', document.getElementById('adminCode').value);
        }

        fetch('../PHP/controller.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert(data.message);
                window.location.href = 'loginPage.html';
            } else {
                alert("Error: " + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Error during registration.");
        });
    });
});
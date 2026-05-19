document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('registrationForm');
    const roleSelect = document.getElementById('role');
    const adminCodeGroup = document.getElementById('adminCodeGroup');

    roleSelect.addEventListener('change', function() { // change attribute means that this happened when we chandge the value of the role box
        adminCodeGroup.style.display = (this.value === 'admin') ? 'block' : 'none'; 
        // if i select 'admin' role -> make the secret code text box visible
    });

    registrationForm.addEventListener('submit', function(e) { // when we submit the form 
        e.preventDefault(); // block the normal behavior, js has the control

        const emailValue = document.getElementById('email').value;
        // check the email format.
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(emailValue)) {
            alert("Please enter a valid email address (e.g., name@example.com). It must contain '@' and a '.' after it.");
            return; 
        }

        // if the email is correct
        // create a formatData object with all the informations.
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
            formData.append('adminCode', document.getElementById('adminCode').value); // only if therole is admin cause the users don't have it 
        }

        fetch('../PHP/controller.php', {method: 'POST', body: formData })
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
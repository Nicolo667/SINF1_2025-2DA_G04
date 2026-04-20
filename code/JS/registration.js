document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // all the variables
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('emailError');
    const passwordInput = document.getElementById('password');
    
    const emailValue = emailInput.value.trim();
    const passValue = passwordInput.value;
    
    const username = document.getElementById('username').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const birthDate = document.getElementById('birthDate').value;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check the email
    if (!emailPattern.test(emailValue)) {
        emailError.textContent = "Please enter a valid email address (e.g., name@domain.com)";
        emailInput.style.borderColor = "red";
        return; 
    }

    // Reset style of error message
    emailError.textContent = "";
    emailInput.style.borderColor = "var(--accent)";

    // final check
    if (username && firstName && lastName && birthDate && emailValue && passValue) {
        alert("success!");
        
        window.location.href = 'profile.html'; 
    }
});
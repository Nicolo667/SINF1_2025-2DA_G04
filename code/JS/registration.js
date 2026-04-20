document.getElementById('registrationForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const emailInput  = document.getElementById('email');
    const emailError  = document.getElementById('emailError');
    const emailValue  = emailInput.value.trim();
    const passValue   = document.getElementById('password').value;
    const username    = document.getElementById('username').value.trim();
    const firstName   = document.getElementById('firstName').value.trim();
    const lastName    = document.getElementById('lastName').value.trim();
    const birthDate   = document.getElementById('birthDate').value;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailValue)) {
        emailError.textContent = "Please enter a valid email address (e.g., name@domain.com)";
        emailInput.style.borderColor = "red";
        return;
    }
    emailError.textContent = "";
    emailInput.style.borderColor = "";

    try {
        const response = await fetch('../PHP/register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, firstName, lastName, birthDate, email: emailValue, password: passValue })
        });

        const data = await response.json();

        if (data.success) {
            window.location.href = './profile.html';
        } else {
            emailError.textContent = data.message || "Registration failed. Please try again.";
            emailInput.style.borderColor = "red";
        }
    } catch (err) {
        emailError.textContent = "Connection error. Please try again.";
    }
});
